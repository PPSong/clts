import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class DanDuShenPiTongGuoWLBHb extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, PPJLNote } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBH的id存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致
    const tmpWLBH = await DBTables.WLBH.findOne({
      include: [
        {
          model: DBTables.GT,
          as: 'GT',
        },
      ],
      where: {
        id,
      },
      transaction,
    });

    if (!tmpWLBH) {
      throw new Error(`物料补货记录id:${id}不存在!`);
    }
    
    await user.checkPPId(tmpWLBH.GT.PPId, transaction);

    if (tmpWLBH.status !== DBTables.WLBHStatus.KFJLSPTG) {
      throw new Error(`物料补货记录:${tmpWLBH}状态不属于${DBTables.WLBHStatus.KFJLSPTG}!`);
    }
    // end 检查WLBH的id存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    ppUtils.changeWLBHsStatus([id], DBTables.WLBHStatus.TG, user, transaction, PPJLNote);
  }
}
