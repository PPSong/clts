import bCrypt from 'bcryptjs';
import BusinessQueryApiBase from '../BusinessQueryApiBase';
import * as DBTables from '../../models/Model';
import * as Utils from '../../weroll/utils/Utils';

export default class GenerateUniqueWL extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ADMIN,DBTables.JS.PPJL,DBTables.JS.KFJL,DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { WLId, number } = req.body;
    if (Number(number) < 0 || Number(number) > 100) throw new Error('数量必须是0~100之间.');

    let wl = await user.checkWLId(WLId, transaction);
    if (!wl) {
      throw new Error('无此权限!');
    }

    let result = { info:{type:"WL",typeId:wl.id,PPId:wl.PPId}, uuids:[] };
    for (let i = 0; i < number; i++) {
      let hex = Utils.md5(Date.now() + '-' + i + '-' + wl.id + '-' + Utils.randomString(8));
      hex = hex.substr(Math.round(Math.random() * 18), 12).toUpperCase();
      hex = 'WL' + Utils.randomNumber(4) + hex;
      result.uuids.push(hex);
    }

    return result;
  }
}
