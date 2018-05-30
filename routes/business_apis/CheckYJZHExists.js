import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class CheckYJZHExists extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
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

    const existed = await DBTables.YJZH.findOne({ where:{ name:name.trim(), PPId }, transaction });
    return existed ? { exists:1 } : { exists:0 };
  }
}
