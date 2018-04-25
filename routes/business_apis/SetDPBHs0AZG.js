import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDPBHs0AZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DPBHIds, AZGUserId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DPBHIds存在
    const tmpDPBHs = await DBTables.DPBH.findAll({
      where: {
        id: {
          $in: DPBHIds,
        },
      },
      transaction,
    });

    const tmpDPBHIds = tmpDPBHs.map(item => item.id);
    const diffIds = _.difference(DPBHIds, tmpDPBHIds);
    if (diffIds.length > 0) {
      throw new Error(`灯片补货记录id:${diffIds}不存在!`);
    }
    // end 检查DPBHIds存在

    // 检查DPBH是否属于同一个YJZXTime
    const tmpDPBHYJZXTimes = tmpDPBHs.map(item => item.YJZXTime);
    const tmpUniqueDPBHYJZXTimes = [...new Set(tmpDPBHYJZXTimes)];

    if (tmpUniqueDPBHYJZXTimes.length !== 1) {
      throw new Error('灯片补货应该要存在并属于同一个预计装箱时间!');
    }
    // end 检查DPBH是否属于同一个YJZXTime

    const tmpYJZXTime = tmpUniqueDPBHYJZXTimes[0];

    // 检查DPBH是否属于同一个AZGS
    const tmpDPBHAZGSIds = tmpDPBHs.map(item => item.AZGSId);
    const tmpUniqueDPBHAZGSIds = [...new Set(tmpDPBHAZGSIds)];

    if (tmpUniqueDPBHAZGSIds.length !== 1) {
      throw new Error('灯片补货应该要存在并属于同一个安装公司!');
    }
    // end 检查DPBH是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueDPBHAZGSIds[0];

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // 检查DPBH状态是'通过' >= x < '收货'之前
    const notCSDPBHs = tmpDPBHs.filter(item =>
      !(
        DBTables.DPBHStatusMap.get(item.status) <
            DBTables.DPBHStatusMap.get(DBTables.DPBHStatus.SH) &&
          DBTables.DPBHStatusMap.get(item.status) >=
            DBTables.DPBHStatusMap.get(DBTables.DPBHStatus.TG)
      ));

    if (notCSDPBHs.length > 0) {
      throw new Error(`${notCSDPBHs}不在${DBTables.DPBHStatus.TG}状态之后并且${DBTables.DPBHStatus.SH}状态之前, 不可指定安装工!`);
    }
    // end 检查DPBH状态是'通过' >= x < '收货'之前

    // 检查AZGUserId是否属于tmpAZGS
    const AZGUser = await tmpAZGS.checkAZGUserId(AZGUserId, transaction);
    // end 检查AZGUserId是否属于tmpAZGS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // end 检查DPBH是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.DPBH.update(
      {
        AZGUserId,
      },
      {
        where: {
          id: {
            $in: DPBHIds,
          },
        },
        transaction,
      },
    );
  }
}
