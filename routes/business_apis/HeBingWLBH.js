import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class HeBingWLBH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBH的ids存在
    const tmpWLBHs = await DBTables.WLBH.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpWLBHIds = tmpWLBHs.map(item => item.id);
    if (_.difference(ids, tmpWLBHIds).length > 0) {
      throw new Error(`物料补货记录id:${ids}不存在!`);
    }
    // end 检查WLBH的ids存在

    for (let i = 0; i < tmpWLBHs.length; i++) {
      // 检查操作者是生产GYS
      await user.checkWLId(tmpWLBHs[i].WLId, transaction);
      // end 检查操作者是生产GYS
    }

    // 检查是否已分配了发货GYS
    const tmpHasGYSs = tmpWLBHs.filter(item => item.GYSId === null);
    if (tmpHasGYSs.length > 0) {
      throw new Error(`${tmpHasGYSs}还没分配过发货供应商!`);
    }
    // end 检查是否已分配了发货GYS

    // 检查发货GYS是否是同一个
    const tmpGYSIds = tmpWLBHs.map(item => item.GYSId);
    const tmpUniqueGYSIds = [...new Set(tmpGYSIds)];
    if (tmpUniqueGYSIds.length !== 1) {
      throw new Error('必须属于同一发货供应商!');
    }
    // end 检查发货GYS是否是同一个

    // 检查是否已合并
    const tmpHasHBs = tmpWLBHs.filter(item => item.HBUUID !== null);
    if (tmpHasHBs.length > 0) {
      throw new Error(`${tmpHasHBs}已被合并!`);
    }
    // end 检查是否已合并

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.WLBH.update(
      {
        HBUUID: uuidv4(),
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
