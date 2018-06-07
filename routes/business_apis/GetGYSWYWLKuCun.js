import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGYSWYWLKuCun extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage } = req.body;

    perPage = perPage || 50;

    const tmpGYSId = await user.getGYSId(transaction);

    const keywordWhere = keyword ? `
    (
      bb.name LIKE '%${keyword}%'
    OR
      bb.code LIKE '%${keyword}%'
    )
  ` : '1';

    // 查询记录
    const sql = `
    SELECT
      aa.WLId WLId,
      bb.name WLName,
      bb.code WLCode,
      aa.number number
    FROM
      (
      SELECT
        a.WLId,
        count(1) number
      FROM
        WYWL a
      WHERE
        a.status = '${DBTables.WYWLStatus.RK}'
      AND
        a.GYSId = ${tmpGYSId}
      GROUP BY
        a.WLId
      ) aa
    JOIN
      WL bb
    ON
      aa.WLId = bb.id
    WHERE
      1
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
