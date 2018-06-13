import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class searchDDByAZGS extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, GTId, PPId } = req.body;

    perPage = perPage || 50;

    let where = '', where1 = '', where2 = '';

    if (keyword) {
      where += ` AND (
          DD_name LIKE '%${keyword}%' 
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
    if (PPId) {
      where += `
        AND PPId = ${PPId}
      `;
    }

    if (user.JS === DBTables.JS.AZGSGLY) {
      where += `
        AND AZGSId in (SELECT AZGSId id FROM GLY_AZGS WHERE UserId = ${user.id})
      `;
    } else if (user.JS === DBTables.JS.AZG) {
      where1 = where2 = `
        WHERE
          AZGUserId = ${user.id}
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
      max(DDId) DDId, max(DD_name) DD_name, max(PPId) PPId, max(PP_name) PP_name, max(AZGSId) AZGSId
    FROM (
      SELECT 
        a.DDId,
        a.PPId,
        c.name DD_name,
        d.name PP_name,
        a0.AZGSId,
        a0.AZGUserId
      FROM 
        DD_GT_WL a0
      JOIN 
        DD_GT_WLSnapshot a
      ON 
        a0.DDId = a.DDId AND a0.GTId = a.GTId AND a0.WLId = a.WLId
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
      ${where1}
      
      UNION
      
      SELECT 
        a.DDId,
        b.PPId,
        c.name DD_name,
        d.name PP_name,
        a0.AZGSId,
        a0.AZGUserId
      FROM 
        DD_DW_DP a0
      JOIN 
        DD_DW_DPSnapshot a
      ON 
        a0.DDId = a.DDId AND a0.DWId = a.DWId AND a0.DPId = a.DPId
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
      ${where2}
    ) a
    WHERE
      ${where}
    GROUP BY CONCAT(DDId)
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
