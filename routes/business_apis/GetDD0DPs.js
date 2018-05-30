import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0DPs extends BusinessQueryApiBase {
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
      c.name GTName,
      b.name DWName,
      f.name DPName,
      b.CC,
      b.CZ,
      IFNULL(g.name, 'BA') AZLX,
      d.name FHGYS,
      a.status,
      a.YJRKDate,
      a.YJZXDate,
      IFNULL(e.username, 'BA') AZG,
      a.YJAZDate
    FROM
      DD_DW_DP a
    JOIN
      DW b
    ON
      a.DWId = b.id
    JOIN
      GT c
    ON
      b.GTId = c.id
    JOIN
      GYS d
    ON
      a.GYSId = d.id
    LEFT JOIN
      User e
    ON
      a.AZGUserId = e.id
    JOIN
      DP f
    ON
      a.DPId = f.id
    LEFT JOIN
      AZGS g
    ON
      a.AZGSId = g.id
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
