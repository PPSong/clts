import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHWLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // let { GTId } = req.body;

    // let GT = await user.checkGTId(GTId, transaction);

    let list = await DBTables.sequelize.query(`
      SELECT * FROM DD_GT_WLSnapshot
      WHERE GTId in (SELECT id FROM GT WHERE GTBAUserId = ${user.id})
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