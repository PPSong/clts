import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDDWDPs0AZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGUserId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DD_DW_DPIds存在
    const tmpDD_DW_DPs = await DBTables.DD_DW_DP.findAll({
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

    // 检查DD_DW_DP是否属于同一个AZGS
    const tmpDD_DW_DPAZGSIds = tmpDD_DW_DPs.map(item => item.AZGSId);
    const tmpUniqueDD_DW_DPAZGSIds = [...new Set(tmpDD_DW_DPAZGSIds)];

    if (tmpUniqueDD_DW_DPAZGSIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个安装公司!');
    }
    // end 检查DD_DW_DP是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueDD_DW_DPAZGSIds[0];

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // 检查DD_DW_DP状态是'收货'之前
    const notCSDD_DW_DPs = tmpDD_DW_DPs.filter(item =>
      DBTables.DD_DW_DPStatusMap.get(item.status) >=
        DBTables.DD_DW_DPStatusMap.get(DBTables.DD_DW_DPStatus.SH));

    if (notCSDD_DW_DPs.length > 0) {
      throw new Error(`${notCSDD_DW_DPs}不在${
        DBTables.DD_DW_DPStatus.SH
      }状态之前, 不可指定安装工!`);
    }
    // end 检查DD_DW_DP状态是'收货'之前

    // 检查AZGUserId是否属于tmpAZGS
    const AZGUser = await tmpAZGS.checkAZGUserId(AZGUserId, transaction);
    // end 检查AZGUserId是否属于tmpAZGS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查订单状态是否是'已审批'
    const tmpDD = await DBTables.DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DBTables.DDStatus.YSP) {
      throw new Error(`${tmpDD}状态为:${tmpDD.status}, 不能指定安装工!`);
    }
    // end 检查订单状态是否是'已审批'

    // end 检查DD_DW_DP是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.DD_DW_DP.update(
      {
        AZGUserId,
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
