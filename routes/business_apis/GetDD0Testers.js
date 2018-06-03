import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0Testers extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { id, curPage, perPage, keyword } = req.body;

    perPage = perPage || 50;

    await user.checkDDId(id, transaction);

    let join = '';
    let moreWhere1 = '', moreWhere2 = '';

    if (keyword && keyword.trim()) {
      if (!join) join = '';
      if (join.indexOf('JOIN DD') < 0) join += ` JOIN GT as b ON DD_GT_FGTester.GTId = b.id JOIN FGTester as c ON DD_GT_FGTester.FGTesterId = c.id`;

      if (!moreWhere1) moreWhere1 = '';
      moreWhere1 += ` AND (b.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.Code1 LIKE '%${keyword}%')`;

      if (!moreWhere2) moreWhere2 = '';
      moreWhere2 += ` AND (b.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.Code1 LIKE '%${keyword}%')`;
    }

    let sql = `
      SELECT 
        count(DD_GT_FGTester.id) as total
      FROM 
        DD_GT_FGTester
      ${join}
      WHERE
        DD_GT_FGTester.DDId = ${id} ${moreWhere1}
    `;
    let total = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    sql = `
    SELECT
      b.name GTName,
      b.code GTCode,
      a.number,
      c.name FGTesterName,
      c.Code1,
      c.Code2,
      c.Code3,
      c.Code4,
      c.Code5
    FROM
      DD_GT_FGTester a
    JOIN
      GT b
    ON
      a.GTId = b.id
    JOIN
      FGTester c
    ON
      a.FGTesterId = c.id
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
