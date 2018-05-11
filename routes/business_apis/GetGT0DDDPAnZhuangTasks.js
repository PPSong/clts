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
        d.name LIKE '%${keyword}%'
      OR
        c.name LIKE '%${keyword}%'
      OR
        b.EWM LIKE '%${keyword}%'
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
      d.name DWName,
      c.name DPName,
      b.EWM WLEWM,
      b.status
    FROM
      DD_DW_DP a
    JOIN
      WYDP b
    ON
      b.DDDWDPId = a.id
    JOIN
      DP c
    ON
      a.DPId = c.id
    JOIN
      DW d
    ON
      a.DWId = d.id
    WHERE
      a.status IN ('${DBTables.DD_DW_DPStatus.ZXWC}', '${
  DBTables.DD_DW_DPStatus.SH
}', '${DBTables.DD_DW_DPStatus.KPQJT}')
    AND
      d.GTId = ${GTId}
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
