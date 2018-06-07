import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShenQingShangShiWLBH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // note: 非必填
    const {
      DDId, GTId, WLId, imageUrl, note, reason
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DD_GT_WL记录是否存在
    const tmpDDGTWL = await DBTables.DD_GT_WL.findOne({
      where: {
        DDId,
        GTId,
        WLId,
      },
      transaction,
    });

    if (!tmpDDGTWL) {
      throw new Error('订单柜台物料类型组合不存在, 不能补货!');
    }
    // end 检查DD_GT_WL记录是否存在

    if (user.JS !== DBTables.JS.AZG) {
      const tmpGT = await user.checkDD_GT_WLId(tmpDDGTWL.id, transaction);
    } else if (tmpDDGTWL.AZGUserId !== user.id) {
      // 检查AZG权限
      throw new Error('没有权限!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建物料补货
    await ppUtils.createWLBH(GTId, WLId, imageUrl, reason, note, user, transaction, DDId);
    // end新建物料补货
  }
}
