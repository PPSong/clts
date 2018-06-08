import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTWuLius extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage } = req.body;

    perPage = perPage || 50;

    let moreWhere = keyword ? `AND ({NAME} LIKE '%${keyword}%' OR GT_name LIKE '%${keyword}%' OR GT_code LIKE '%${keyword}%' OR PP_name LIKE '%${keyword}%')` : '';

    if (user.JS === DBTables.JS.ADMIN) {
      //do nothing
    } else if (user.JS === DBTables.JS.PPJL) {
      moreWhere += ` AND PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      moreWhere += ` AND PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    }

    let sql = `
    SELECT 
      a.GTId, a.GT_name, a.GT_code, a.PPId, a.PP_name, a.DD_name name, a.DDId DDorBHKey, type, '上市' task
    FROM
      V_DD_GT_WLGroupedList a
    WHERE 
      status = '已审批' ${moreWhere.replace('{NAME}', 'a.DD_name')}
      
    UNION

    SELECT 
      b.GTId, b.GT_name, b.GT_code, b.PPId, b.PP_name, b.DD_name name, b.DDId DDorBHKey, type, '上市' task
    FROM
      V_DD_DW_DPGroupedList b
    WHERE 
      status = '已审批' ${moreWhere.replace('{NAME}', 'b.DD_name')}
      
    UNION

    SELECT 
      c.GTId, c.GT_name, c.GT_code, c.PPId, c.PP_name, c.YJZXTime name, c.YJZXTime DDorBHKey, type, '补货' task
    FROM
      V_WLBHGroupedList c
    WHERE 
      c.YJZXTime IS NOT NULL ${moreWhere.replace('{NAME}', 'c.YJZXTime')}
      
    UNION

    SELECT 
      d.GTId, d.GT_name, d.GT_code, d.PPId, d.PP_name, d.YJZXTime name, d.YJZXTime DDorBHKey, type, '补货' task
    FROM
      V_DPBHGroupedList d
    WHERE 
      d.YJZXTime IS NOT NULL ${moreWhere.replace('{NAME}', 'd.YJZXTime')}
    `;

    let total = await DBTables.sequelize.query(`
    SELECT
      COUNT(*) as total
    FROM (
      ${sql}
    ) a
    `, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

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
