import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDGTAZGSs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GTBA, DBTables.JS.GZ, DBTables.JS.AZGSGLY, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, GTId, AZGSId, PPId } = req.body;

    perPage = perPage || 50;

    let where = '';

    if (keyword) {
      where += ` AND (
          DD_name LIKE '%${keyword}%' 
          OR 
          GT_name LIKE '%${keyword}%' 
          OR 
          GT_code LIKE '%${keyword}%' 
          OR 
          PP_name LIKE '%${keyword}%'
        )
      `;
    }
    if (GTId) {
      where += `
        AND GTId = ${GTId}
      `;
    }
    if (AZGSId) {
      where += `
        AND AZGSId = ${AZGSId}
      `;
    }
    if (PPId) {
      where += `
        AND PPId = ${PPId}
      `;
    }

    if (user.JS === DBTables.JS.PPJL) {
      where += `
        AND PPId in (SELECT PPId id FROM PPJL_PP WHERE UserId = ${user.id})
      `;
    } else if (user.JS === DBTables.JS.KFJL) {
      where += `
        AND PPId in (SELECT PPId id FROM KFJL_PP WHERE UserId = ${user.id})
      `;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      where += `
        AND AZGSId in (SELECT AZGSId id FROM GLY_AZGS WHERE UserId = ${user.id})
      `;
    } else if (user.JS === DBTables.JS.AZG) {
      where += `
        AND AZGUserId = ${user.id}
      `;
    }

    where = where.trim();
    if (where.startsWith('AND')) {
      where = where.substr(4);
    }
    if (!where) where = '1';

    let selector = `COUNT(*) as total`;

    let sql = `
    SELECT
      max(DDId) DDId, max(DD_name) DD_name, max(PPId) PPId, max(PP_name) PP_name, max(GTId) GTId, max(GT_name) GT_name, max(GT_code) GT_code
    FROM (
      SELECT 
        a.DDId,
        a.GTId,
        a.PPId,
        b.name GT_name,
        b.code GT_code,
        c.name DD_name,
        d.name PP_name,
        'WL' type,
        e.AZGSId
      FROM 
        DD_GT_WLSnapshot a
      JOIN 
        GT b
      ON 
        a.GTId = b.id
      LEFT JOIN 
        DD c
      ON 
        a.DDId = c.id
      LEFT JOIN 
        PP d
      ON 
        a.PPId = d.id
      JOIN 
        DD_GT_WL e
      ON 
        e.DDId = a.DDId AND e.GTId = a.GTId AND e.WLId = a.WLId
      
      UNION
      
      SELECT 
        a.DDId,
        a.GTId,
        b.PPId,
        b.name GT_name,
        b.code GT_code,
        c.name DD_name,
        d.name PP_name,
        'DP' type,
        e.AZGSId
      FROM 
        DD_DW_DPSnapshot a
      JOIN 
        GT b
      ON 
        a.GTId = b.id
      LEFT JOIN 
        DD c
      ON 
        a.DDId = c.id
      LEFT JOIN 
        PP d
      ON 
        a.PPId = d.id
      JOIN 
        DD_DW_DP e
      ON 
        e.DDId = a.DDId AND e.DWId = a.DWId AND e.DPId = a.DPId
    ) a
    WHERE
      ${where}
    GROUP BY CONCAT(DDId,'-',GTId)
    `;

    let total = await DBTables.sequelize.query(`
      SELECT
        COUNT(*) total
      FROM (${sql}) a
    `, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    sql += `
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
