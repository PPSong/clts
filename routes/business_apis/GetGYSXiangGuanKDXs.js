import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGYSXiangGuanKDXs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { curPage } = req.body;

    const perPage = 50;

    const tmpGYSId = await user.getGYSId(transaction);

    // 查询记录
    const sql = `
    SELECT
      c.name PPName,
      IFNULL(d.name, a.YJZXTime) taskName,
      b.name GTName,
      a.EWM KDXEWM,
      e.code KDDCode
    FROM
      KDX a
    JOIN
      GT b
    ON
      a.GTId = b.id
    JOIN
      PP c
    ON
      b.PPId = c.id
    LEFT JOIN
      DD d
    ON
      a.DDId = d.id
    LEFT JOIN
      KDD e
    ON
      a.KDDId = e.id
    WHERE
    (  
      a.status = '${DBTables.KDXStatus.ZX}'
    OR
      a.status = '${DBTables.KDXStatus.FH}'
    )
    AND 
      GYSId = ${tmpGYSId}
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
