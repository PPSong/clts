import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDGT0DDWLYiZhuangXiangWYWLList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { curPage, DDId, GTId } = req.body;

    const perPage = 50;

    const tmpGYSId = await user.getGYSId(transaction);

    // 查询记录
    const sql = `
    SELECT
      c.id WLId,
      c.name WLName,
      c.code WLCode,
      b.EWM WYWLEWM,
      d.EWM KDXEWM
    FROM
      DD_GT_WL a
    JOIN
      WYWL b
    ON
      b.DDGTWLId = a.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    JOIN
      KDX d
    ON
      b.KDXId = d.id
    WHERE
      a.DDId = ${DDId}
    AND
      a.GTId = ${GTId}
    AND
      a.GYSId = ${tmpGYSId}
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
