import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTWuLius extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GYSGLY, DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage } = req.body;

    perPage = perPage || 50;

    let produce1 = 'countGTWuLius(:keyword)', produce2 = 'queryGTWuLius(:curPage, :perPage, :keyword)';
    let args1 = { keyword:`%${keyword || ''}%` }, args2 = { keyword: `%${keyword || ''}%`, curPage, perPage };

    if (user.JS === DBTables.JS.ADMIN) {
      //do nothing
    } else if (user.JS === DBTables.JS.PPJL) {
      produce1 = 'countGTWuLiusByPPJL(:UserId, :keyword)';
      produce2 = 'queryGTWuLiusByPPJL(:UserId, :curPage, :perPage, :keyword)';
      args1['UserId'] = args2['UserId'] = user.id;
    } else if (user.JS === DBTables.JS.KFJL) {
      produce1 = 'countGTWuLiusByKFJL(:UserId, :keyword)';
      produce2 = 'queryGTWuLiusByKFJL(:UserId, :curPage, :perPage, :keyword)';
      args1['UserId'] = args2['UserId'] = user.id;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      produce1 = 'countGTWuLiusByGYS(:GYSId, :keyword)';
      produce2 = 'queryGTWuLiusByGYS(:GYSId, :curPage, :perPage, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT GYSId id FROM GLY_GYS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['GYSId'] = args2['GYSId'] = r[0].id;
    } else if (user.JS === DBTables.JS.ZHY) {
      produce1 = 'countGTWuLiusByGYS(:GYSId, :keyword)';
      produce2 = 'queryGTWuLiusByGYS(:GYSId, :curPage, :perPage, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT GYSId id FROM ZHY_GYS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['GYSId'] = args2['GYSId'] = r[0].id;
    } 
    /*
    else if (user.JS === DBTables.JS.AZGSGLY) {
      produce1 = 'countGTWuLiusByAZGS(:AZGSId, :keyword)';
      produce2 = 'queryGTWuLiusByAZGS(:AZGSId, :curPage, :perPage, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT AZGSId id FROM GLY_AZGS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['AZGSId'] = args2['AZGSId'] = r[0].id;
    } else if (user.JS === DBTables.JS.AZG) {
      produce1 = 'countGTWuLiusByAZG(:UserId, :keyword)';
      produce2 = 'queryGTWuLiusByAZG(:UserId, :curPage, :perPage, :keyword)';
      args1['UserId'] = args2['UserId'] = user.id;
    }
    */
    let total = await DBTables.sequelize.query(`call ${produce1}`, {
      transaction,
      replacements: args1,
    });

    total = total[0].total;

    const list = await DBTables.sequelize.query(`call ${produce2}`, {
      transaction,
      replacements: args2,
    });

    return {
      list, total
    };
    // end 查询记录
  }
}
