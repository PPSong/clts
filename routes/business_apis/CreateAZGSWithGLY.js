import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateAZGSWithGLY extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, username, password } = req.body;
    if (name) name = name.trim();
    username = username.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建AZGSGLY
    const tmpAZGSGLYUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, DBTables.PASSWORD_SALT),
        JS: DBTables.JS.AZGSGLY,
      },
      { transaction },
    );
    // end 新建AZGSGLY

    // 新建AZGS
    const tmpAZGS = await DBTables.AZGS.create(
      {
        name,
      },
      { transaction },
    );
    // end 新建AZGS

    // 重置AZGS的GLY
    await tmpAZGS.setGLYs([tmpAZGSGLYUser], { transaction });
    // end 重置AZGS的GLY
  }
}
