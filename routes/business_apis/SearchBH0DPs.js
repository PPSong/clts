import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class SearchBH0DPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { curPage, perPage, BHStatus, keyword, DDId } = req.body;

    perPage = perPage || 50;

    let status = [
      `'${DBTables.DPBHStatus.CS}'`,
      `'${DBTables.DPBHStatus.KFJLSPTG}'`,
      `'${DBTables.DPBHStatus.BH}'`
    ];

    let join = '';
    let where = '', moreWhere = '';
    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE a.status != '${DBTables.DPBHStatus.CS}' AND g.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE g.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      where = `WHERE a.status NOT in (${status.join(',')}) AND n.id in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZG) {
      where = `WHERE a.status NOT in (${status.join(',')}) AND AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {

      let GYSId = await DBTables.sequelize.query(`SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id}`, {
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      GYSId = GYSId[0].id;

      where = `WHERE a.status NOT in (${status.join(',')}) AND (c.id = ${GYSId} OR b1.id = ${GYSId})`;
    } else if (user.JS === DBTables.JS.ZHY) {

      let GYSId = await DBTables.sequelize.query(`SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id}`, {
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      GYSId = GYSId[0].id;

      where = `WHERE a.status NOT in (${status.join(',')}) AND (c.id = ${GYSId} OR b1.id = ${GYSId})`;
    } else if (user.JS === DBTables.JS.GTBA) {
      where = `WHERE g.id in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})`;
    }

    if (DDId) {
      moreWhere += ` AND e.id = ${DDId}`;
    }

    if (BHStatus) {
      BHStatus = BHStatus.split(',').map(s => {
        return `'${s}'`;
      });

      moreWhere += ` AND a.status in (${BHStatus})`;
    }

    if (keyword && keyword.trim()) {
      moreWhere += ` AND (b.name LIKE '%${keyword}%' OR d.name LIKE '%${keyword}%' OR e.name LIKE '%${keyword}%' OR g.name LIKE '%${keyword}%' OR g.code LIKE '%${keyword}%' OR l.name LIKE '%${keyword}%')`;
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
      DPBH a
    JOIN
      DP b
    ON
      a.DPId = b.id
    JOIN
      DW d
    ON
      a.DWId = d.id
    LEFT JOIN
      GYS b1
    ON
      b.GYSId = b1.id
    LEFT JOIN
      GYS c
    ON
      a.GYSId = c.id
    LEFT JOIN
      DD e
    ON
      a.DDId = e.id
    JOIN
      GT g
    ON
      d.GTId = g.id
    JOIN
      PP l
    ON
      g.PPId = l.id
    LEFT JOIN
      AZGS n
    ON
      a.AZGSId = n.id
    LEFT JOIN
      User m
    ON
      a.AZGUserId = m.id
    ${where} ${moreWhere}
    `;

    let selector = `count(a.id) as total`;

    let total = await DBTables.sequelize.query(sql.replace('{SELECTOR}', selector), {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    selector = `
      a.id id,
      b1.id ProduceGYSId,
      b1.name ProduceGYS_name,
      a.status,
      a.ZXNumber,
      a.imageUrl,
      a.YJZXTime,
      a.YJRKDate,
      a.YJAZDate,

      c.id GYSId,
      c.name GYS_name,

      d.id DWId,
      d.name DW_name,

      b.id DPId,
      b.name DP_name,
      a.CC,
      a.CZ,

      n.id AZGSId,
      n.name AZGS_name,
      m.id AZGUserId,
      m.name AZGUser_name,
      m.username AZGUser_username,
      m.phone AZGUser_phone,
      
      g.id GTId,
      g.name GT_name,
      g.code GT_code,
      e.id DDId,
      IF(IFNULL(n.id,'') = '', 'BA', 'AZG') AZG_role,

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
