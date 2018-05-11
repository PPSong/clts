import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetYJZXTimeGT0BHDPZhuangXiangList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { curPage, YJZXTime, GTId } = req.body;

    const perPage = 50;

    const tmpGYSId = await user.getGYSId(transaction);

    // 查询记录
    const sql = `
    SELECT
      a.DPId,
      b.name DPName,
      c.name DWName,
      c.CC,
      c.CZ,
      1 number,
      a.ZXNumber,
      a.status DPBHStatus
    FROM
      DPBH a
    JOIN
      DP b
    ON
      a.DPId = b.id
    JOIN
      DW c
    ON
      a.DWId = c.id
    JOIN
      GT d
    ON
      c.GTId = d.id
    WHERE
      a.YJZXTime = ${YJZXTime}
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
