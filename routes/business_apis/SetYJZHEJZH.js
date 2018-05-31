import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetYJZHEJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { YJZHId, EJZHId, number } = req.body;

    let YJZH = await user.checkYJZHId(YJZHId, transaction);
    let EJZH = await user.checkEJZHId(EJZHId, transaction);
    if (number < 1) {
      await DBTables.YJZH_EJZH.destroy({ where:{ EJZHId, YJZHId }, transaction });
    } else {
      let data = {
        EJZHId,
        YJZHId,
        number
      };
      await DBTables.YJZH_EJZH.upsert(data, { where:{ EJZHId, YJZHId }, transaction });
    }
  }
}
