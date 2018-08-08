import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchWYDPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, status, keyword, DDId, KDXId, GTId, BH } = req.body;

    perPage = perPage || 50;

    let join = '';
    let where = '', moreWhere = '';
    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE a.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE a.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      where = `WHERE n.id in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZG) {
      where = `WHERE m.id in (SELECT GYSId as id FROM AZG_AZGS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      where = `WHERE a.GYSId in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.ZHY) {
      where = `WHERE a.GYSId in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
    }

    if (DDId) {
      moreWhere += ` AND e.id = ${DDId}`;
    } else if (BH === 1) {
      moreWhere += ` AND f.id IS NOT NULL`;
    }
    
    if (KDXId) {
      moreWhere += ` AND a.KDXId = ${KDXId}`;
    }
    if (GTId) {
      moreWhere += ` AND g.id = ${GTId}`;
    }

    if (status) {
      status = status.split(',').map(s => {
        return `'${s}'`;
      });

      moreWhere += ` AND a.status in (${status})`;
    }

    if (keyword && keyword.trim()) {
      moreWhere += ` AND (a.EWM LIKE '%${keyword}%' OR g.name LIKE '%${keyword}%' OR g.code LIKE '%${keyword}%' OR l.name LIKE '%${keyword}%')`;
    }

    if (moreWhere && !where) {
      where = 'WHERE';
    }
    if (where.trim().toLocaleUpperCase() === 'WHERE') {
      moreWhere = moreWhere.replace('AND', '');
    }
    
    let sql = `
    SELECT
      {SELECTOR}
    FROM
      WYDP a
    JOIN
      GYS c
    ON
      a.GYSId = c.id
    LEFT JOIN
      DD_DW_DP d
    ON
      a.DDDWDPId = d.id
    LEFT JOIN
      DD e
    ON
      d.DDId = e.id
    LEFT JOIN
      DPBH f
    ON
      a.DPBHId = f.id
    JOIN
      GT g
    ON
      a.GTId = g.id
    JOIN
      PP l
    ON
      a.PPId = l.id
    LEFT JOIN
      AZGS n
    ON
      d.AZGSId = n.id OR f.AZGSId = n.id
    LEFT JOIN
      User m
    ON
      d.AZGUserId = m.id OR f.AZGUserId = m.id
    ${where} ${moreWhere}
    `;

    let selector = `count(a.id) as total`;


    let total = await DBTables.sequelize.query(sql.replace('{SELECTOR}', selector), {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    selector = `
      a.id id,
      a.uuid,
      a.GYSId GYSId,
      a.status,
      a.DDDWDPId,
      a.DPBHId,
      a.KDXId,
      a.AZFKType,
      a.EWM,
      a.AZFKNote,
      a.imageUrl,

      n.id AZGSId,
      n.name AZGS_name,
      m.id AZGUserId,
      m.name AZGUser_name,
      m.username AZGUser_username,
      m.phone AZGUser_phone,

      c.name GYS_name,
      
      g.id GTId,
      g.name GT_name,
      g.code GT_code,
      e.id DDId,
      IF(IFNULL(m.id,'') = '', 'BA', 'AZG') AZG_role,

      l.id PPId,
      l.name PP_name
    `;

    sql += `
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
    `;

    const list = await DBTables.sequelize.query(sql.replace('{SELECTOR}', selector), {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return {
      list, total
    };
    // end 查询记录
  }
}
