import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreatePPJL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { username, password, PPId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建用户
    const tmpUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: DBTables.JS.PPJL,
      },
      { transaction },
    );

    const tmpPP = await DBTables.PP.findOne({
      where: {
        id: PPId,
      },
      transaction,
    });

    await tmpPP.setPPJLs([tmpUser], { transaction });
    // end 新建用户
  }
}
