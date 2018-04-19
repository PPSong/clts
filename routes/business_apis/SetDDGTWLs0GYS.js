import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDGTWLs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DD_GT_WLIds, GYSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await DBTables.GYS.checkIsZZGYSOrMe(GYSId, transaction);

    // 检查DD_GT_WL是否属于同一个DD, 并且当前GYS是操作者所属供应商
    const tmpDD_GT_WLs = await DBTables.DD_GT_WL.findAll({
      include: [
        {
          model: DBTables.WL,
          as: 'WL',
        },
      ],
      where: {
        id: {
          $in: DD_GT_WLIds,
        },
      },
      transaction,
    });

    const tmpDD_GT_WLDDIds = tmpDD_GT_WLs.map(item => item.DDId);
    const tmpUniqueDD_GT_WLDDIds = [...new Set(tmpDD_GT_WLDDIds)];

    if (tmpUniqueDD_GT_WLDDIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个订单!');
    }

    const tmpDDId = tmpUniqueDD_GT_WLDDIds[0];

    const tmpDD_GT_WLGYSIds = tmpDD_GT_WLs.map(item => item.WL.GYSId);
    const tmpUniqueDD_GT_WLGYSIds = [...new Set(tmpDD_GT_WLGYSIds)];

    if (tmpUniqueDD_GT_WLGYSIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个生产供应商!');
    }

    const tmpGYSId = tmpUniqueDD_GT_WLGYSIds[0];

    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查DD_GT_WL是否属于同一个DD, 并且当前GYS是操作者所属供应商

    // 检查订单状态是否是'已审批'
    const tmpDD = await DBTables.DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DBTables.DDStatus.YSP) {
      throw new Error(`${tmpDD}状态为:${tmpDD.status}, 不能指定发货供应商!`);
    }
    // end 检查订单状态是否是'已审批'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.DD_GT_WL.update(
      {
        GYSId,
      },
      {
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
        transaction,
      },
    );
  }
}
