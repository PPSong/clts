import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateAZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { name, username, password, mail, phone } = req.body;

    let azgs = await user.getGLYAZGSs();
    azgs = (azgs || [])[0];

    if (!azgs) {
      throw new Error('无此权限!');
    }

    const tmpAZGUser = await DBTables.User.create(
      {
        name,
        username,
        password: bCrypt.hashSync(password, 8),
        JS: DBTables.JS.AZG,
        mail: mail || '',
        phone: phone || '',
      },
      { transaction }
    );

    const existedAZGs = await azgs.getAZGs();
    existedAZGs.push(tmpAZGUser);

    await azgs.setAZGs(existedAZGs, { transaction });
  }
}
