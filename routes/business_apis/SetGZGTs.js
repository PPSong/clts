import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetGZGTs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { GZUserId, GTIds } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpGZ = await user.checkGZUserId(GZUserId, transaction);
    for (let i = 0; i < GTIds.length; i++) {
      await user.checkGTId(GTIds[i], transaction);
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 重置GZ的GTIds
    await tmpGZ.setGTs(GTIds, { transaction });
    // end 重置GZ的GTIds
  }
}
