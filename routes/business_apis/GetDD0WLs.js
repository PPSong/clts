import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDD0WLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { id, curPage, perPage } = req.body;

    perPage = perPage || 50;

    let join = '';
    let tmp = '', moreWhere1 = '', moreWhere2 = '';

    if (user.JS === DBTables.JS.PPJL || user.JS === DBTables.JS.KFJL) {
      await user.checkDDId(id, transaction);
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      tmp = `in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND AZGSId ${tmp}`;
      moreWhere2 = ` AND d.id ${tmp}`;
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere1 = ` AND AZGUserId = ${user.id}`;
      moreWhere2 = ` AND a.AZGUserId = ${user.id}`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      tmp = `in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND e.id ${tmp}`;
      join = `LEFT JOIN GYS ON DD_GT_WL.GYSId = GYS.id`;
    } else if (user.JS === DBTables.JS.ZHY) {
      tmp = `in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
      moreWhere1 = ` AND GYS.id ${tmp}`;
      moreWhere2 = ` AND e.id ${tmp}`;
      join = `LEFT JOIN GYS ON DD_GT_WL.GYSId = GYS.id`;
    }

    let sql = `
      SELECT 
        count(DD_GT_WL.id) as total
      FROM 
        DD_GT_WL
      ${join}
      WHERE
        DD_GT_WL.DDId = ${id} ${moreWhere1}
    `;
    let total = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    total = total[0].total || 0;

    // 查询记录
    sql = `
    SELECT
      a.id id,
      b.id GTId,
      b.name GT_name,
      b.code GT_code,
      c.id WLId,
      c.level WL_level,
      c.code WL_code,
      c.name WL_name,
      c.imageUrl WL_imageUrl,
      a.number,
      IFNULL(d.name, 'BA') AZLX,
      e.name FHGYS,
      a.GYSId GYSId,
      a.status,
      a.AZGSId,
      d.name AZGS_name,
      a.AZGUserId,
      a.YJRKDate,
      a.YJZXDate,
      IF(IFNULL(f.username,'') = '', 'BA', 'AZG') AZG_role,
      f.name AZGUser_name,
      f.username AZGUser_username,
      f.phone AZGUser_phone,
      a.YJAZDate
    FROM
      DD_GT_WL a
    JOIN
      GT b
    ON
      a.GTId = b.id
    JOIN
      WL c
    ON
      a.WLId = c.id
    LEFT JOIN
      AZGS d
    ON
      a.AZGSId = d.id
    JOIN
      GYS e
    ON
      a.GYSId = e.id
    LEFT JOIN
      User f
    ON
      a.AZGUserId = f.id
    WHERE
      a.DDId = ${id} ${moreWhere2}
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
    `;

    const list = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    return {
      list, total
    };
    // end 查询记录
  }
}
