import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';
import * as Utils from '../../weroll/utils/Utils';

export default class GenerateUniqueDP extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN,DBTables.JS.PPJL,DBTables.JS.KFJL,DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { DD_DW_DPId, number } = req.body;
    if (Number(number) < 0 || Number(number) > 100) throw new Error('数量必须是0~100之间.');

    let DD_DW_DP = await DBTables.DD_DW_DP.findOne({ where:{ id: DD_DW_DPId }, transaction });
    if (!DD_DW_DP) {
      throw new Error('无此数据!');
    }

    let DD_DW_DPSnapshot = await DBTables.DD_DW_DPSnapshot.findOne({ where:{ DDId:DD_DW_DP.DDId, DWId:DD_DW_DP.DWId, DPId:DD_DW_DP.DPId }, transaction });
    if (!DD_DW_DPSnapshot) {
      throw new Error('无此数据!');
    }
    if (user.JS === DBTables.JS.PPJL || user.JS === DBTables.JS.KFJL) {
      let sql = `
        SELECT COUNT(*) AS total
        FROM
          ${user.JS === DBTables.JS.PPJL ? 'PPJL_PP' : 'KFJL_PP'}
        WHERE 
          PPId in (
            SELECT PPId
            FROM
              GT
            WHERE 
              id in (
                SELECT GTId as id
                FROM
                  DW
                WHERE 
                  id in (
                    SELECT DWId as id
                    FROM
                      DD_DW_DP
                    WHERE
                      id = ${DD_DW_DPId}
                  )
              )
          )
      `;
      let total = await DBTables.sequelize.query(sql, {
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      total = total[0] ? total[0].total : 0;
      if (!total) {
        throw new Error('无此权限!');
      }
    } else if (user.JS === DBTables.JS.GYSGLY) {
      let total = await DBTables.sequelize.query(`
        SELECT COUNT(*) AS total
        FROM GLY_GYS
        WHERE UserId = ${user.id} AND GYSId = ${DD_DW_DP.GYSId}
      `, {
        type: DBTables.sequelize.QueryTypes.SELECT,
      });
      total = total[0] ? total[0].total : 0;
      if (!total) {
        throw new Error('无此权限!');
      }
    }

    let typeData = DD_DW_DPSnapshot.toJSON();
    delete typeData['id'];
    delete typeData['createdAt'];
    delete typeData['updatedAt'];
    delete typeData['version'];

    let result = { info:{...typeData,type:"DP",typeId:DD_DW_DP.DPId}, uuids:[] };
    for (let i = 0; i < number; i++) {
      let hex = Utils.md5(Date.now() + '-' + i + '-' + DD_DW_DPSnapshot.id + '-' + Utils.randomString(8));
      hex = hex.substr(Math.round(Math.random() * 18), 12).toUpperCase();
      hex = 'DP' + Utils.randomNumber(4) + hex;
      result.uuids.push(hex);
    }

    return result;
  }
}
