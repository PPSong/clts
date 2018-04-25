import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShenQingShangShiDPBuHuo extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // note: 非必填
    const {
      DDId, DWId, DPId, imageUrl, note,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DD_DW_DP记录是否存在
    const tmpDDDWDP = await DBTables.DD_DW_DP.findOne({
      where: {
        DDId,
        DWId,
        DPId,
      },
      transaction,
    });

    if (!tmpDDDWDP) {
      throw new Error('订单灯位灯片类型组合不存在, 不能补货!');
    }
    // end 检查DD_DW_DP记录是否存在

    if (user.JS !== DBTables.JS.AZG) {
      const tmpGT = await user.checkDD_DW_DPId(tmpDDDWDP.id, transaction);
    } else if (tmpDDDWDP.AZGUserId !== user.id) {
      // 检查AZG权限
      throw new Error('没有权限!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建灯片补货
    await ppUtils.createDPBH(
      DWId,
      DPId,
      imageUrl,
      note,
      user,
      transaction,
      DDId,
    );
    // end新建灯片补货
  }
}
