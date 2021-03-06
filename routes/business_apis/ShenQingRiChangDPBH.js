import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShenQingRiChangDPBH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // note: 非必填
    const {
      DWId, DPId, imageUrl, note, reason, uuid
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpDW = await user.checkDWId(DWId, transaction);
    const tmpGT = await tmpDW.getGT({ transaction });
    const tmpPPId = tmpGT.PPId;

    // 检查DW_DP记录是否存在
    const latestApprovedDDId = await DBTables.DD.max('id', {
      where: {
        PPId: tmpGT.PPId,
        status: DBTables.DDStatus.YSP,
      },
      transaction,
    });

    const tmpDWDP = await DBTables.DD_DW_DPSnapshot.findOne({
      where: {
        DDId: latestApprovedDDId,
        DWId,
        DPId,
      },
      transaction,
    });

    if (!tmpDWDP) {
      throw new Error('灯位灯片类型组合不存在, 不能补货!');
    }
    // end 检查DW_DP记录是否存在

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建灯片补货
    await ppUtils.createDPBH(
      tmpGT.id,
      DWId,
      DPId,
      tmpDW.CZ,
      tmpDW.CC,
      imageUrl,
      reason,
      note,
      uuid,
      user,
      transaction,
    );
    // end新建灯片补货
  }
}
