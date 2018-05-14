import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class AnZhuangFanKuiBHDPZhuangTai extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    // WYDPPayloads:
    // [{
    // id: 1,
    // AZFKType: '安装成功',
    // imageUrl: 'xxxx'
    // }]
    const { WYDPPayloads } = req.body;

    // 检查AZFKType
    const errorAZFKType = WYDPPayloads.filter(item => !Object.values(DBTables.AZFKType).includes(item.AZFKType));
    if (errorAZFKType.length > 0) {
      throw new Error(`${JSON.stringify(errorAZFKType)}中反馈状态有误!`);
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
    const { WYDPPayloads } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids的存在
    const ids = WYDPPayloads.map(item => item.id);
    const tmpWYDPs = await ppUtils.checkIdsExistanceAndGetRecords(
      'WYDP',
      ids,
      transaction,
    );
    // end 检查ids的存在

    // 检查是否属于当前用户的任务范围
    for (const item of tmpWYDPs) {
      if (!item.DPBHId) {
        throw new Error(`${item}不属于灯片补货!`);
      }
      const tmpDPBH = await item.getDPBH({ transaction });
      await user.checkDPBHId(tmpDPBH.id, transaction);
    }
    // end 检查是否属于当前用户的任务范围

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 反馈
    for (const item of WYDPPayloads) {
      const tmpWYDP = tmpWYDPs.find(WYDP => WYDP.id === item.id);
      if (item.AZFKType === DBTables.AZFKType.AZCG) {
        // 成功反馈
        if (tmpWYDP.status !== DBTables.WYDPStatus.SH) {
          throw new Error(`${tmpWYDP}状态不是${DBTables.WYDPStatus.SH}, 不能递交成功反馈`);
        }
        await ppUtils.changeWYDPsStatus({
          ids: [item.id],
          status: DBTables.WYDPStatus.FK,
          user,
          transaction,
          AZFKType: DBTables.AZFKType.AZCG,
          imageUrl: item.imageUrl,
        });
      } else {
        // 失败反馈
        await ppUtils.changeWYDPsStatus({
          ids: [item.id],
          status: DBTables.WYDPStatus.FK,
          user,
          transaction,
          AZFKType: item.AZFKType,
          imageUrl: item.imageUrl,
        });
      }
      const tmpDPBH = await tmpWYDP.getDPBH({ transaction });
      await tmpDPBH.update(
        {
          status: DBTables.DPBHStatus.WC,
        },
        {
          transaction,
        },
      );
    }
    // end 反馈
  }
}
