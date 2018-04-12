import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDDWDPs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DD_DW_DPIds, GYSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await DBTables.GYS.checkZZGYS(GYSId, transaction);

    // 检查DD_DW_DP是否属于同一个DD, 并且当前GYS是操作者所属供应商
    const tmpDD_DW_DPs = await DBTables.DD_DW_DP.findAll({
      where: {
        id: {
          $in: DD_DW_DPIds,
        },
      },
      transaction,
    });

    const tmpDD_DW_DPDDIds = tmpDD_DW_DPs.map(item => item.DDId);
    const tmpUniqueDD_DW_DPDDIds = [...new Set(tmpDD_DW_DPDDIds)];

    if (tmpUniqueDD_DW_DPDDIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个订单!');
    }

    const tmpDDId = tmpUniqueDD_DW_DPDDIds[0];

    const tmpDD_DW_DPGYSIds = tmpDD_DW_DPs.map(item => item.GYSId);
    const tmpUniqueDD_DW_DPGYSIds = [...new Set(tmpDD_DW_DPGYSIds)];

    if (tmpUniqueDD_DW_DPGYSIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个发货供应商!');
    }

    const tmpGYSId = tmpUniqueDD_DW_DPGYSIds[0];

    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查DD_DW_DP是否属于同一个DD, 并且当前GYS是操作者所属供应商

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

    await DBTables.DD_DW_DP.update(
      {
        GYSId,
      },
      {
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
        transaction,
      },
    );
  }
}
