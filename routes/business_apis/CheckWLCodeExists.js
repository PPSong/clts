import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckWLCodeExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { code } = req.body;

    const existed = await DBTables.WL.findOne({ where:{ code:code.trim() }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
