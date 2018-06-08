import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTKDXs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GTBA, DBTables.JS.GZ];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, DDId, YJZXTime, GTId } = req.body;

    perPage = perPage || 50;

    const tmpGTId = await user.checkGTId(GTId, transaction);

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
    } else if (YJZXTime) {
      moreWhere += `
        AND a.YJZXTime = '${YJZXTime}' AND a.GTId = ${GTId}
      `;
    }

    let total = await DBTables.sequelize.query(`
    SELECT
      COUNT(*) total
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
      a.GTId = ${GTId}
      ${moreWhere}
    `, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    let sql = `
    SELECT
      a.id,
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
      a.GTId = ${GTId}
      ${moreWhere}
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
    `;

    const list = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return {
      list, total
    };
    // end 查询记录
  }
}
