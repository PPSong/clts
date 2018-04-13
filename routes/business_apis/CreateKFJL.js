import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateKFJL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { username, password, PPId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建用户
    const tmpUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: DBTables.JS.KFJL,
      },
      { transaction },
    );

    await tmpPP.setKFJLs([tmpUser], { transaction });
    // end 新建用户
  }
}
