import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShenQingShangShiWLBuHuo extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // note: 非必填
    const {
      DDId, GTId, WLId, imageUrl, note,
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
      const tmpGT = await user.checkGTId(GTId, transaction, DDId);
    } else if (tmpDDGTWL.AZGUserId !== user.id) {
      // 检查AZG权限
      throw new Error('没有权限!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建物料补货
    await ppUtils.createWLBH(GTId, WLId, imageUrl, note, user, transaction, DDId);
    // end新建物料补货
  }
}
