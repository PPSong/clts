import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDPAnZhuangFanKuiDetail extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.AZG, DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id } = req.body;

    let moreWhere = ``;

    if ([DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL].indexOf(user.JS) >= 0) {
      await user.checkDDId(id, transaction);
    } else if (user.JS === DBTables.JS.AZG) {
      moreWhere = ` AND d.id = ${user.id}`;
    } else if (user.JS === DBTables.JS.AZGSGLY) {
      moreWhere = ` AND c.id in (SELECT AZGSId as id FROM GLY_AZGS WHERE UserId = ${user.id})`;
    }

    const result = {};

    // 查询记录
    let sql = `
    SELECT 
      DDId, 
      AZFKType, 
      AZFKNote, 
      imageUrl, 
      AZGSId, 
      c.name AZGS_name,
      AZGUserId, 
      d.username AZGUser_username,
      d.name AZGUser_name,
      d.phone AZGUser_phone,
      d.mail AZGUser_mail,
      a.DPId
    FROM
      WYDP a
    LEFT JOIN
      DD_DW_DP b
    ON
      a.DDDWDPId = b.id
    LEFT JOIN
      AZGS c
    ON
      b.AZGSId = c.id
    LEFT JOIN
      User d
    ON
      b.AZGUserId = d.id
    WHERE 
      DDId = ${id} AND a.status = '${DBTables.WYWLStatus.FK} ${moreWhere}'
    `;

    result.FKs = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    sql = `
    SELECT 
      imageUrl
    FROM
      DPQJFKT
    WHERE 
      DDId = ${id}
    `;

    result.QJFKTs = await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });
    result.QJFKTs = result.QJFKTs.map(item => {
      return item.imageUrl;
    });

    return result;
    // end 查询记录
  }
}
