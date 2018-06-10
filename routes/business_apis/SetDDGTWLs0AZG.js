import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDDGTWLs0AZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGUserId } = req.body;

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

    // 检查DD_GT_WL是否属于同一个DD
    const tmpDD_GT_WLDDIds = tmpDD_GT_WLs.map(item => item.DDId);
    const tmpUniqueDD_GT_WLDDIds = [...new Set(tmpDD_GT_WLDDIds)];

    if (tmpUniqueDD_GT_WLDDIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个订单!');
    }
    // end 检查DD_GT_WL是否属于同一个DD

    const tmpDDId = tmpUniqueDD_GT_WLDDIds[0];

    // 检查DD_GT_WL是否属于同一个AZGS
    const tmpDD_GT_WLAZGSIds = tmpDD_GT_WLs.map(item => item.AZGSId);
    const tmpUniqueDD_GT_WLAZGSIds = [...new Set(tmpDD_GT_WLAZGSIds)];

    if (tmpUniqueDD_GT_WLAZGSIds.length !== 1) {
      throw new Error('订单_柜台_物料应该要存在并属于同一个安装公司!');
    }
    // end 检查DD_GT_WL是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueDD_GT_WLAZGSIds[0];

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // 检查DD_GT_WL状态是'收货'之前
    const notCSDD_GT_WLs = tmpDD_GT_WLs.filter(item =>
      DBTables.DD_GT_WLStatusMap.get(item.status) >=
        DBTables.DD_GT_WLStatusMap.get(DBTables.DD_GT_WLStatus.SH));

    if (notCSDD_GT_WLs.length > 0) {
      throw new Error(`${notCSDD_GT_WLs}不在${
        DBTables.DD_GT_WLStatus.SH
      }状态之前, 不可指定安装工!`);
    }
    // end 检查DD_GT_WL状态是'收货'之前

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

    // end 检查DD_GT_WL是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.DD_GT_WL.update(
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
