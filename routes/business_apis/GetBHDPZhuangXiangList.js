import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetBHDPZhuangXiangList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { keyword, curPage } = req.body;

    const perPage = 50;

    const tmpGYSId = await user.getGYSId(transaction);

    const keywordWhere = keyword ? `
      (
        cc.name LIKE '%${keyword}%'
      OR
        bb.name LIKE '%${keyword}%'
      )
    ` : '1';

    // 查询记录
    const sql = `
    SELECT
      bb.PPId,
      cc.name PPName,
      aa.YJZXTime,
      aa.GTId,
      bb.name GTName,
      aa.totalNumber,
      aa.totalZXNumber
    FROM
      (
      SELECT
        a.YJZXTime,
        b.GTId,
        SUM(1) totalNumber,
        SUM(a.ZXNumber) totalZXNumber
      FROM
        DPBH a
      JOIN
        DW b
      ON
        a.DWId = b.id
      WHERE
        a.status = '${DBTables.DPBHStatus.YFPFHGYS}'
      AND
        a.GYSId = ${tmpGYSId}
      AND
        a.YJZXTime IS NOT NULL
      GROUP BY
        a.YJZXTime,
        b.GTId
      ) aa
      JOIN
      GT bb
    ON
      aa.GTId = bb.id
    JOIN
      PP cc
    ON
      bb.PPId = cc.id
    WHERE
      1
    AND
      ${keywordWhere}
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
