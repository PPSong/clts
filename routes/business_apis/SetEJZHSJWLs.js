import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetEJZHSJWLs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { EJZHId, SJWLs } = req.body;

    let EJZH = await user.checkEJZHId(EJZHId, transaction);
    for (let i = 0; i < SJWLs.length; i++) {
      let WLId = SJWLs[i].id;
      let number = SJWLs[i].number;
      let WL = await user.checkWLId(WLId, transaction);
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
}
