import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShenQingRiChangWLBuHuo extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // note: 非必填
    const {
      GTId, WLId, imageUrl, note,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpGT = await user.checkGTId(GTId, transaction);

    // 检查GT_WL记录是否存在
    const latestApprovedDDId = await DBTables.DD.max('id', {
      where: {
        PPId: tmpGT.PPId,
        status: DBTables.DDStatus.YSP,
      },
      transaction,
    });

    const tmpGTWL = await DBTables.DD_GT_WLSnapshot.findOne({
      where: {
        DDId: latestApprovedDDId,
        GTId,
        WLId,
      },
      transaction,
    });

    if (!tmpGTWL) {
      throw new Error('柜台物料类型组合不存在, 不能补货!');
    }
    // end 检查GT_WL记录是否存在

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建物料补货
    await ppUtils.createWLBH(GTId, WLId, imageUrl, note, user, transaction);
    // end新建物料补货
  }
}
