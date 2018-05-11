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
      a.WLId,
      c.name WLName,
      c.code WLCode,
      a.EWM WYWLEWM,
      d.EWM KDXEWM
    FROM
      WYWL a
    JOIN
      DD_GT_WL b
    ON
      a.DDGTWLId = b.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    JOIN
      KDX d
    ON
      a.KDXId = d.id
    WHERE
      a.status = '装箱'
    AND
        b.DDId = ${DDId}
    AND
      b.GTId = ${GTId}
    AND
      b.GYSId = ${tmpGYSId}
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
