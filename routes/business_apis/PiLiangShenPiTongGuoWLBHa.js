import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangShenPiTongGuoWLBHa extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBH的ids存在, 且状态属于CS, 且所属PPId和操作者一致
    for (let i = 0; i < ids.length; i++) {
      const tmpWLBH = await DBTables.WLBH.findOne({
        include: [
          {
            model: DBTables.GT,
            as: 'GT',
          },
        ],
        where: {
          id: ids[i],
        },
        transaction,
      });

      if (!tmpWLBH) {
        throw new Error(`物料补货记录id:${ids[i]}不存在!`);
      }

      await user.checkPPId(tmpWLBH.GT.PPId, transaction);

      if (tmpWLBH.status !== DBTables.WLBHStatus.CS) {
        throw new Error(`物料补货记录:${tmpWLBH}状态不属于${DBTables.WLBHStatus.CS}!`);
      }
    }
    // end 检查WLBH的ids存在, 且状态属于CS, 且所属PPId和操作者一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    ppUtils.changeWLBHsStatus(ids, DBTables.WLBHStatus.KFJLSPTG, user, transaction);
  }
}
