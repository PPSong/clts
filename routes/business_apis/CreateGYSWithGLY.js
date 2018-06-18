import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateGYSWithGLY extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let {
      name, username, password, type,
    } = req.body;

    if (name) name = name.trim();
    username = username.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建GYSGLY
    const tmpGYSGLYUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, DBTables.PASSWORD_SALT),
        JS: DBTables.JS.GYSGLY,
      },
      { transaction },
    );
    // end 新建GYSGLY

    // 新建GYS
    const tmpGYS = await DBTables.GYS.create(
      {
        name,
        type,
      },
      { transaction },
    );
    // end 新建GYS

    // 重置GYS的GLY
    await tmpGYS.setGLYs([tmpGYSGLYUser], { transaction });
    // end 重置GYS的GLY
  }
}
