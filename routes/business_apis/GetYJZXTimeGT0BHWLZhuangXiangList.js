import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetYJZXTimeGT0BHWLZhuangXiangList extends BusinessQueryApiBase {
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
      a.WLId,
      b.name WLName,
      b.code WLCode,
      1 number,
      a.ZXNumber,
      a.status WLBHStatus
    FROM
      WLBH a
    JOIN
      WL b
    ON
      a.WLId = b.id
    WHERE
      a.status = '${DBTables.WLBHStatus.YFPFHGYS}'
    AND
      a.YJZXTime = '${YJZXTime}'
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
