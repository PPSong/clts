import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShouHuoWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs } = req.body;
    // 检查EWMs是否都是WL
    const validateFailedEWMs = EWMs.filter(item => item.type !== DBTables.EWMType.WL);
    if (validateFailedEWMs.length > 0) {
      throw new Error(`${validateFailedEWMs}不属于物料, 不能收货!`);
    }
    // end 检查EWMs是否都是WL
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWM的存在
    const tmpWYWLs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYWL',
      EWMs,
      transaction,
    );
    // end 检查EWM的存在

    // 检查EWMs是属于SX状态
    const notSXRecords = tmpWYWLs.filter(item => item.status !== DBTables.WYWLStatus.SX);
    if (notSXRecords.length > 0) {
      throw new Error(`${notSXRecords}不在状态: ${DBTables.WYWLStatus.SX}, 不能收货!`);
    }
    // end 检查EWMs是属于SX状态

    // 检查EWM对应WL的安装人员是否为当前用户, 是的话把对应DD_GT_WL/WLBH状态改为'收货'
    for (const item of tmpWYWLs) {
      if (item.DDGTWLId !== null) {
        const tmpDD_GT_WL = await user.checkDD_GT_WLId(
          item.DDGTWLId,
          transaction,
        );
        await tmpDD_GT_WL.update(
          {
            status: DBTables.DD_GT_WLStatus.SH,
          },
          {
            transaction,
          },
        );
      } else if (item.WLBHId !== null) {
        const tmpWLBH = await user.checkWLBHId(item.WLBHId, transaction);
        await tmpWLBH.update(
          {
            status: DBTables.WLBHStatus.SH,
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

    // 更改相关WYWL状态为SH, 新建相关WYWLCZ
    const ids = tmpWYWLs.map(item => item.id);
    await ppUtils.changeWYWLsStatus(
      ids,
      DBTables.WYWLStatus.SH,
      user,
      transaction,
    );
    // end 更改相关WYWL状态为SH, 新建相关WYWLCZ
  }
}
