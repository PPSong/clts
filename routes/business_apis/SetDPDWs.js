import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDPDWs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, DWIds } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkDPId(id, transaction);
    for (let i = 0; i < DWIds.length; i++) {
      await user.checkDWId(DWIds[i], transaction);
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 设置DPDWs
    const tmpDP = await DBTables.DP.findOne({
      where: {
        id,
      },
      transaction,
    });
    await tmpDP.setDWs(DWIds, { transaction });
    // end 设置DPDWs
  }
}
