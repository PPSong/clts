import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetAZGDDTasks extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage } = req.body;

    const perPage = 50;

    const keywordWhere = keyword ? `
    (
      cc.name LIKE '%${keyword}%'
    OR
      bb.name LIKE '%${keyword}%'
    OR
      dd.name LIKE '%${keyword}%'
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
      (
        a.Status = '${DBTables.DD_GT_WLStatus.ZXWC}'
      OR
        a.Status = '${DBTables.DD_GT_WLStatus.SH}'
      OR
        a.Status = '${DBTables.DD_GT_WLStatus.KPQJT}'
      )
      AND
        a.AZGUserId = ${user.id}
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
      (
        a.Status = '${DBTables.DD_DW_DPStatus.ZXWC}'
      OR
        a.Status = '${DBTables.DD_DW_DPStatus.SH}'
      OR
        a.Status = '${DBTables.DD_DW_DPStatus.KPQJT}'
      )
      AND  
        a.AZGUserId = ${user.id}
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
