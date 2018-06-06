import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetCurUserInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    // 查询记录
    let sql = ``;
    switch (user.JS) {
      case DBTables.JS.ADMIN:
        sql = `
          SELECT
            aa.id,
            aa.username,
            aa.phone,
            aa.mail,
            aa.name,
            aa.JS
          FROM
            User aa
          WHERE
            aa.id = ${user.id}
        `;
        break;
      case DBTables.JS.PPJL:
        sql = `
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
              b.PPId
            FROM
              User a
            LEFT JOIN
              PPJL_PP b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            PP bb
          ON
            aa.PPId = bb.id
        `;
        break;
      case DBTables.JS.KFJL:
        sql = `
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
              b.PPId
            FROM
              User a
            LEFT JOIN
              KFJL_PP b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            PP bb
          ON
            aa.PPId = bb.id
        `;
        break;
      case DBTables.JS.AZGSGLY:
        sql = `
          SELECT
            aa.id,
            aa.username,
            aa.phone,
            aa.mail,
            aa.name,
            aa.JS,
            aa.AZGSId,
            bb.name AZGSName
          FROM
            (
            SELECT
              a.id,
              a.username,
              a.phone,
              a.mail,
              a.name,
              a.JS,
              b.AZGSId
            FROM
              User a
            LEFT JOIN
              GLY_AZGS b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            AZGS bb
          ON
            aa.AZGSId = bb.id
        `;
        break;
      case DBTables.JS.AZG:
        sql = `
          SELECT
            aa.id,
            aa.username,
            aa.phone,
            aa.mail,
            aa.name,
            aa.JS,
            aa.AZGSId,
            bb.name AZGSName
          FROM
            (
            SELECT
              a.id,
              a.username,
              a.phone,
              a.mail,
              a.name,
              a.JS,
              b.AZGSId
            FROM
              User a
            LEFT JOIN
              AZG_AZGS b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            AZGS bb
          ON
            aa.AZGSId = bb.id
        `;
        break;
      case DBTables.JS.GYSGLY:
        sql = `
          SELECT
            aa.id,
            aa.username,
            aa.phone,
            aa.mail,
            aa.name,
            aa.JS,
            aa.GYSId,
            bb.name GYSName,
            bb.type GYSType
          FROM
            (
            SELECT
              a.id,
              a.username,
              a.phone,
              a.mail,
              a.name,
              a.JS,
              b.GYSId
            FROM
              User a
            LEFT JOIN
              GLY_GYS b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            GYS bb
          ON
            aa.GYSId = bb.id
        `;
        break;
      case DBTables.JS.ZHY:
        sql = `
          SELECT
            aa.id,
            aa.username,
            aa.phone,
            aa.mail,
            aa.name,
            aa.JS,
            aa.GYSId,
            bb.name GYSName,
            bb.type GYSType
          FROM
            (
            SELECT
              a.id,
              a.username,
              a.phone,
              a.mail,
              a.name,
              a.JS,
              b.GYSId
            FROM
              User a
            LEFT JOIN
              ZHY_GYS b
            ON
              a.id = b.UserId
            WHERE
              a.id = ${user.id}
            ) aa
          JOIN
            GYS bb
          ON
            aa.GYSId = bb.id
        `;
        break;
    }

    const r = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return r[0];
    // end 查询记录
  }
}
