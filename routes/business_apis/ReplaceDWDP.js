import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ReplaceDWDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, DWId, DPId } = req.body;

    let DW = await user.checkDWId(DWId, transaction);
    let DP = await user.checkDPId(DPId, transaction);

    await DBTables.DW.update({ DPId: DPId }, { where:{ id: DWId }, transaction });
  }
}
