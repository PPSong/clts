import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDGTWLs0AZGS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DD_GT_WLIds存在
    const tmpDD_GT_WLs = await DBTables.DD_GT_WL.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpDD_GT_WLIds = tmpDD_GT_WLs.map(item => item.id);
    const diffIds = _.difference(ids, tmpDD_GT_WLIds);
    if (diffIds.length > 0) {
      throw new Error(`订单_柜台_物料记录id:${diffIds}不存在!`);
    }
    // end 检查DD_GT_WLIds存在

    // 检查DD_GT_WL属于同一个DD
    const tmpDDIds = tmpDD_GT_WLs.map(item => item.DDId);
    const tmpUniqueDDIds = [...new Set(tmpDDIds)];

    if (tmpUniqueDDIds.length !== 1) {
      throw new Error('订单_柜台_物料要属于同一个订单!');
    }
    // end 检查DD_GT_WL属于同一个DD

    const tmpDDId = tmpUniqueDDIds[0];

    // 检查订单所属品牌是否在权限范围
    const tmpDD = await user.checkDDId(tmpDDId, transaction);
    // end 检查订单所属品牌是否在权限范围

    // 检查订单状态是否是'初始'
    if (tmpDD.status !== DBTables.DDStatus.CS) {
      throw new Error(`${tmpDD}状态为${tmpDD.status}, 不能指定安装公司!`);
    }
    // end 检查订单状态是否是'初始'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.DD_GT_WL.update(
      {
        AZGSId: AZGSId < 1 ? null : AZGSId,
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
