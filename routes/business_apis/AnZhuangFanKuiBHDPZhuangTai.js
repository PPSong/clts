import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class AnZhuangFanKuiBHWLZhuangTai extends BusinessApiBase {
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
    const { WYWLPayloads } = req.body;

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
    // id: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { WYWLPayloads } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids的存在
    const ids = WYWLPayloads.map(item => item.id);
    const tmpWYWLs = await ppUtils.checkIdsExistanceAndGetRecords(
      'WYWL',
      ids,
      transaction,
    );
    // end 检查ids的存在

    // 检查是否属于当前用户的任务范围
    for (const item of tmpWYWLs) {
      if (!item.WLBHId) {
        throw new Error(`${item}不属于物料补货!`);
      }
      const tmpWLBH = await item.getWLBH({ transaction });
      await user.checkWLBHId(tmpWLBH.id, transaction);
    }
    // end 检查是否属于当前用户的任务范围

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 反馈
    for (const item of WYWLPayloads) {
      const tmpWYWL = tmpWYWLs.find(WYWL => WYWL.id === item.id);
      if (item.AZFKType === DBTables.AZFKType.AZCG) {
        // 成功反馈
        if (tmpWYWL.status !== DBTables.WYWLStatus.SH) {
          throw new Error(`${tmpWYWL}状态不是${DBTables.WYWLStatus.SH}, 不能递交成功反馈`);
        }
        await ppUtils.changeWYWLsStatus({
          ids: [item.id],
          status: DBTables.WYWLStatus.FK,
          user,
          transaction,
          AZFKType: DBTables.AZFKType.AZCG,
          imageUrl: item.imageUrl,
        });
      } else {
        // 失败反馈
        await ppUtils.changeWYWLsStatus({
          ids: [item.id],
          status: DBTables.WYWLStatus.FK,
          user,
          transaction,
          AZFKType: item.AZFKType,
          imageUrl: item.imageUrl,
        });
      }
      const tmpWLBH = await tmpWYWL.getWLBH({ transaction });
      await tmpWLBH.update(
        {
          status: DBTables.WLBHStatus.WC,
        },
        {
          transaction,
        },
      );
    }
    // end 反馈
  }
}
