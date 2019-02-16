import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class GetGT0BHWLs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GTId } = req.body;

    let GT = await user.checkGTId(GTId, transaction);

    const list = await DBTables.sequelize.query(`
      select 
        *
      from 
        dd a
      right join 
        (
          select 
            WLId, GTId, DDId, number, GYSId, AZGSId, AZGUserId, status 
          from 
            dd_gt_wl 
          where 
            GTId in (select id from gt where GTBAUserId = ${user.id})
        ) b
      on 
        b.DDId = a.id
      where 
        a.status = '${DBTables.DDStatus.YSP}'
      order by 
        createdAt desc
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    return list || [];
  }
}
