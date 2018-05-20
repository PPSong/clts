import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class MyUserInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return "*";
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { } = req.body;

    const existedUser = await DBTables.User.findOne({ where:{ id:user.id }, transaction });
    return existedUser.toJSON();

  }
}
