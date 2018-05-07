import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShouHuoDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs } = req.body;
    // 检查EWMs是否都是DP
    const validateFailedEWMs = EWMs.filter(item => item.type !== DBTables.EWMType.DP);
    if (validateFailedEWMs.length > 0) {
      throw new Error(`${validateFailedEWMs}不属于灯片, 不能收货!`);
    }
    // end 检查EWMs是否都是DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWM的存在
    const tmpWYDPs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYDP',
      EWMs,
      transaction,
    );
    // end 检查EWM的存在

    // 检查EWMs是属于SX状态
    const notSXRecords = tmpWYDPs.filter(item => item.status !== DBTables.WYDPStatus.SX);
    if (notSXRecords.length > 0) {
      throw new Error(`${notSXRecords}不在状态: ${DBTables.WYDPStatus.SX}, 不能收货!`);
    }
    // end 检查EWMs是属于SX状态

    // 检查EWM对应WL的安装人员是否为当前用户, 是的话把对应DD_GT_WL/WLBH状态改为'收货'
    for (const item of tmpWYDPs) {
      if (item.DDDWDPId !== null) {
        const tmpDD_DW_DP = await user.checkDD_DW_DPId(
          item.DDDWDPId,
          transaction,
        );
        await tmpDD_DW_DP.update(
          {
            status: DBTables.DD_DW_DPStatus.SH,
          },
          {
            transaction,
          },
        );
      } else if (item.DPBHId !== null) {
        const tmpDPBH = await user.checkDPBHId(item.DPBHId, transaction);
        await tmpDPBH.update(
          {
            status: DBTables.DPBHStatus.SH,
          },
          {
            transaction,
          },
        );
      } else {
        throw new Error(`${item}记录有误!`);
      }
    }
    // end 检查EWM对应WL的安装人员是否为当前用户, 是的话把对应DD_GT_WL/WLBH状态改为'收货'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 更改相关WYDP状态为SH, 新建相关WYDPCZ
    const ids = tmpWYDPs.map(item => item.id);
    await ppUtils.changeWYDPsStatus({
      ids,
      status: DBTables.WYDPStatus.SH,
      user,
      transaction,
    });
    // end 更改相关WYDP状态为SH, 新建相关WYDPCZ
  }
}
