import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShouHuo extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static validateParamsFormat(req, res, next) {
    const { HWEWMs } = req.body;
    // 检查HWEWMs是否都是WL/DP
    const validateFailedEWMs = HWEWMs.filter(item => item.type !== DBTables.EWMType.WL && item.type !== DBTables.EWMType.DP);
    if (validateFailedEWMs.length > 0) {
      throw new Error(`${validateFailedEWMs}不属于物料或灯片, 不能收货!`);
    }
    // end 检查HWEWMs是否都是WL/DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { HWEWMs } = req.body;

    // 把HWEWMs按照WL, DP分类
    const WLEWMs = HWEWMs.filter(item => item.type === DBTables.EWMType.WL);
    const DPEWMs = HWEWMs.filter(item => item.type === DBTables.EWMType.DP);
    // end 把HWEWMs按照WL, DP分类

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWM的存在
    const tmpWYWLs = await ppUtils.checkEWMsExistanceAndGetRecords('WYWL', WLEWMs, transaction);
    const tmpWYDPs = await ppUtils.checkEWMsExistanceAndGetRecords('WYDP', DPEWMs, transaction);
    // end 检查EWM的存在

    // 检查EWM对应WL/DP的状态是否为SX
    await ppUtils.checkRecordsStatus(tmpWYWLs, DBTables.WYWLStatus.SX, '不能收货', transaction);
    await ppUtils.checkRecordsStatus(tmpWYDPs, DBTables.WYDPStatus.SX, '不能收货', transaction);
    // end 检查EWM对应WL/DP的状态是否为SX

    // 检查EWM对应WL/DP的安装人员是否为当前用户
    const tmpWYWLIds = tmpWYWLs.map(item => item.id);
    const tmpWYDPIds = tmpWYDPs.map(item => item.id);
    for (let i = 0; i < tmpWYWLIds; i++) {
      await user.checkWYWLId(tmpWYWLIds[i], transaction);
    }
    for (let i = 0; i < tmpWYDPIds; i++) {
      await user.checkWYDPId(tmpWYDPIds[i], transaction);
    }
    // end 检查EWM对应WL/DP的安装人员是否为当前用户

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 更改相关WYWL/WYDP状态为FH, 新建相关WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsStatus(tmpWYWLIds, DBTables.WYWLStatus.SH, user, transaction);
    await ppUtils.changeWYDPsStatus(tmpWYDPIds, DBTables.WYDPStatus.SH, user, transaction);
    // end 更改相关WYWL/WYDP状态为FH, 新建相关WYWLCZ/WYDPCZ
  }
}
