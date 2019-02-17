import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHDPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // let { GTId } = req.body;

    // let GT = await user.checkGTId(GTId, transaction);

    let list = await DBTables.sequelize.query(`
      SELECT * FROM dd_dw_dpsnapshot
      WHERE GTId in (SELECT id FROM gt WHERE GTBAUserId = ${user.id})
      ORDER BY createdAt DESC
      LIMIT 1
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    list = list || [];
    let lastlyRow = list[0];
    if (!lastlyRow) return [];

    // 再查询
    list = await DBTables.sequelize.query(`
      SELECT * FROM dd_dw_dpsnapshot
      WHERE GTId in (SELECT id FROM gt WHERE GTBAUserId = ${user.id}) and DDId = ${lastlyRow.DDId}
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    list = list || [];

    return list;
  }
}
