import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class AnZhuangFanKuiDDDPZhuangTai extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    // WYDPPayloads:
    // [{
    // uuid: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { DDId, GTId, WYDPPayloads } = req.body;

    // 检查AZFKType
    const errorAZFKType = WYDPPayloads.filter(item => !Object.values(DBTables.AZFKType).includes(item.AZFKType));
    if (errorAZFKType.length > 0) {
      throw new Error(`${errorAZFKType}中反馈状态有误!`);
    }
    // end 检查AZFKType
  }

  static async mainProcess(req, res, next, user, transaction) {
    // WYDPPayloads:
    // [{
    // id: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { DDId, GTId, WYDPPayloads } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids的存在
    const uuids = WYDPPayloads.map(item => item.uuid);
    const tmpWYDPs = await ppUtils.checkUUIDsExistanceAndGetRecords(
      'WYDP',
      uuids,
      transaction,
    );
    // end 检查ids的存在

    // 检查是否属于当前用户的任务范围
    for (const item of tmpWYDPs) {
      const tmpDDDWDP = await item.getDD_DW_DP({ transaction });
      await user.checkDD_DW_DPId(tmpDDDWDP.id, transaction);
    }
    // end 检查是否属于当前用户的任务范围

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 反馈
    for (const item of WYDPPayloads) {
      const tmpWYDP = tmpWYDPs.find(WYDP => WYDP.uuid === item.uuid);
      if (item.AZFKType === DBTables.AZFKType.AZCG) {
        // 成功反馈
        if (tmpWYDP.status !== DBTables.WYDPStatus.SH) {
          throw new Error(`${tmpWYDP}状态不是${DBTables.WYDPStatus.SH}, 不能递交成功反馈`);
        }
        await ppUtils.changeWYDPsStatus({
          ids: [tmpWYDP.id],
          status: DBTables.WYDPStatus.FK,
          user,
          transaction,
          AZFKType: DBTables.AZFKType.AZCG,
          imageUrl: item.imageUrl,
        });
      } else {
        // 失败反馈
        await ppUtils.changeWYDPsStatus({
          ids: [tmpWYDP.id],
          status: DBTables.WYDPStatus.FK,
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
        AZGUserId: user.id,
      };
    } else if (user.JS === DBTables.JS.GTBA) {
      tmpWhere = {
        DDId,
        AZGSId: null,
      };
    } else {
      throw new Error('没有权限!');
    }

    const noImageUrlTargetWYDPs = await DBTables.WYDP.findAll({
      include: [
        {
          model: DBTables.DD_DW_DP,
          as: 'DD_DW_DP',
          where: tmpWhere,
          include: [
            {
              model: DBTables.DW,
              as: 'DW',
              where: {
                GTId,
              },
            },
          ],
        },
      ],
      where: {
        imageUrl: null,
      },
      transaction,
    });

    if (noImageUrlTargetWYDPs.length === 0) {
      DBTables.DD_DW_DP.update(
        {
          status: DBTables.DD_DW_DPStatus.KPQJT,
        },
        {
          where: tmpWhere,
        },
      );
    }

    // end 检查用户所属的当前DD_GT任务是否都已反馈, 可进入'可拍全景图'
  }
}
