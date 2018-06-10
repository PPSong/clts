import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDDWDPs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      ids, GYSId, YJRKDate, YJZXDate,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查目标GYSId是用户所属GYS或中转GYS
    await DBTables.GYS.checkIsZZGYSOrMe(GYSId, user, transaction);
    // end 检查目标GYSId是用户所属GYS或中转GYS

    // 检查DD_DW_DPIds存在
    const tmpDD_DW_DPs = await DBTables.DD_DW_DP.findAll({
      include: [
        {
          model: DBTables.DP,
          as: 'DP',
        },
      ],
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpDD_DW_DPIds = tmpDD_DW_DPs.map(item => item.id);
    const diffIds = _.difference(ids, tmpDD_DW_DPIds);
    if (diffIds.length > 0) {
      throw new Error(`订单_灯位_灯片记录id:${diffIds}不存在!`);
    }
    // end 检查DD_DW_DPIds存在

    // 检查DD_DW_DP是否属于同一个DD
    const tmpDD_DW_DPDDIds = tmpDD_DW_DPs.map(item => item.DDId);
    const tmpUniqueDD_DW_DPDDIds = [...new Set(tmpDD_DW_DPDDIds)];

    if (tmpUniqueDD_DW_DPDDIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个订单!');
    }
    // end 检查DD_DW_DP是否属于同一个DD

    const tmpDDId = tmpUniqueDD_DW_DPDDIds[0];

    // 检查DD_DW_DP是否属于同一个生产GYS
    const tmpDD_DW_DPGYSIds = tmpDD_DW_DPs.map(item => item.DP.GYSId);
    const tmpUniqueDD_DW_DPGYSIds = [...new Set(tmpDD_DW_DPGYSIds)];

    if (tmpUniqueDD_DW_DPGYSIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个生产供应商!');
    }
    // end 检查DD_DW_DP是否属于同一个生产GYS

    const tmpGYSId = tmpUniqueDD_DW_DPGYSIds[0];

    // 检查生产GYS是当前用户所属GYS
    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查生产GYS是当前用户所属GYS

    // 检查DD_DW_DP状态是'初始'
    const notCSDD_DW_DPs = tmpDD_DW_DPs.filter(item => item.status !== DBTables.DD_DW_DPStatus.CS);
    if (notCSDD_DW_DPs.length > 0) {
      throw new Error(`${notCSDD_DW_DPs}不在${
        DBTables.DD_DW_DPStatus.CS
      }状态, 不可指定发货供应商!`);
    }
    // end 检查DD_DW_DP状态是'初始'

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
        status: DBTables.DD_DW_DPStatus.YFPFHGYS,
        YJRKDate,
        YJZXDate,
      },
      {
        where: {
          id: {
            $in: ids,
          },
        },
        transaction,
      },
    );
  }
}
