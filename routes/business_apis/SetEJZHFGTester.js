import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetEJZHFGTester extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { FGTesterId, EJZHId, number } = req.body;

    let FGTester = await user.checkFGTesterId(FGTesterId, transaction);
    let EJZH = await user.checkEJZHId(EJZHId, transaction);
    if (number < 1) {
      await DBTables.EJZH_FGTester.destroy({ where:{ EJZHId, FGTesterId }, transaction });
    } else {
      let data = {
        EJZHId,
        FGTesterId,
        number
      };
      await DBTables.EJZH_FGTester.upsert(data, { where:{ EJZHId, FGTesterId }, transaction });
    }
  }
}
