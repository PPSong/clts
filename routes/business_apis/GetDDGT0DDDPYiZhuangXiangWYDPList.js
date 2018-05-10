import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDGT0DDDPYiZhuangXiangWYDPList extends BusinessQueryApiBase {
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
      c.id DPId,
      c.name DPName,
      b.EWM WYDPEWM,
      d.EWM KDXEWM
    FROM
      DD_DW_DP a
    JOIN
      WYDP b
    ON
      b.DDDWDPId = a.id
    JOIN
      DP c
    ON
      a.DPId = c.id
    JOIN
      KDX d
    ON
      b.KDXId = d.id
    JOIN
      DW e
    ON
      a.DWId = e.id
    WHERE
      a.DDId = ${DDId}
    AND
      e.GTId = ${GTId}
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
