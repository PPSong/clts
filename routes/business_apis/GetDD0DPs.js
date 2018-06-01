import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0DPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { id, curPage, perPage } = req.body;

    perPage = perPage || 50;

    let join = '';
    let tmp = '', moreWhere1 = '', moreWhere2 = '';

    if (user.JS === DBTables.JS.PPJL || user.JS === DBTables.JS.KFJL) {
      await user.checkDDId(id, transaction);
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      tmp = `in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND AZGSId ${tmp}`;
      moreWhere2 = ` AND g.id ${tmp}`;
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere1 = ` AND AZGUserId = ${user.id}`;
      moreWhere2 = ` AND a.AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      tmp = `in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND d.id ${tmp}`;
      join = `LEFT JOIN GYS ON DD_DW_DP.GYSId = GYS.id`;
    } else if (user.JS === DBTables.JS.ZHY) {
      tmp = `in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND d.id ${tmp}`;
      join = `LEFT JOIN GYS ON DD_DW_DP.GYSId = GYS.id`;
    }

    let sql = `
      SELECT 
        count(DD_DW_DP.id) as total
      FROM 
        DD_DW_DP
      ${join}
      WHERE
        DD_DW_DP.DDId = ${id} ${moreWhere1}
    `;
    let total = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    sql = `
    SELECT
      c.id GTId,
      c.name GT_name,
      c.code GT_code,
      c.name DWName,
      f.id DPId,
      f.name DP_name,
      f.imageUrl DP_imageUrl,
      b.CC,
      b.CZ,
      IFNULL(g.name, 'BA') AZLX,
      d.name FHGYS,
      a.status,
      a.AZGSId,
      g.name AZGS_name,
      a.AZGUserId,
      a.YJRKDate,
      a.YJZXDate,
      IF(IFNULL(e.username,'') = '', 'BA', 'AZG') AZG_role,
      e.name AZGUser_name,
      e.username AZGUser_username,
      e.phone AZGUser_phone,
      a.YJAZDate
    FROM
      DD_DW_DP a
    JOIN
      DW b
    ON
      a.DWId = b.id
    JOIN
      GT c
    ON
      b.GTId = c.id
    JOIN
      GYS d
    ON
      a.GYSId = d.id
    LEFT JOIN
      User e
    ON
      a.AZGUserId = e.id
    JOIN
      DP f
    ON
      a.DPId = f.id
    LEFT JOIN
      AZGS g
    ON
      a.AZGSId = g.id
    WHERE
      a.DDId = ${id} ${moreWhere2}
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
    `;

    const list = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return {
      list, total
    };
    // end 查询记录
  }
}
