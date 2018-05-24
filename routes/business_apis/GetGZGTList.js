import BusinessQueryApiBase from '../BusinessQueryApiBase';
import { sequelize, JS, GZ } from '../../models/Model';
import * as DBTables from '../../models/Model';

export default class GetGZGTList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [JS.ADMIN, JS.PPJL, JS.KFJL, JS.GZ];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { GZUserId, fields } = req.body;

    if (user.JS !== JS.GZ) {
      if (!GZUserId) throw new Error('参数错误. 柜长不存在.');
      // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
      await user.checkGZUserId(GZUserId, transaction);
    } else {
      GZUserId = user.id;
    }

    const list = await sequelize.query(`SELECT ${fields ? fields : '*'} FROM GT WHERE GZUserId = '${GZUserId}'`, { type: sequelize.QueryTypes.SELECT });
    return list;
  }
}
