import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateGZ extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { PPId, username, password } = req.body;
    username = username.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 创建GZ用户
    const tmpGZUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, DBTables.PASSWORD_SALT),
        JS: DBTables.JS.GZ,
      },
      { transaction },
    );
    // end 创建GZ用户

    // 重置GZ的PP
    await tmpGZUser.setGZPPs([PPId], { transaction });
    // end 重置GZ的PP
  }
}
