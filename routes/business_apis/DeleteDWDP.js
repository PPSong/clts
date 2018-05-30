import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class DeleteDWDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, DWId } = req.body;

    let DW = await user.checkDWId(DWId, transaction);

    await DBTables.DW.update({ DPId: null }, { where:{ id: DWId }, transaction });
  }
}
