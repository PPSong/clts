import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTYJZHList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.AZG, DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GTId } = req.body;

    let GT = await user.checkGTId(GTId, transaction);

    let list = await DBTables.sequelize.query(`
      select YJZHId as id, number 
      from GT_YJZH
      where GTId = ${GTId}
    `, { type: DBTables.sequelize.QueryTypes.SELECT });

    for (let i = 0; i < list.length; i++) {
      let yjzh = await DBTables.YJZH.findOneAsDetail(list[i].id, transaction);
      yjzh.number = list[i].number;
      list[i] = yjzh;
    }

    return list || [];
  }
}
