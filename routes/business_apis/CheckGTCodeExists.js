import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckGTCodeExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { code } = req.body;

    const existed = await DBTables.GT.findOne({ where:{ code:code }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
