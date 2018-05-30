import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ChangeGTImage extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GTId, imageUrl } = req.body;

    let GT = await user.checkGTId(GTId, transaction);

    await DBTables.GT.update({ imageUrl }, { where:{ id: GTId }, transaction });
  }
}
