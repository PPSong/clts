import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import moment from 'moment';

export default class SetWLBHs0GYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static validateParamsFormat(req, res, next) {
    const { YJZXTime } = req.body;

    // 检查时间格式
    if (!moment(YJZXTime, 'YYYY-MM-DD').isValid()) {
      throw new Error(`${YJZXTime}时间格式不正确!`);
    }
    // end 检查时间格式
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      ids, GYSId, YJZXTime,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查目标GYSId是用户所属GYS或中转GYS
    await DBTables.GYS.checkIsZZGYSOrMe(GYSId, user, transaction);
    // end 检查目标GYSId是用户所属GYS或中转GYS

    // 检查WLBHIds存在
    let tmpWLBHs = await DBTables.WLBH.findAll({
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

    const tmpWLBHIds = tmpWLBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpWLBHIds);
    if (diffIds.length > 0) {
      throw new Error(`补货物料记录id:${diffIds}不存在!`);
    }
    // end 检查WLBHIds存在

    // 检查WLBH是否属于同一个生产GYS
    const tmpWLBHGYSIds = tmpWLBHs.map(item => item.WL.GYSId);
    const tmpUniqueWLBHGYSIds = [...new Set(tmpWLBHGYSIds)];

    if (tmpUniqueWLBHGYSIds.length !== 1) {
      throw new Error('补货物料应该要存在并属于同一个生产供应商!');
    }
    // end 检查WLBH是否属于同一个生产GYS

    const tmpGYSId = tmpUniqueWLBHGYSIds[0];

    // 检查生产GYS是当前用户所属GYS
    await user.checkGYSId(tmpGYSId, transaction);
    // end 检查生产GYS是当前用户所属GYS

    // 检查WLBH状态是'通过'
    const notTG_WLBHs = tmpWLBHs.filter(item => {
      const indexTG = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.TG);
      const indexZXWC = DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.ZXWC);
      const indexStatus = DBTables.WLBHStatusMap.get(item.status);

      return indexStatus < indexTG || indexStatus >= indexZXWC;
    });
    if (notTG_WLBHs.length > 0) {
      throw new Error(`补货物料[${notTG_WLBHs[0].id}]状态不正确, 不可指定发货供应商和预计装箱时间!`);
    }
    // end 检查WLBH状态是'通过'

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.WLBH.update(
      {
        GYSId,
        status: DBTables.WLBHStatus.YFPFHGYS,
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
  }
}
