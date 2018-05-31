import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetGTYJZHs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GTId, YJZHs } = req.body;

    let GT = await user.checkGTId(GTId, transaction);
    for (let i = 0; i < YJZHs.length; i++) {
      let YJZHId = YJZHs[i].id;
      let number = YJZHs[i].number;
      let EJZH = await user.checkYJZHId(YJZHId, transaction);
      if (number < 1) {
        await DBTables.GT_YJZH.destroy({ where:{ YJZHId, GTId }, transaction });
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
}
