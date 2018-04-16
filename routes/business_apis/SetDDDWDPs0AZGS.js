import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDDWDPs0AZGS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DD_DW_DPIds, AZGSId } = req.body;
    
    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DD_DW_DP是否属于同一个DD
    const tmpDD_DW_DPs = await DBTables.DD_DW_DP.findAll({
      where: {
        id: {
          $in: DD_DW_DPIds,
        },
      },
      transaction,
    });

    const tmpDD_DW_DPIds = tmpDD_DW_DPs.map(item => item.DDId);
    const tmpUniqueDD_DW_DPIds = [...new Set(tmpDD_DW_DPIds)];

    if (tmpUniqueDD_DW_DPIds.length !== 1) {
      throw new Error('订单_灯位_灯片应该要存在并属于同一个订单!');
    }

    const tmpDDId = tmpUniqueDD_DW_DPIds[0];
    // end 检查DD_DW_DP是否属于同一个DD

    // 检查订单所属品牌是否在权限范围
    const tmpDD = await user.checkDDId(tmpDDId, transaction);
    // end 检查订单所属品牌是否在权限范围

    // 检查订单状态是否是'待审批'
    if (tmpDD.status !== DBTables.DDStatus.DSP) {
      throw new Error(`${tmpDD}状态为${tmpDD.status}, 不能指定安装公司!`);
    }
    // end 检查订单状态是否是'待审批'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.DD_DW_DP.update(
      {
        AZGSId,
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
