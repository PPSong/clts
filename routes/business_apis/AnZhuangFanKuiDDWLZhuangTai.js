import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class AnZhuangFanKuiDDWLZhuangTai extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    // WYWLPayloads:
    // [{
    // id: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { DDId, GTId, WYWLPayloads } = req.body;

    // 检查AZFKType
    const errorAZFKType = WYWLPayloads.filter(item => !Object.values(DBTables.AZFKType).includes(item.AZFKType));
    if (errorAZFKType.length > 0) {
      throw new Error(`${JSON.stringify(errorAZFKType)}中反馈状态有误!`);
    }
    // end 检查AZFKType
  }

  static async mainProcess(req, res, next, user, transaction) {
    // WYWLPayloads:
    // [{
    // uuid: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { DDId, GTId, WYWLPayloads } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids的存在
    const uuids = WYWLPayloads.map(item => item.uuid);
    const tmpWYWLs = await ppUtils.checkUUIDsExistanceAndGetRecords(
      'WYWL',
      uuids,
      transaction,
    );
    // end 检查ids的存在

    // 检查是否属于当前用户的任务范围
    for (const item of tmpWYWLs) {
      const tmpDDGTWL = await item.getDD_GT_WL({ transaction });
      await user.checkDD_GT_WLId(tmpDDGTWL.id, transaction);
    }
    // end 检查是否属于当前用户的任务范围

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 反馈
    for (const item of WYWLPayloads) {
      const tmpWYWL = tmpWYWLs.find(WYWL => WYWL.uuid === item.uuid);
      if (item.AZFKType === DBTables.AZFKType.AZCG) {
        // 成功反馈
        if (tmpWYWL.status !== DBTables.WYWLStatus.SH) {
          throw new Error(`${tmpWYWL}状态不是${DBTables.WYWLStatus.SH}, 不能递交成功反馈`);
        }
        await ppUtils.changeWYWLsStatus({
          ids: [tmpWYWL.id],
          status: DBTables.WYWLStatus.FK,
          user,
          transaction,
          AZFKType: DBTables.AZFKType.AZCG,
          imageUrl: item.imageUrl,
        });
      } else {
        // 失败反馈
        await ppUtils.changeWYWLsStatus({
          ids: [tmpWYWL.id],
          status: DBTables.WYWLStatus.FK,
          user,
          transaction,
          AZFKType: item.AZFKType,
          imageUrl: item.imageUrl,
        });
      }
    }
    // end 反馈

    // 检查用户所属的当前DD_GT任务是否都已反馈, 可进入'可拍全景图'
    // 检查是否是操作者在本DD_GT的所有任务
    let tmpWhere;
    if (user.JS === DBTables.JS.AZG) {
      tmpWhere = {
        DDId,
        GTId,
        AZGUserId: user.id,
      };
    } else if (user.JS === DBTables.JS.GTBA) {
      tmpWhere = {
        DDId,
        GTId,
        AZGSId: null,
      };
    } else {
      throw new Error('没有权限!');
    }

    const noImageUrlTargetWYWLs = await DBTables.WYWL.findAll({
      include: [
        {
          model: DBTables.DD_GT_WL,
          as: 'DD_GT_WL',
          where: tmpWhere,
        },
      ],
      where: {
        imageUrl: null,
      },
      transaction,
    });

    if (noImageUrlTargetWYWLs.length === 0) {
      await DBTables.DD_GT_WL.update(
        {
          status: DBTables.DD_GT_WLStatus.KPQJT,
        },
        {
          where: tmpWhere,
          transaction,
        },
      );
    }

    // end 检查用户所属的当前DD_GT任务是否都已反馈, 可进入'可拍全景图'
  }
}
