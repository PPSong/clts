import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckAllowCreateKFJL extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { PPId } = req.body;

    await user.checkPPId(PPId, transaction);

    const existed = await DBTables.KFJL_PP.findOne({ where:{ PPId }, transaction });
    return existed ? { allow:0 } : { allow:1 };
  }
}
