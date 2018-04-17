import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class createGTWithGTBA extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      PPId, name, code, QY, CS,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建GTBAUser
    const tmpGTBAUser = await DBTables.User.create(
      {
        username: code,
        password: bCrypt.hashSync('123456', 8),
        JS: DBTables.JS.GTBA,
      },
      { transaction },
    );
    // end 新建GTBAUser

    // 新建GT
    await DBTables.GT.create(
      {
        name,
        code,
        PPId,
        QY,
        GTBAUserId: tmpGTBAUser.id,
        CS,
      },
      { transaction },
    );
    // end 新建GT
  }
}
