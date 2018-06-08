import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetWLBHs0AZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGUserId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBHIds存在
    const tmpWLBHs = await DBTables.WLBH.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpWLBHIds = tmpWLBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpWLBHIds);
    if (diffIds.length > 0) {
      throw new Error(`物料补货记录id:${diffIds}不存在!`);
    }
    // end 检查WLBHIds存在

    // 检查WLBH是否属于同一个YJZXTime
    const tmpWLBHYJZXTimes = tmpWLBHs.map(item => item.YJZXTime.toISOString());
    const tmpUniqueWLBHYJZXTimes = [...new Set(tmpWLBHYJZXTimes)];

    if (tmpUniqueWLBHYJZXTimes.length !== 1) {
      throw new Error('物料补货应该要存在并属于同一个预计装箱时间!');
    }
    // end 检查WLBH是否属于同一个YJZXTime

    const tmpYJZXTime = tmpUniqueWLBHYJZXTimes[0];

    // 检查WLBH是否属于同一个AZGS
    const tmpWLBHAZGSIds = tmpWLBHs.map(item => item.AZGSId);
    const tmpUniqueWLBHAZGSIds = [...new Set(tmpWLBHAZGSIds)];

    if (tmpUniqueWLBHAZGSIds.length !== 1) {
      throw new Error('物料补货应该要存在并属于同一个安装公司!');
    }
    // end 检查WLBH是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueWLBHAZGSIds[0];

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // 检查WLBH状态是'通过' >= x < '收货'之前
    const notCSWLBHs = tmpWLBHs.filter(item =>
      !(
        DBTables.WLBHStatusMap.get(item.status) <
            DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.SH) &&
          DBTables.WLBHStatusMap.get(item.status) >=
            DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.TG)
      ));

    if (notCSWLBHs.length > 0) {
      throw new Error(`${notCSWLBHs}不在${DBTables.WLBHStatus.TG}状态之后并且${DBTables.WLBHStatus.SH}状态之前, 不可指定安装工!`);
    }
    // end 检查WLBH状态是'通过' >= x < '收货'之前

    // 检查AZGUserId是否属于tmpAZGS
    const AZGUser = await tmpAZGS.checkAZGUserId(AZGUserId, transaction);
    // end 检查AZGUserId是否属于tmpAZGS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // end 检查WLBH是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.WLBH.update(
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
