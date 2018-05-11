import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGYSXiangGuanKDXs extends BusinessQueryApiBase {
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
      b.name WLName,
      b.code WLCode,
      a.number,
      a.ZXNumber,
      a.status DD_GT_WLStatus
    FROM
      DD_GT_WL a
    JOIN
      WL b
    ON
      a.WLId = b.id
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
