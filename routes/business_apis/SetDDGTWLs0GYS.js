import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDGTWLs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DD_GT_WLIds, GYSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查目标GYSId是用户所属GYS或中转GYS
    await DBTables.GYS.checkIsZZGYSOrMe(GYSId, transaction);
    // end 检查目标GYSId是用户所属GYS或中转GYS

    // 检查DD_GT_WLIds存在
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

    const tmpDD_GT_WLIds = tmpDD_GT_WLs.map(item => item.id);
    const diffIds = _.difference(DD_GT_WLIds, tmpDD_GT_WLIds);
    if (diffIds.length > 0) {
      throw new Error(`订单_柜台_物料记录id:${diffIds}不存在!`);
    }
    // end 检查DD_GT_WLIds存在

    // 检查DD_GT_WL是否属于同一个DD
    const tmpDD_GT_WLDDIds = tmpDD_GT_WLs.map(item => item.DDId);
    const tmpUniqueDD_GT_WLDDIds = [...new Set(tmpDD_GT_WLDDIds)];

    if (tmpUniqueDD_GT_WLDDIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个订单!');
    }
    // end 检查DD_GT_WL是否属于同一个DD

    const tmpDDId = tmpUniqueDD_GT_WLDDIds[0];

    // 检查DD_GT_WL是否属于同一个生产GYS
    const tmpDD_GT_WLGYSIds = tmpDD_GT_WLs.map(item => item.WL.GYSId);
    const tmpUniqueDD_GT_WLGYSIds = [...new Set(tmpDD_GT_WLGYSIds)];

    if (tmpUniqueDD_GT_WLGYSIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个生产供应商!');
    }
    // end 检查DD_GT_WL是否属于同一个生产GYS

    const tmpGYSId = tmpUniqueDD_GT_WLGYSIds[0];

    // 检查生产GYS是当前用户所属GYS
    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查生产GYS是当前用户所属GYS

    // 检查DD_GT_WL状态是'初始'
    const notCSDD_GT_WLs = tmpDD_GT_WLs.filter(item => item.status !== DBTables.DD_GT_WLStatus.CS);
    if (notCSDD_GT_WLs.length > 0) {
      throw new Error(`${notCSDD_GT_WLs}不在${DBTables.DD_GT_WLStatus.CS}状态, 不可指定发货供应商!`);
    }
    // end 检查DD_GT_WL状态是'初始'

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
