import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTBADDTasks extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage } = req.body;

    const perPage = 50;

    const tmpGTId = await user.getGTId(transaction);

    const keywordWhere = keyword ? `
    (
      cc.name LIKE '%${keyword}%'
    OR
      bb.name LIKE '%${keyword}%'
    OR
      dd.name LIKE '%${keyword}%'
    OR
      aa.name LIKE '%${keyword}%'
    )
  ` : '1';

    // 查询记录
    const sql = `
    SELECT
      cc.id PPId,
      cc.name PPName,
      aa.YJAZDate,
      aa.DDId,
      bb.name taskName,
      aa.GTId,
      dd.name GTName,
      aa.type
    FROM
      (
      SELECT
        a.DDId,
        a.GTId,
        'WL' type,
        a.YJAZDate
      FROM
        DD_GT_WL a
      WHERE
        a.AZGUserId IS NULL
      AND
        a.GTId = ${tmpGTId}
      GROUP BY
        a.DDId,
        a.GTId,
        a.YJAZDate
    
      UNION ALL
    
      SELECT
        a.DDId,
        b.GTId,
        'DP' type,
        a.YJAZDate
      FROM
        DD_DW_DP a
      JOIN
        DW b
      ON
        a.DWId = b.id
      WHERE
        a.AZGUserId IS NULL
      AND
        b.GTId = ${tmpGTId}
      GROUP BY
        a.DDId,
        b.GTId,
        a.YJAZDate
      ) AS aa
    JOIN
      DD bb
    ON
      aa.DDId = bb.id
    JOIN
      PP cc
    ON
      bb.PPId = cc.id
    JOIN
      GT dd
    ON
      aa.GTId = dd.id
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
