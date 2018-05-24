import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckDWExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, GTId } = req.body;

    const existed = await DBTables.DW.findOne({ where:{ name: name.trim(), GTId }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
