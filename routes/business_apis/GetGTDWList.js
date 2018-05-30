import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGTDWList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, GTId } = req.body;

    let GT = await user.checkGTId(GTId, transaction);

    const list = await DBTables.sequelize.query(`
      select DW.id, DW.name, DW.CC, DW.CZ, DW.DPId, DP.name as DP_name, DP.imageUrl as DP_imageUrl
      from (
        select * 
        from DW
        where DW.GTId = '${GTId}'
      ) as DW
      left join DP on DW.DPId = DP.id
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    return list || [];
  }
}
