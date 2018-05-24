import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckWLNameExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, PPId } = req.body;

    if (user.JS === DBTables.JS.ADMIN) {
      //
    } else {
      let pps = await user.getKFJLPPs();
      if (pps.length > 0) {
        PPId = pps[0].id;
      }
    }
    if (!PPId) throw new Error('参数错误. 品牌不存在.');

    const existed = await DBTables.WL.findOne({ where:{ name:name.trim(), PPId:PPId }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
