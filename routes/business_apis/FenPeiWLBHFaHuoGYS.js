import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class FenPeiWLBHFaHuoGYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, GYSId } = req.body;

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

    // 生产供应商都属于当前操作用户的GYS
    const tmpGYSIds = tmpWLBHs.map(item => item.WL.GYSId);
    const tmpUniqueGYSId = [...new Set(tmpGYSIds)];
    if (tmpUniqueGYSId.length > 1) {
      throw new Error(`${tmpGYSIds}不属于同一生产供应商!`);
    }

    const tmpGYSId = tmpUniqueGYSId[0];

    await user.checkGYSId(tmpGYSId, transaction);
    // end 生产供应商都属于当前操作用户的GYS

    // 状态应该是'通过'状态
    const notTGRecords = tmpWLBHs.filter(item => item.status !== DBTables.WLBHStatus.TG);
    if (notTGRecords.length > 0) {
      throw new Error(`${notTGRecords}状态不属于${
        DBTables.WLBHStatus.TG
      }, 不能分配发货供应商!`);
    }
    // end 状态应该是'通过'状态

    // 检查指定GYS是中转GYS或自己
    const tmpGYS = await DBTables.GYS.findOne({
      where: {
        id: GYSId,
      },
      transaction,
    });

    if (!tmpGYS) {
      throw new Error(`供应商id:${GYSId}不存在!`);
    }

    if (tmpGYS.disabledAt !== null) {
      throw new Error(`供应商${tmpGYS}在屏蔽状态!`);
    }

    if (tmpGYS.type !== DBTables.GYSType.ZZ) {
      await user.checkGYSId(GYSId, transaction);
    }
    // end 检查指定GYS是中转GYS或自己

    // 如果是ZZGYS库存要够
    if (tmpGYS.type === DBTables.GYSType.ZZ) {
      const tmpWLNum = tmpWLBHs.reduce((result, item) => {
        if (result[item.WLId] !== undefined) {
          result[item.WLId]++; // eslint-disable-line no-param-reassign
        } else {
          result[item.WLId] = 1; // eslint-disable-line no-param-reassign
        }

        return result;
      });

      for (const key in tmpWLNum) {
        const WLId = key;
        const num = tmpWLNum[key];
        const kcNum = await DBTables.WYWL.count({
          where: {
            WLId,
            GYSId: tmpGYSId,
            status: DBTables.WYWLStatus.RK,
          },
          transaction,
        });
        if (num > kcNum) {
          throw new Error(`物料类型id:${key}库存数量不够!`);
        }
      }
    }
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
