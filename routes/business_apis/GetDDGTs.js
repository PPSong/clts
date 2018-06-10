import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetDDGTs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.KFJL, DBTables.JS.PPJL, DBTables.JS.GYSGLY, DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { keyword, curPage, perPage, type } = req.body;

    type = type || 'WL|DP';

    perPage = perPage || 50;

    let produce1 = 'countDDGT', produce2 = 'queryDDGT';
    let args1 = { keyword:`%${keyword || ''}%`, type }, 
        args2 = { keyword: `%${keyword || ''}%`, curPage, perPage, type };

    if (user.JS === DBTables.JS.ADMIN) {
      //do nothing
    } else if (user.JS === DBTables.JS.PPJL) {
      produce1 = 'countDDGTByPPJL(:UserId, :type, :keyword)';
      produce2 = 'queryDDGTByPPJL(:UserId, :curPage, :perPage, :type, :keyword)';
      args1['UserId'] = args2['UserId'] = user.id;
    } else if (user.JS === DBTables.JS.KFJL) {
      produce1 = 'countDDGTByKFJL(:UserId, :type, :keyword)';
      produce2 = 'queryDDGTByKFJL(:UserId, :curPage, :perPage, :type, :keyword)';
      args1['UserId'] = args2['UserId'] = user.id;
    } else if (user.JS === DBTables.JS.GYSGLY) {
      produce1 = 'countDDGTByGYS(:GYSId, :type, :keyword)';
      produce2 = 'queryDDGTByGYS(:GYSId, :curPage, :perPage, :type, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT GYSId id FROM GLY_GYS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['GYSId'] = args2['GYSId'] = r[0].id;
    } else if (user.JS === DBTables.JS.ZHY) {
      produce1 = 'countDDGTByGYS(:GYSId, :type, :keyword)';
      produce2 = 'queryDDGTByGYS(:GYSId, :curPage, :perPage, :type, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT GYSId id FROM ZHY_GYS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['GYSId'] = args2['GYSId'] = r[0].id;
    } 
    /*
    else if (user.JS === DBTables.JS.AZGSGLY) {
      produce1 = 'countDDGTByAZGS(:AZGSId, :keyword)';
      produce2 = 'queryDDGTByAZGS(:AZGSId, :curPage, :perPage, :keyword)';
      const r = await DBTables.sequelize.query(`SELECT AZGSId id FROM GLY_AZGS WHERE UserId = ${user.id}`, {
        transaction,
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      args1['AZGSId'] = args2['AZGSId'] = r[0].id;
    } else if (user.JS === DBTables.JS.AZG) {
      produce1 = 'countDDGTByAZG(:UserId, :keyword)';
      produce2 = 'queryDDGTByAZG(:UserId, :curPage, :perPage, :keyword)';
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
