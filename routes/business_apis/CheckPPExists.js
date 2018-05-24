import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckPPExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { name } = req.body;

    const existed = await DBTables.PP.findOne({ where:{ name:name.trim() }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
