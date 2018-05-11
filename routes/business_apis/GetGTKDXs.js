import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTKDXs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage } = req.body;

    const perPage = 50;

    const tmpGTId = await user.getGTId(transaction);

    const keywordWhere = keyword ? `
      (
        d.name LIKE '%${keyword}%'
      OR
        a.YJZXTime LIKE '%${keyword}%'
      OR
        a.HWType LIKE '%${keyword}%'
      )
    ` : '1';

    // 查询记录
    const sql = `
    SELECT
      IFNULL(b.name, a.YJZXTime) taskName,
      d.id KDDId,
      d.code KDDCode,
      a.EWM KDXEWM,
      a.status
    FROM
      KDX a
    LEFT JOIN
      DD b
    ON
      a.DDId = b.id
    LEFT JOIN
      KDD d
    ON
      a.KDDId = d.id
    WHERE
      a.GTId = ${tmpGTId}
    AND
      ${keywordWhere}
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
