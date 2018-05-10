import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDGT0DDDPZhuangXiangList extends BusinessQueryApiBase {
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
      a.DPId,
      b.name DPName,
      1 number,
      a.ZXNumber,
      a.status DD_DW_DPStatus
    FROM
      DD_DW_DP a
    JOIN
      DP b
    ON
      a.DPId = b.id
    JOIN
      DW c
    ON
      a.DWId = c.id
    WHERE
      a.DDId = ${DDId}
    AND
      c.GTId = ${GTId}
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
