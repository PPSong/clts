import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class UserChangePassword extends BusinessApiBase {
  static getAllowAccessJSs() {
    return "*";
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { newPassword, oldPassword } = req.body;

    const existedUser = await DBTables.User.findOne({ where:user.id, transaction });
    if (existedUser) {
      const hashedOldPassword = bCrypt.hashSync(oldPassword, 8);
      console.log(existedUser.password, hashedOldPassword, oldPassword)
      if (existedUser.password !== hashedOldPassword) {
        throw new Error('旧密码不正确');
      }

      const hashedNewPassword = bCrypt.hashSync(newPassword, 8);

      await existedUser.update({ password: hashedNewPassword }, { transaction });
    } else {
      throw new Error('无此用户');
    }

  }
}
