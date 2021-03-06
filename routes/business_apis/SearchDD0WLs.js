import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchDD0WLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, DDStatus, keyword, DDId } = req.body;

    perPage = perPage || 50;

    let join1 = '', join2 = '';
    let tmp = '', where = '', moreWhere1 = '', moreWhere2 = '';

    if (DDId) {
      moreWhere1 = moreWhere2 = ` AND a.DDId = ${DDId}`;
    }

    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE b.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE b.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      tmp = `in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
      moreWhere1 += ` AND AZGSId ${tmp}`;
      moreWhere2 += ` AND d.id ${tmp}`;
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere1 += ` AND AZGUserId = ${user.id}`;
      moreWhere2 += ` AND a.AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      tmp = `in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 += ` AND GYS.id ${tmp}`;
      moreWhere2 += ` AND e.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    } else if (user.JS === DBTables.JS.ZHY) {
      tmp = `in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 += ` AND GYS.id ${tmp}`;
      moreWhere2 += ` AND e.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    }

    if (DDStatus) {
      DDStatus = DDStatus.split(',').map(s => {
        return `'${s}'`;
      });
      if (!join1) join1 = '';
      join1 += ` LEFT JOIN DD as g ON a.DDId = g.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND g.status in (${DDStatus})`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND g.status in (${DDStatus})`;
    }

    if (keyword && keyword.trim()) {
      if (!join1) join1 = '';
      if (join1.indexOf('JOIN DD') < 0) join1 += ` LEFT JOIN DD as h ON a.DDId = h.id`;
      if (join1.indexOf('JOIN WL') < 0) join1 += ` JOIN WL as c ON a.WLId = c.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND (PP.name LIKE '%${keyword}%' OR b.name LIKE '%${keyword}%' OR b.code LIKE '%${keyword}%'OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%')`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND (PP.name LIKE '%${keyword}%' OR b.name LIKE '%${keyword}%' OR b.code LIKE '%${keyword}%'OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%')`;
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
        DD_GT_WL a
      JOIN
        GT b
      ON
        a.GTId = b.id
      JOIN
        PP
      ON
        b.PPId = PP.id
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
      b.id GTId,
      a.DDId DDId,
      g.name DD_name,
      b.name GT_name,
      b.code GT_code,
      c.id WLId,
      c.level WL_level,
      c.code WL_code,
      c.name WL_name,
      c.imageUrl WL_imageUrl,
      a.number,
      IFNULL(d.name, 'BA') AZLX,
      e.name FHGYS,
      a.GYSId GYSId,
      a.status,
      a.AZGSId,
      d.name AZGS_name,
      a.AZGUserId,
      a.YJRKDate,
      a.YJZXDate,
      IF(IFNULL(d.name,'') = '', 'BA', 'AZG') AZG_role,
      f.name AZGUser_name,
      f.username AZGUser_username,
      f.phone AZGUser_phone,
      a.YJAZDate
    FROM
      DD_GT_WL a
    JOIN
      GT b
    ON
      a.GTId = b.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    LEFT JOIN
      AZGS d
    ON
      a.AZGSId = d.id
    JOIN
      GYS e
    ON
      a.GYSId = e.id
    LEFT JOIN
      User f
    ON
      a.AZGUserId = f.id
    JOIN
      DD g
    ON
      a.DDId = g.id
    JOIN
      PP
    ON
      b.PPId = PP.id
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
