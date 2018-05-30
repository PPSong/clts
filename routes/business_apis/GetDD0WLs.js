import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0WLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, curPage } = req.body;

    const perPage = 50;

    await user.checkDDId(id, transaction);

    // 查询记录
    const sql = `
    SELECT
      b.name GTName,
      c.level,
      b.code WLCode,
      a.number,
      c.name WLName,
      IFNULL(d.name, 'BA') AZLX,
      e.name FHGYS,
      a.status,
      a.YJRKDate,
      a.YJZXDate,
      IFNULL(f.username, 'BA') AZG,
      a.YJAZDate
    FROM
      DD_GT_WL a
    JOIN
      GT b
    ON
      a.GTId = b.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    LEFT JOIN
      AZGS d
    ON
      a.AZGSId = d.id
    JOIN
      GYS e
    ON
      a.GYSId = e.id
    LEFT JOIN
      User f
    ON
      a.AZGUserId = f.id
    WHERE
      a.DDId = ${id}
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
