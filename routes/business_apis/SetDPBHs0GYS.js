import _ from 'lodash';
import moment from 'moment';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class SetDPBHs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static validateParamsFormat(req, res, next) {
    const { ids, YJZXTime } = req.body;

    // 检查时间格式
    if (!moment(YJZXTime, 'YYYY-MM-DD').isValid()) {
      throw new Error(`${YJZXTime}时间格式不正确!`);
    }
    // end 检查时间格式
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, GYSId, YJZXTime } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查目标GYSId是用户所属GYS或中转GYS
    await DBTables.GYS.checkIsZZGYSOrMe(GYSId, user, transaction);
    // end 检查目标GYSId是用户所属GYS或中转GYS

    // 检查ids存在
    const tmpDPBHs = await DBTables.DPBH.findAll({
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
    const tmpIds = tmpDPBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpIds);
    if (diffIds.length > 0) {
      throw new Error(`${diffIds}不存在!`);
    }
    // end 检查ids存在

    // 检查生产供应商同一, 都是当前用户所属GYS
    const tmpGYSIds = tmpDPBHs.map(item => item.DP.GYSId);
    const tmpUniqueGYSId = [...new Set(tmpGYSIds)];
    if (tmpUniqueGYSId > 1) {
      throw new Error('记录必须属于同一生产供应商!');
    }
    const tmpGYSId = tmpUniqueGYSId[0];
    // end 检查生产供应商同一, 都是当前用户所属GYS

    // 检查是否是用户所属GYS
    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查是否是用户所属GYS

    // 检查状态在'通过' <= x < '装箱完成'
    const notOkRecords = tmpDPBHs.filter((item) => {
      const indexTG = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.TG);
      const indexZXWC = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.ZXWC);
      const indexStatus = DBTables.WLBHStatusMap.get(item.status);

      return indexStatus < indexTG || indexStatus >= indexZXWC;
    });

    if (notOkRecords.length > 0) {
      throw new Error(`补货灯片[${notOkRecords[0].id}]状态不正确, 不能指定预计装箱时间!`);
    }
    // end 检查状态在'通过' <= x < '装箱完成'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 设置YJZXTime
    await DBTables.DPBH.update(
      {
        GYSId,
        status: DBTables.DPBHStatus.YFPFHGYS,
        YJZXTime,
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
    // end 设置YJZXTime
  }
}
