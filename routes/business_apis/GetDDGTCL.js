import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class getDDGTCL extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [ DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA, DBTables.JS.AZG ];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DDId, GTId } = req.body;

    if (user.JS === DBTables.JS.PPJL || user.JS === DBTables.JS.KFJL || 
        user.JS === DBTables.JS.GZ || user.JS === DBTables.JS.GTBA) {
      await user.checkGTId(GTId, transaction);
    } else if (user.JS === DBTables.JS.AZG) {
      let canView = await ppUtils.checkAZGcanViewDDGT(user.id, DDId, GTId, transaction);
      if (!canView) throw new Error('没有权限');
    }

    let r = await DBTables.DDGTCL.findOne({
      where: {
        DDId, GTId
      },
      transaction
    });
    if (r) r = r.toJSON();
    else r = {
      DWCL:'[]',
      WLCL:'[]'
    };
    if (r.DWCL) r.DWCL = JSON.parse(r.DWCL);
    if (r.WLCL) r.WLCL = JSON.parse(r.WLCL);
    delete r["createdAt"];
    delete r["updatedAt"];
    delete r["version"];
    delete r["id"];
    return r;
  }
}
