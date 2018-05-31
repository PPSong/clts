import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class getDPDWsInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { DPId, curPage, perPage } = req.body;

    curPage = curPage || 0;
    perPage = perPage || 50;

    await user.checkDPId(DPId, transaction);

    let sql = `
    SELECT
      COUNT(*) as total
    FROM
      DW a
    JOIN
      DP b
    ON
      a.DPId = b.id
    WHERE
      b.id = ${DPId}
    `;

    let total = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    sql = `
      SELECT
        a.id DWId,
        a.name DWName,
        a.CC,
        a.CZ,
        c.id GTId,
        c.name GTName,
        c.code,
        b.PPId,
        d.name PPName
      FROM
        DW a
      JOIN
        DP b
      ON
        a.DPId = b.id
      JOIN
        GT c
      ON
        a.GTId = c.id
      JOIN
        PP d
      ON
        b.PPId = d.id
      WHERE
        b.id = ${DPId}
      LIMIT ${perPage}
      OFFSET ${curPage * perPage}
    `;

    let list = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return { list:list, total:total };
    // end 查询记录
  }
}
