import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateGZ extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { PPId, username, password } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 创建GZ用户
    const tmpGZUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: DBTables.JS.GZ,
      },
      { transaction },
    );
    // end 创建GZ用户

    // 设定GZ的PP
    await tmpGZUser.setGZPPs([PPId], { transaction });
    // end 设定GZ的PP
  }
}
