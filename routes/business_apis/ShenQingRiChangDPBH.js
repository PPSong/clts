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
      GTId, DPId, imageUrl, note,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpGT = await user.checkGTId(GTId, transaction);

    // 检查GT_DP记录是否存在
    const latestApprovedDDId = await DBTables.DD.max('id', {
      where: {
        PPId: tmpGT.PPId,
        status: DBTables.DDStatus.YSP,
      },
      transaction,
    });

    const tmpGTDP = await DBTables.DD_DW_DPSnapshot.findOne({
      include: [
        {
          model: DBTables.DW,
          as: 'DW',
          where: {
            GTId,
          },
        },
      ],
      where: {
        DDId: latestApprovedDDId,
        DPId,
      },
      transaction,
    });

    if (!tmpGTDP) {
      throw new Error('柜台灯片类型组合不存在, 不能补货!');
    }
    // end 检查GT_DP记录是否存在

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建灯片补货
    await ppUtils.createDPBH(GTId, DPId, imageUrl, note, user, transaction);
    // end新建灯片补货
  }
}
