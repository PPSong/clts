import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDGTWLs0AZGS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DD_GT_WLIds, AZGSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    
    // 检查DD_GT_WL是否属于同一个DD
    const tmpDD_GT_WLs = await DBTables.DD_GT_WL.findAll({
      where: {
        id: {
          $in: DD_GT_WLIds,
        },
      },
      transaction,
    });

    const tmpDD_GT_WLIds = tmpDD_GT_WLs.map(item => item.DDId);
    const tmpUniqueDD_GT_WLIds = [...new Set(tmpDD_GT_WLIds)];

    if (tmpUniqueDD_GT_WLIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个订单!');
    }

    const tmpDDId = tmpUniqueDD_GT_WLIds[0];
    // end 检查DD_GT_WL是否属于同一个DD

    // 检查订单所属品牌是否在权限范围
    const tmpDD = await user.checkDDId(tmpDDId, transaction);
    // end 检查订单所属品牌是否在权限范围

    // 检查订单状态是否是'待审批'
    if (tmpDD.status !== DBTables.DDStatus.DSP) {
      throw new Error(`${tmpDD}状态为${tmpDD.status}, 不能指定安装公司!`);
    }
    // end 检查订单状态是否是'待审批'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.DD_GT_WL.update(
      {
        AZGSId,
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
