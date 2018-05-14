import _ from 'lodash';
import moment from 'moment';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class SetWLBHs0YJZXTime extends BusinessApiBase {
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
    const { ids, YJZXTime } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids存在
    const tmpWLBHs = await DBTables.WLBH.findAll({
      include: [
        {
          model: DBTables.WL,
          as: 'WL',
        },
      ],
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });
    const tmpIds = tmpWLBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpIds);
    if (diffIds.length > 0) {
      throw new Error(`${diffIds}不存在!`);
    }
    // end 检查ids存在

    // 检查生产供应商同一, 都是当前用户所属GYS
    const tmpGYSIds = tmpWLBHs.map(item => item.WL.GYSId);
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
    const notOkRecords = tmpWLBHs.filter((item) => {
      const indexTG = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.TG);
      const indexZXWC = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.ZXWC);
      const indexStatus = DBTables.WLBHStatusMap.get(item.status);

      return indexStatus < indexTG || indexStatus >= indexZXWC;
    });

    if (notOkRecords.length > 0) {
      throw new Error(`${notOkRecords}状态不正确, 不能指定预计装箱时间!`);
    }
    // end 检查状态在'通过' <= x < '装箱完成'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 设置YJZXTime

    await DBTables.WLBH.update(
      {
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
