import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckUsernameExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN,DBTables.JS.PPJL,DBTables.JS.KFJL,DBTables.JS.AZGSGLY,DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { username } = req.body;

    const existed = await DBTables.User.findOne({ where:{ username:username.trim() }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
