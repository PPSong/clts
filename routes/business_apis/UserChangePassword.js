import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class UserChangePassword extends BusinessApiBase {
  static getAllowAccessJSs() {
    return "*";
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { newPassword, oldPassword, id } = req.body;

    let existedUser = await DBTables.User.findOne({ where:{ id:user.id }, transaction });
    if (existedUser) {
      existedUser = existedUser.toJSON();
      if (bCrypt.hashSync(oldPassword, DBTables.PASSWORD_SALT) != existedUser.password) {
        throw new Error('旧密码不正确');
      }

      const hashedNewPassword = bCrypt.hashSync(newPassword, DBTables.PASSWORD_SALT);

      await DBTables.User.update({ password: hashedNewPassword }, { where:{ id:user.id } ,transaction });
    } else {
      throw new Error('无此用户');
    }

  }
}
