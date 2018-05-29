import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckDPExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name } = req.body;

    const existed = await DBTables.DP.findOne({ where:{ name:name.trim() }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
