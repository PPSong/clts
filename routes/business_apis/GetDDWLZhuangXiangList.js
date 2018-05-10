import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDWLZhuangXiangList extends BusinessQueryApiBase {
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
      OR
        dd.name LIKE '%${keyword}%'
      )
    ` : '1';

    // 查询记录
    const sql = `
    SELECT
      bb.id PPId,
      cc.name PPName,
      aa.DDId,
      bb.name DDName,
      aa.GTId,
      dd.name GTName,
      aa.totalNumber,
      aa.totalZXNumber
    FROM
      (
      SELECT
        a.DDId,
        a.GTId,
        SUM(a.number) totalNumber,
        SUM(a.ZXNumber) totalZXNumber
      FROM
        DD_GT_WL a
      WHERE
        a.GYSId = ${tmpGYSId}
      GROUP BY
        a.DDId,
        a.GTId
      ) aa
    JOIN
      DD bb
    ON
      aa.DDId = bb.id
    JOIN
      PP cc
    ON
      bb.PPId = cc.id
    JOIN
      GT dd
    ON
      aa.GTId = dd.id
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
