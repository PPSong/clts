import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckGYSExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { name } = req.body;

    const existed = await DBTables.GYS.findOne({ where:{ name:name.trim() }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
