import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class createGTWithGTBA extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let {
      PPId, name, code, QY, CS, imageUrl,
    } = req.body;

    code = code.trim();
    name = name.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const username = code;
    const password = '123456';

    // 新建GTBAUser
    const tmpGTBAUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
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
        imageUrl,
      },
      { transaction },
    );
    // end 新建GT

    return {
      username,
      password,
    };
  }
}
