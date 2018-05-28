import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';

export default class getEJZHInfo extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return '*';
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { EJZHId } = req.body;

    await user.checkEJZHId(EJZHId, transaction);

    let r = await DBTables.sequelize.query(`
      select
        a.id, a.name, a.imageUrl, a.disabledAt, 
        a.WLId,
        c.name as WLName,
        a.PPId,
        b.name as PPName
      from
      (select 
        a.id, a.name, a.imageUrl, a.disabledAt, 
        a.WLId,
        a.PPId
      from
        EJZH as a
      where a.id=${EJZHId}) as a
      left join PP as b on a.PPId = b.id
      left join WL as c on a.WLId = c.id
    `, { type: DBTables.sequelize.QueryTypes.SELECT });
    if (r && r[0]) {
      r = r[0];

      r.SJWLs = await DBTables.sequelize.query(`
        select b.id, b.name, a.number, b.code, b.level, b.PPId, b.GYSId, b.note, b.disabledAt 
        from (select * from EJZH_SJWL where EJZHId=${EJZHId}) as a
        left join WL as b on a.WLId = b.id`, 
        { type: DBTables.sequelize.QueryTypes.SELECT });

      r.FGTesters = await DBTables.sequelize.query(`
      select b.id, b.name, a.number, b.Code1, b.Code2, b.Code3, b.Code4, b.Code5, b.PPId, b.disabledAt 
      from (select * from EJZH_FGTester where EJZHId=${EJZHId}) as a
      left join FGTester as b on a.FGTesterId = b.id`, { type: DBTables.sequelize.QueryTypes.SELECT });

      r.XGTs = await DBTables.sequelize.query(`select * from EJZHXGT where EJZHId=${EJZHId}`, { type: DBTables.sequelize.QueryTypes.SELECT });
      r.XGTs = r.XGTs.map(xgt => {
        return xgt.imageUrl;
      });
    }
    return r;
  }
}
