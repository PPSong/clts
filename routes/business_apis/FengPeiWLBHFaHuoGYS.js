import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class FengPeiWLBHFaHuoGYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, GYSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查ids存在
    // end 检查ids存在

    // 生产供应商都属于当前操作用户的GYS
    // end 生产供应商都属于当前操作用户的GYS

    // 状态应该是'通过'状态
    // end 状态应该是'通过'状态

    // 检查指定GYS是中转GYS或自己
    // end 检查指定GYS是中转GYS或自己

    // 如果是ZZGYS库存要够
    // end 如果是ZZGYS库存要够

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.WLBH.update(
      {
        GYSId,
        status: DBTables.WLBHStatus.YFPFHGYS,
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
