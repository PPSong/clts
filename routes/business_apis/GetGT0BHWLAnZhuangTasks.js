import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHWLAnZhuangTasks extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage, GTId } = req.body;

    const perPage = 50;

    const keywordWhere = keyword
      ? `
      (
        c.name LIKE '%${keyword}%'
      OR
        c.code LIKE '%${keyword}%'
      OR
        CAST(a.YJAZDate AS CHAR) LIKE '%${keyword}%'
      )
    `
      : '1';

    let tmpWhere;
    if (user.JS === DBTables.JS.GTBA) {
      const tmpGTId = await user.getGTId(transaction);
      tmpWhere = `a.AZGUserId IS NULL and a.GTId = ${tmpGTId}`;
    } else {
      tmpWhere = `a.AZGUserId = ${user.id}`;
    }

    // 查询记录
    const sql = `
    SELECT
      d.id GTId,
      d.name GTName,
      a.YJAZDate,
      c.name WLName,
      c.code WLCode,
      b.EWM WLEWM,
      b.status
    FROM
      WLBH a
    JOIN
      WYWL b
    ON
      b.WLBHId = a.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    JOIN
      GT d
    ON
      a.GTId = d.id
    WHERE
      1
    AND
      a.status IN ('${DBTables.WLBHStatus.ZXWC}', '${DBTables.WLBHStatus.SH}')
    AND
      ${tmpWhere}
    AND
      ${keywordWhere}
    ORDER BY
      d.name,
      a.YJAZDate DESC
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
