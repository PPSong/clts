import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetCurUserInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // 查询记录
    const sql = `
    SELECT
      aa.id,
      aa.username,
      aa.phone,
      aa.mail,
      aa.name,
      aa.JS,
      aa.PPId,
      bb.name PPName
    FROM
      (
      SELECT
        a.id,
        a.username,
        a.phone,
        a.mail,
        a.name,
        a.JS,
        IFNULL(b.PPId, c.PPId) PPId
      FROM
        User a
      LEFT JOIN
        PPJL_PP b
      ON
        a.id = b.UserId
      LEFT JOIN
        KFJL_PP c
      ON
        a.id = c.UserId
      WHERE
        a.id = ${user.id}
      ) aa
    JOIN
      PP bb
    ON
      aa.PPId = bb.id
    `;

    const r = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return r[0];
    // end 查询记录
  }
}
