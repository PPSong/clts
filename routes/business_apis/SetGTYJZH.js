import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetGTYJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GTId, YJZHId, number } = req.body;

    let GT = await user.checkGTId(GTId, transaction);
    let YJZH = await user.checkYJZHId(YJZHId, transaction);
    if (number < 1) {
      await DBTables.GT_YJZH.destroy({ where:{ GTId, YJZHId }, transaction });
    } else {
      let data = {
        GTId,
        YJZHId,
        number
      };
      await DBTables.GT_YJZH.upsert(data, { where:{ GTId, YJZHId }, transaction });
    }
  }
}
