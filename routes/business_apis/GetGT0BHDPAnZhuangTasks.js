import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHWLAnZhuangTasks extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage } = req.body;

    const perPage = 50;

    const keywordWhere = keyword
      ? `
      (
        e.name LIKE '%${keyword}%'
      OR
        c.name LIKE '%${keyword}%'
      OR
        CAST(a.YJAZDate AS CHAR) LIKE '%${keyword}%'
      )
    `
      : '1';

    let tmpWhere;
    if (user.JS === DBTables.JS.GTBA) {
      const tmpGTId = await user.getGTId(transaction);
      tmpWhere = `a.AZGUserId IS NULL AND d.GTId = ${tmpGTId}`;
    } else {
      tmpWhere = `a.AZGUserId = ${user.id}`;
    }

    // 查询记录
    const sql = `
    SELECT
      e.id GTId,
      e.name GTName,
      a.YJAZDate,
      c.name DPName,
      b.EWM DPEWM,
      b.status
    FROM
      DPBH a
    JOIN
      WYDP b
    ON
      b.DPBHId = a.id
    JOIN
      DP c
    ON
      a.DPId = c.id
    JOIN
      DW d
    ON
      a.DWId = d.id
    JOIN
      GT e
    ON
      d.GTId = e.id
    WHERE
      a.status IN ('${DBTables.DPBHStatus.ZXWC}', '${DBTables.DPBHStatus.SH}')
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
