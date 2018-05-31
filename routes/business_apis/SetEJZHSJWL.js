import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetEJZHSJWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { SJWLId, EJZHId, number } = req.body;
    let WLId = SJWLId;

    let WL = await user.checkWLId(WLId, transaction);
    let EJZH = await user.checkEJZHId(EJZHId, transaction);
    if (number < 1) {
      await DBTables.EJZH_SJWL.destroy({ where:{ EJZHId, WLId }, transaction });
    } else {
      let data = {
        EJZHId,
        WLId,
        number
      };
      await DBTables.EJZH_SJWL.upsert(data, { where:{ EJZHId, WLId }, transaction });
    }
  }
}
