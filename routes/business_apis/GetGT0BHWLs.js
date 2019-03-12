import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHWLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { isSSBH } = req.body;

    // let GT = await user.checkGTId(GTId, transaction);
    if (!isSSBH) {
      let list = await DBTables.sequelize.query(`
        SELECT a.id, DDId, b.name DDName, GTId,	WLId,	a.name, code, level, imageUrl, GYSId, a.PPId, number, b.createdAt, b.updatedAt, status
        FROM (
          SELECT * FROM DD_GT_WLSnapshot
          WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})
        ) a
        LEFT JOIN
        DD b
        ON a.DDId = b.id AND status = '${DBTables.DDStatus.YSP}'
        ORDER BY createdAt DESC
        LIMIT 1
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
      let lastlyRow = list[0];
      if (!lastlyRow) return [];
  
      // 再查询
      list = await DBTables.sequelize.query(`
        SELECT * FROM DD_GT_WLSnapshot
        WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id}) and DDId = ${lastlyRow.DDId}
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
  
      return list;
    } else {
      let list = await DBTables.sequelize.query(`
        SELECT a.id, a.DDId, b.name DDName, a.GTId,	a.WLId,	c.name, c.code, c.level, c.imageUrl, c.GYSId, b.PPId, a.number, b.createdAt, b.updatedAt, b.status
        FROM (
          SELECT * FROM DD_GT_WL
          WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})
        ) a
        LEFT JOIN
        DD b
        ON a.DDId = b.id AND b.status = '${DBTables.DDStatus.YSP}'
        LEFT JOIN
        WL c
        ON a.WLId = c.id
        ORDER BY b.createdAt DESC
        LIMIT 1
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
      let lastlyRow = list[0];
      if (!lastlyRow) return [];
  
      // 再查询
      list = await DBTables.sequelize.query(`
        SELECT a.id, a.DDId, a.GTId, a.WLId, b.name, b.code, b.level, b.imageUrl, b.GYSId, b.PPId, a.number, a.createdAt, a.updatedAt, a.version
        FROM (
          SELECT * FROM DD_GT_WL
          WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id}) and DDId = ${lastlyRow.DDId}
        ) a
        LEFT JOIN
        WL b
        ON a.WLId = b.id
      `, { type: DBTables.sequelize.QueryTypes.SELECT });
      list = list || [];
  
      return list;
    }
  }
}

// setTimeout(async () => {
//   let list = await DBTables.sequelize.query(`
//     select 
//       *
//     from 
//       DD_GT_WLSnapshot
//   `, { type: DBTables.sequelize.QueryTypes.SELECT });
//   list = list || [];

//   for (let row of list) {
//     // if (row.name) continue;

//     let wl = await DBTables.WL.findOne({ where: {
//       id: row.id
//     } });
//     if (!wl) continue;
//     wl = wl.toJSON();

//     await DBTables.DD_GT_WLSnapshot.update({
//       name: wl.name,
//       code: wl.code,
//       level: wl.level,
//       imageUrl: wl.imageUrl || '',
//       GYSId: wl.GYSId,
//     },{
//       where:{
//         id: row.id
//       }
//     });
//   }

// }, 3000);