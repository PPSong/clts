import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';
import * as Utils from '../../weroll/utils/Utils';

const MAX_PER_PAGE = 100;

const fetchItems = (where, transaction, curPage, perPage, callBack) => {
  DBTables.sequelize.query(`
    SELECT 
      a.id, b.DDId, b.DWId, b.DPId, b.GTId, b.PPId, b.CC, b.CZ, b.DPName, b.DPImageUrl, c.GYSId ProduceGYSId
    FROM
      DD_DW_DP a
    JOIN
      DD_DW_DPSnapshot b
    ON 
      a.DWId = b.DWId AND a.DPId = b.DPId AND a.DDId = b.DDId
    LEFT JOIN
      DP c
    ON 
      a.DPId = c.id
    WHERE
      ${where}
    LIMIT ${perPage}
    OFFSET ${curPage * perPage}
  `, { 
    transaction, 
    type: DBTables.sequelize.QueryTypes.SELECT,
  }).then(res => {
    callBack && callBack(null, res);
  }).catch(err => {
    callBack && callBack(err);
  });
}

const fetchAllItems = async (where, transaction) => {
  return new Promise((resolve, reject) => {
      let items = [];
      let page = 0;
      let done = (err, list) => {
          if (err) return reject(err);
          items = items.concat(list);
          if (list.length < MAX_PER_PAGE) {
              return resolve(items);
          } else {
              page ++;
              fetchItems(where, transaction, page, MAX_PER_PAGE, done);
          }
      }
      fetchItems(where, transaction, page, MAX_PER_PAGE, done);
  });
}

export default class GenerateUniqueDDGTDPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN,DBTables.JS.PPJL,DBTables.JS.KFJL,DBTables.JS.GYSGLY,DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { DDGTs } = req.body;

    const result = {};

    const DWHash = {}, GTHash = {}, GYSHash = {}, PPHash = {};

    for (let item of DDGTs) {

      let moreWhere = ` b.DDId = ${item.DDId} AND b.GTId = ${item.GTId} `;

      if (user.JS === DBTables.JS.GYSGLY) {
        moreWhere += `
          AND a.GYSId in (SELECT GYSId id FROM GLY_GYS WHERE UserId = ${user.id})
        `;
      } else if (user.JS === DBTables.JS.ZHY) {
        moreWhere += `
          AND a.GYSId in (SELECT GYSId id FROM ZHY_GYS WHERE UserId = ${user.id})
        `;
      } else {
        const tmpDDId = await user.checkDDId(item.DDId, transaction);
      }

      let DD_DW_DPs = await fetchAllItems(moreWhere, transaction);
      let list = [];
      let i = 0;
      for (let DD_DW_DP of DD_DW_DPs) {
        let typeData = {...DD_DW_DP};
        delete typeData['id'];
        delete typeData['createdAt'];
        delete typeData['updatedAt'];
        delete typeData['version'];

        if (!typeData.DWName) {
          let DW = DWHash[DD_DW_DP.DWId] ? DWHash[DD_DW_DP.DWId] : (await DBTables.DW.findOne({ where: { id: DD_DW_DP.DWId }, transaction }));
          if (!DW) {
            throw new Error('无灯位数据!');
          }
          DWHash[DD_DW_DP.DWId] = DW;
    
          typeData.DWName = DW.name;
        }
    
        let GYS = GYSHash[DD_DW_DP.ProduceGYSId] ? GYSHash[DD_DW_DP.ProduceGYSId] : (await DBTables.GYS.findOne({ where: { id: DD_DW_DP.ProduceGYSId }, transaction }));
        if (!GYS) {
          throw new Error('无生产供应商数据!');
        }
        GYSHash[DD_DW_DP.ProduceGYSId] = GYS;
        typeData.GYSName = GYS.name;
    
        let PP = PPHash[DD_DW_DP.PPId] ? PPHash[DD_DW_DP.PPId] : (await DBTables.PP.findOne({ where: { id: DD_DW_DP.PPId }, transaction }));
        if (!PP) {
          throw new Error('无品牌数据!');
        }
        PPHash[DD_DW_DP.PPId] = PP;
        typeData.PPName = PP.name;
    
        let GT = GTHash[DD_DW_DP.GTId] ? GTHash[DD_DW_DP.GTId] : (await DBTables.GT.findOne({ where: { id: DD_DW_DP.GTId }, transaction }));
        if (!GT) {
          throw new Error('无柜台数据!');
        }
        GTHash[DD_DW_DP.GTId] = GT;
        typeData.GTName = GT.name;
  
        let hex = Utils.md5(Date.now() + '-' + i + '-' + DD_DW_DP.id + '-' + Utils.randomString(8));
        hex = hex.substr(Math.round(Math.random() * 18), 12).toUpperCase();
        hex = 'DP' + Utils.randomNumber(4) + hex;
        let qrcode = { info:{...typeData,type:"DP",typeId:DD_DW_DP.DPId}, uuid:hex };
        list.push(qrcode);
        i++;
      }
      result[item.DDId + '_' + item.GTId] = list;
    }

    return result;
  }
}
