import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';
import * as Utils from '../../weroll/utils/Utils';

export default class GenerateUniqueDDGTDPs extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN,DBTables.JS.PPJL,DBTables.JS.KFJL,DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { DDGTs } = req.body;

    const result = {};

    for (let item of DDGTs) {
      let DD_DW_DPs = await DBTables.DD_DW_DPSnapshot.findAll({ where:{ DDId: item.DDId, GTId: item.GTId }, transaction });
      let list = [];
      let i = 0;
      for (let DD_DW_DPSnapshot of DD_DW_DPs) {
        let typeData = DD_DW_DPSnapshot.toJSON();
        delete typeData['id'];
        delete typeData['createdAt'];
        delete typeData['updatedAt'];
        delete typeData['version'];
  
        let hex = Utils.md5(Date.now() + '-' + i + '-' + DD_DW_DPSnapshot.id + '-' + Utils.randomString(8));
        hex = hex.substr(Math.round(Math.random() * 18), 12).toUpperCase();
        hex = 'DP' + Utils.randomNumber(4) + hex;
        let qrcode = { info:{...typeData,type:"DP",typeId:DD_DW_DPSnapshot.DPId}, uuid:hex };
        list.push(qrcode);
        i++;
      }
      result[item.DDId + '_' + item.GTId] = list;
    }

    return result;
  }
}
