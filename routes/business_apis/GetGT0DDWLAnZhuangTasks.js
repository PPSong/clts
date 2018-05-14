import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0DDWLAnZhuangTasks extends BusinessQueryApiBase {
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
      )
    `
      : '1';

    let AZGWhere;
    if (user.JS === DBTables.JS.GTBA) {
      await user.checkGTId(GTId, transaction);
      AZGWhere = 'a.AZGUserId IS NULL';
    } else {
      AZGWhere = `a.AZGUserId = ${user.id}`;
    }

    // 查询记录
    const sql = `
    SELECT
      c.name WLName,
      c.code WLCode,
      b.EWM WLEWM,
      b.status
    FROM
      DD_GT_WL a
    JOIN
      WYWL b
    ON
      b.DDGTWLId = a.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    WHERE
      a.status IN ('${DBTables.DD_GT_WLStatus.ZXWC}', '${
  DBTables.DD_GT_WLStatus.SH
}', '${DBTables.DD_GT_WLStatus.KPQJT}')
    AND
      a.GTId = ${GTId}
    AND
      ${AZGWhere}
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
