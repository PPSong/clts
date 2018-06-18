import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class getYJZHInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { YJZHId } = req.body;

    await user.checkYJZHId(YJZHId, transaction);

    let r = await DBTables.sequelize.query(`
      select
        a.id, a.name, a.imageUrl, a.XGTNote, a.disabledAt, 
        a.WLId,
        c.name as WLName,
        a.PPId,
        b.name as PPName
      from
      (select 
        a.id, a.name, a.imageUrl, a.XGTNote, a.disabledAt, 
        a.WLId,
        a.PPId
      from
        YJZH as a
      where a.id=${YJZHId}) as a
      left join PP as b on a.PPId = b.id
      left join WL as c on a.WLId = c.id
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    if (r && r[0]) {
      r = r[0];

      r.EJZHs = await DBTables.sequelize.query(`
        select b.id, b.name, a.number, b.PPId, b.disabledAt
        from (select * from YJZH_EJZH where YJZHId=${YJZHId}) as a
        left join EJZH as b on a.EJZHId = b.id`,
        { type: DBTables.sequelize.QueryTypes.SELECT });

      r.XGTs = await DBTables.sequelize.query(`select * from YJZHXGT where YJZHId=${YJZHId}`, { type: DBTables.sequelize.QueryTypes.SELECT });
      r.XGTs = r.XGTs.map(xgt => {
        return xgt.imageUrl;
      });
    }
    return r;
  }
}
