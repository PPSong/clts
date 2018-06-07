import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTKDXs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GTBA, DBTables.JS.GZ];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, DDId, GTId } = req.body;

    perPage = perPage || 50;

    const tmpGTId = await user.getGTId(GTId, transaction);

    let moreWhere = keyword ? `
      AND (
        b.name LIKE '%${keyword}%'
      OR
        CAST(a.YJZXTime as CHAR) LIKE '%${keyword}%'
      OR
        d.code LIKE '%${keyword}%'
      OR
        a.EWM LIKE '%${keyword}%'
      )
    ` : '';
    if (DDId) {
      moreWhere += `
        AND a.DDId = ${DDId} AND a.GTId = ${GTId}
      `;
    }

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
      ${moreWhere}
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
