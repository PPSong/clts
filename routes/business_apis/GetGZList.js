import BusinessQueryApiBase from '../BusinessQueryApiBase';
import { sequelize, JS } from '../../models/Model';

export default class GetGZList extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return [JS.ADMIN, JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { name, PPId } = req.body;

    if (user.JS === JS.ADMIN) {
      //
    } else {
      let pps = await user.getKFJLPPs();
      if (pps.length > 0) {
        PPId = pps[0].id;
      }
    }
    if (!PPId) throw new Error('参数错误. 品牌不存在.');

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);

    const list = await sequelize.query(`SELECT user.id, user.name, user.username FROM User WHERE id in (SELECT UserId as id FROM GZ_PP WHERE PPId = '${PPId}') `, { type: sequelize.QueryTypes.SELECT });
    return list;
  }
}
