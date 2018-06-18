import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateKFJL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { username, password, PPId, name, mail, phone } = req.body;
    if (name) name = name.trim();
    if (mail) mail = mail.trim();
    if (phone) phone = phone.trim();
    username = username.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建用户
    const tmpUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, DBTables.PASSWORD_SALT),
        JS: DBTables.JS.KFJL,
        name: name || '',
        mail: mail || '',
        phone: phone || ''
      },
      { transaction },
    );
    // end 新建用户

    // 重置PP的KFJL
    await tmpPP.setKFJLs([tmpUser], { transaction });
    // end 重置PP的KFJL
  }
}
