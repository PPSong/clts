import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangShenPiTongGuoWLBHb extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, note } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBH的ids存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致
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

      if (tmpWLBH.status !== DBTables.WLBHStatus.KFJLSPTG) {
        throw new Error(`物料补货记录:${tmpWLBH}状态不属于${DBTables.WLBHStatus.KFJLSPTG}!`);
      }
    }
    // 检查WLBH的ids存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await ppUtils.changeWLBHsStatus(ids, DBTables.WLBHStatus.TG, user, transaction, null, note || '');
  }
}
