import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0Testers extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, curPage } = req.body;

    const perPage = 50;

    await user.checkDDId(id, transaction);

    // 查询记录
    const sql = `
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
      a.DDId = ${id}
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
    `;

    const r = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return r;
    // end 查询记录
  }
}
