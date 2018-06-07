import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetYJZHGTs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { YJZHId } = req.body;

    let GT = await user.checkYJZHId(YJZHId, transaction);

    let list = await DBTables.sequelize.query(`
      SELECT 
        a.GTId as id, 
        a.number, 
        b.name,
        b.code,
        b.CS,
        b.QY
      FROM 
        GT_YJZH a
      JOIN
        GT b
      ON a.GTId = b.id
      WHERE YJZHId = ${YJZHId}
    `, { type: DBTables.sequelize.QueryTypes.SELECT });

    return list || [];
  }
}
