import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTKDXs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GTBA, DBTables.JS.GZ, DBTables.JS.GYSGLY, DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, DDId, YJZXTime, GTId, type } = req.body;

    perPage = perPage || 50;

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

    if (type) {
      moreWhere += `
        AND a.HWType = '${type}'
      `;
    }

    if (user.JS === DBTables.JS.GYSGLY) {
      moreWhere += `
        AND a.GYSId in (SELECT GYSId id FROM GLY_GYS WHERE UserId = ${user.id})
      `;
    } else if (user.JS === DBTables.JS.ZHY) {
      moreWhere += `
        AND a.GYSId in (SELECT GYSId id FROM ZHY_GYS WHERE UserId = ${user.id})
      `;
    } else {
      const tmpGTId = await user.checkGTId(GTId, transaction);
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
      e.UserId PHYUserId,
      f.username PHY_username,
      f.name PHY_name,
      e.createdAt PHTime,
      c.id PPId,
      c.name PP_name,
      a.status
    FROM
      KDX a
    LEFT JOIN
      DD b
    ON
      a.DDId = b.id
    JOIN
      GT c0
    ON
      a.GTId = c0.id
    LEFT JOIN
      PP c
    ON
      c0.PPId = c.id
    LEFT JOIN
      KDD d
    ON
      a.KDDId = d.id
    LEFT JOIN
      KDXCZ e
    ON
      a.id = e.KDXId AND e.status = '${DBTables.KDXStatus.ZX}'
    LEFT JOIN
      User f
    ON
      e.UserId = f.id
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
