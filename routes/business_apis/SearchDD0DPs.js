import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchDD0DPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, DDStatus } = req.body;

    perPage = perPage || 50;

    let join1 = '', join2 = '';
    let tmp = '', where ='', moreWhere1 = '', moreWhere2 = '';

    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE c.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE c.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      tmp = `in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND a.AZGSId ${tmp}`;
      moreWhere2 = ` AND g.id ${tmp}`;
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere1 = ` AND a.AZGUserId = ${user.id}`;
      moreWhere2 = ` AND a.AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      tmp = `in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND d.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    } else if (user.JS === DBTables.JS.ZHY) {
      tmp = `in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND d.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    }

    if (DDStatus) {
      DDStatus = DDStatus.split(',').map(s => {
        return `'${s}'`;
      });
      if (!join1) join1 = '';
      join1 += ` LEFT JOIN DD ON a.DDId = DD.id`;

      if (!join2) join2 = '';
      join2 += ` LEFT JOIN DD ON a.DDId = DD.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND DD.status in (${DDStatus})`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND DD.status in (${DDStatus})`;
    }

    if (moreWhere1 && !where) {
      where = 'WHERE';
    }
    if (where.trim().toLocaleUpperCase() === 'WHERE') {
      moreWhere1 = moreWhere1.replace('AND', '');
    }

    let sql = `
      SELECT 
        count(a.id) as total
      FROM 
        DD_DW_DP as a
      JOIN
        DW b
      ON
        a.DWId = b.id
      JOIN
        GT c
      ON
        b.GTId = c.id
      ${join1}
      ${where} ${moreWhere1}
    `;
    let total = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    if (moreWhere2 && !where) {
      where = 'WHERE';
    }
    if (where.trim().toLocaleUpperCase() === 'WHERE') {
      moreWhere2 = moreWhere2.replace('AND', '');
    }

    // 查询记录
    sql = `
    SELECT
      a.id id,
      c.id GTId,
      c.name GT_name,
      c.code GT_code,
      c.PPId PPId,
      b.name DWName,
      b.id DWId,
      f.id DPId,
      f.name DP_name,
      f.imageUrl DP_imageUrl,
      d.id GYSId,
      d.name GYS_name,
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
    ${join2}
    ${where} ${moreWhere2}
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
