import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class getDPDWsInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DPId, curPage } = req.body;

    const perPage = 50;

    await user.checkDPId(DPId, transaction);

    // 查询记录
    const sql = `
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

    const r = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return r;
    // end 查询记录
  }
}
