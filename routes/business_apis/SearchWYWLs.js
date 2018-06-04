import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchWYWLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, status, keyword } = req.body;

    perPage = perPage || 50;

    let join1 = '', join2 = '';
    let tmp = '', where = '', moreWhere1 = '', moreWhere2 = '';

    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE PP.id in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE PP.id in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      tmp = `in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND h.AZGSId ${tmp}`;
      moreWhere2 = ` AND h.AZGSId ${tmp}`;
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere1 = ` AND h.AZGUserId = ${user.id}`;
      moreWhere2 = ` AND h.AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      tmp = `in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND e.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    } else if (user.JS === DBTables.JS.ZHY) {
      tmp = `in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND e.id ${tmp}`;
      join1 = `LEFT JOIN GYS ON a.GYSId = GYS.id`;
    }

    if (status) {
      status = status.split(',').map(s => {
        return `'${s}'`;
      });

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND a.status in (${status})`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND a.status in (${status})`;
    }

    if (keyword && keyword.trim()) {
      if (!join1) join1 = '';
      join1 += `JOIN WL c ON a.WLId = c.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND (g.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%' OR PP.name LIKE '%${keyword}%' OR b1.name LIKE '%${keyword}%' OR b1.code LIKE '%${keyword}%')`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND (g.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.code LIKE '%${keyword}%' OR PP.name LIKE '%${keyword}%' OR b1.name LIKE '%${keyword}%' OR b1.code LIKE '%${keyword}%')`;
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
        WYWL a
      LEFT JOIN
        DD_GT_WL h
      ON
        a.DDGTWLId = h.id
      LEFT JOIN
        DD g
      ON
        h.DDId = g.id
      LEFT JOIN
        WLBH n
      ON
        a.WLBHId = n.id
      LEFT JOIN
        GT b1
      ON
        h.GTId = b1.id
      LEFT JOIN
        GT b2
      ON
        n.GTId = b2.id
      JOIN
        PP
      ON
        PP.id = b1.PPId OR PP.id = b2.PPId
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
      a.EWM,
      g.name DD_name,
      c.id WLId,
      c.level WL_level,
      c.code WL_code,
      c.name WL_name,
      c.imageUrl WL_imageUrl,
      e.name FHGYS,
      a.GYSId GYSId,
      a.status,
      a.DDGTWLId,
      a.WLBHId,
      a.KDXId,
      a.AZFKType,
      a.imageUrl,
      h.AZGSId,
      m.name AZGS_name,
      h.AZGUserId,
      IF(IFNULL(b2.name,'') = '', b1.id, b2.id) GTId,
      IF(IFNULL(b2.name,'') = '', b1.name, b2.name) GT_name,
      IF(IFNULL(b2.name,'') = '', b1.code, b2.code) GT_code,
      h.DDId DDId,
      IF(IFNULL(l.username,'') = '', 'BA', 'AZG') AZG_role,
      l.name AZGUser_name,
      l.username AZGUser_username,
      l.phone AZGUser_phone,
      PP.id PPId,
      PP.name PP_name
    FROM
      WYWL a
    JOIN
      WL c
    ON
      a.WLId = c.id
    JOIN
      GYS e
    ON
      a.GYSId = e.id
    LEFT JOIN
      DD_GT_WL h
    ON
      a.DDGTWLId = h.id
    LEFT JOIN
      DD g
    ON
      h.DDId = g.id
    LEFT JOIN
      User l
    ON
      h.AZGUserId = l.id
    LEFT JOIN
      AZGS m
    ON
      h.AZGSId = m.id
    LEFT JOIN
      WLBH n
    ON
      a.WLBHId = n.id
    LEFT JOIN
      GT b1
    ON
      h.GTId = b1.id
    LEFT JOIN
      GT b2
    ON
      n.GTId = b2.id
    JOIN
      PP
    ON
      PP.id = b1.PPId OR PP.id = b2.PPId
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
