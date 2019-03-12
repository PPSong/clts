import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHDPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { isSSBH } = req.body;

    // let GT = await user.checkGTId(GTId, transaction);
    if (!isSSBH) {
      let list = await DBTables.sequelize.query(`
        SELECT a.id, a.DDId, a.DWId, a.DPId, a.GTId, a.PPId, a.CC, a.CZ, a.DPName, a.DPImageUrl, a.createdAt, a.updatedAt, a.version, status
        FROM (
          SELECT * FROM DD_DW_DPSnapshot
          WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})
        ) a
        LEFT JOIN
        DD b
        ON a.DDId = b.id AND status = '${DBTables.DDStatus.YSP}'
        ORDER BY createdAt DESC
        LIMIT 1
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
      let lastlyRow = list[0];
      if (!lastlyRow) return [];
  
      // 再查询
      list = await DBTables.sequelize.query(`
        SELECT * FROM DD_DW_DPSnapshot
        WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id}) and DDId = ${lastlyRow.DDId}
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
  
      return list;
    } else {
      let list = await DBTables.sequelize.query(`
        SELECT a.id, a.DDId, b.name DDName, a.GTId,	a.WLId,	c.name, c.code, c.level, c.imageUrl, c.GYSId, b.PPId, a.number, b.createdAt, b.updatedAt, b.status
        FROM (
          SELECT * FROM DD_GT_WL
          WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})
        ) a
        LEFT JOIN
        DD b
        ON a.DDId = b.id AND b.status = '${DBTables.DDStatus.YSP}'
        LEFT JOIN
        WL c
        ON a.WLId = c.id
        ORDER BY b.createdAt DESC
        LIMIT 1
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
      let lastlyRow = list[0];
      if (!lastlyRow) return [];
  
      // 再查询
      list = await DBTables.sequelize.query(`
        SELECT a.id, a.DDId, a.DWId, a.DPId, c.GTId, b.PPId, c.CC, c.CZ, b.name DPName, b.imageUrl DPImageUrl, a.createdAt, a.updatedAt, a.version, a.status
        FROM 
        DD_DW_DP a
        LEFT JOIN
        DP b
        ON a.DPId = b.id
        LEFT JOIN
        DW c
        ON a.DWId = c.id
        WHERE c.GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id}) and a.DDId = ${lastlyRow.DDId}
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
  
      return list;
    }
  }
}
