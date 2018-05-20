import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateZHY extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { name, username, password, mail, phone } = req.body;

    let gys = await user.getGLYGYSs();
    gys = (gys || [])[0];

    if (!gys) {
      throw new Error('无此权限!');
    }

    const tmpZHYUser = await DBTables.User.create(
      {
        name,
        username,
        password: bCrypt.hashSync(password, 8),
        JS: DBTables.JS.ZHY,
        mail: mail || '',
        phone: phone || '',
      },
      { transaction }
    );

    const existedZHYs = await gys.getZHYs();
    existedZHYs.push(tmpZHYUser);

    await gys.setZHYs(existedZHYs, { transaction });
  }
}
