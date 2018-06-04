import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchDD0DPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, BHStatus, keyword } = req.body;

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

    if (BHStatus) {
      BHStatus = BHStatus.split(',').map(s => {
        return `'${s}'`;
      });

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND a.status in (${BHStatus})`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND a.status in (${BHStatus})`;
    }

    if (keyword && keyword.trim()) {
      if (!join1) join1 = '';
      if (join1.indexOf('JOIN DD') < 0) join1 += ` LEFT JOIN DD as h ON a.DDId = h.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND (PP.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%' OR b.name LIKE '%${keyword}%' OR f.name LIKE '%${keyword}%')`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND (PP.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%' OR b.name LIKE '%${keyword}%' OR f.name LIKE '%${keyword}%')`;
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
        DPBH as a
      JOIN
        DW b
      ON
        a.DWId = b.id
      JOIN
        GT c
      ON
        b.GTId = c.id
      JOIN
        PP
      ON
        c.PPId = PP.id
      JOIN
        DP f
      ON
        a.DPId = f.id
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
      a.DDId DDId,
      h.name DD_name,
      c.name GT_name,
      c.code GT_code,
      c.PPId PPId,
      PP.name PP_name,
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
      a.ZXNumber,
      a.status,
      a.AZGSId,
      g.name AZGS_name,
      a.AZGUserId,
      IF(IFNULL(e.username,'') = '', 'BA', 'AZG') AZG_role,
      e.name AZGUser_name,
      e.username AZGUser_username,
      e.phone AZGUser_phone,
      a.YJZXTime,
      a.YJAZDate
    FROM
      DPBH a
    JOIN
      DW b
    ON
      a.DWId = b.id
    JOIN
      GT c
    ON
      b.GTId = c.id
    JOIN
      PP
    ON
      c.PPId = PP.id
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
    JOIN
      DD h
    ON
      a.DDId = h.id
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
