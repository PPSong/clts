import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDPBHInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { id } = req.body;

    let join = '';
    let where = '', moreWhere = '';
    if (user.JS === DBTables.JS.PPJL) {
      where = `WHERE g.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.KFJL) {
      where = `WHERE g.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      where = `WHERE n.id in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.AZG) {
      where = `WHERE m.id in (SELECT GYSId as id FROM AZG_AZGS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      where = `WHERE a.GYSId in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${user.id})`;
    } else if (user.JS === DBTables.JS.ZHY) {
      where = `WHERE a.GYSId in (SELECT GYSId as id FROM ZHY_GYS WHERE UserId = ${user.id})`;
    }

    moreWhere = ` AND a.id = ${id}`;

    if (moreWhere && !where) {
      where = 'WHERE';
    }
    if (where.trim().toLocaleUpperCase() === 'WHERE') {
      moreWhere = moreWhere.replace('AND', '');
    }
    
    let sql = `
    SELECT
      a.id id,
      a.GYSId GYSId,
      a.status,
      a.ZXNumber,
      a.imageUrl,
      a.YJZXTime,
      a.YJRKDate,
      a.YJAZDate,
      a.reason,
      a.note,
      a.KFJLNote,
      a.PPJLNote,

      d.id DWId,
      d.name DW_name,

      b.id DPId,
      b.name DP_name,
      b.imageUrl DP_imageUrl,
      a.CC,
      a.CZ,

      n.id AZGSId,
      n.name AZGS_name,
      m.id AZGUserId,
      m.name AZGUser_name,
      m.username AZGUser_username,
      m.phone AZGUser_phone,
      
      g.id GTId,
      g.name GT_name,
      g.code GT_code,
      e.id DDId,
      IF(IFNULL(m.id,'') = '', 'BA', 'AZG') AZG_role,

      l.id PPId,
      l.name PP_name
    FROM
      DPBH a
    JOIN
      DP b
    ON
      a.DPId = b.id
    JOIN
      DW d
    ON
      a.DWId = d.id
    LEFT JOIN
      GYS c
    ON
      a.GYSId = c.id
    LEFT JOIN
      DD e
    ON
      a.DDId = e.id
    JOIN
      GT g
    ON
      d.GTId = g.id
    JOIN
      PP l
    ON
      g.PPId = l.id
    LEFT JOIN
      AZGS n
    ON
      a.AZGSId = n.id
    LEFT JOIN
      User m
    ON
      a.AZGUserId = m.id
    ${where} ${moreWhere}
    LIMIT 1
    `;

    const list = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    const r = list[0];
    if (!r) {
      throw new Error('无此数据!');
    }

    return r;
    // end 查询记录
  }
}
