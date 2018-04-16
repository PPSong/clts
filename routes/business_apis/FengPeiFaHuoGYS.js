import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class FengPeiFaHuoGYS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GYSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, GYSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

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

    // 检查中转GYS的库存是否足够
    if (tmpGYS.type === DBTables.GYSType.ZZ) {
      // 统计各个WL的个数
      const WLNumber = tmpWLBHs.reduce((WLs, WLId) => {
        if (WLId in WLs) {
          WLs[WLId]++; // eslint-disable-line no-param-reassign
        } else {
          WLs[WLId] = 1; // eslint-disable-line no-param-reassign
        }
        return WLs;
      }, {});
      // end 统计各个WL的个数

      const keys = Object.keys(WLNumber);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const number = WLNumber[key];
        // 取得库存
        const tmpKCNumber = await DBTables.WYWL.count({
          where: {
            WLId: key,
            GYSId,
            status: DBTables.WYWLStatus.RK,
          },
          transaction,
        });
        // end 取得库存

        // 取得被DD_GT_WL占用数量
        const tmpWYWLSql = `
        SELECT
          SUM(a.number - IFNULL(a.ZXNumber, 0)) number
        FROM
          DD_GT_WL a
        WHERE
          a.WLId = :WLId
        AND
          a.GYSId = :GYSId;
       `;

        const tmpWYWLCZSqlR = await DBTables.sequelize.query(tmpWYWLSql, {
          transaction,
          replacements: {
            WLId: key,
            GYSId,
          },
        });
        const DDGTWLNumber = tmpWYWLCZSqlR[0].number;
        // end 取得被DD_GT_WL占用数量

        // 取得被WLBH占用数量
        const WLBHNumber = await DBTables.WLBH.count({
          where: {
            WLId: key,
            GYSId,
            status: DBTables.WYWLStatus.RK,
            $or: [
              {
                ZXNumber: null,
              },
              {
                ZXNumber: 0,
              },
            ],
          },
          transaction,
        });
        // end 取得被WLBH占用数量

        // 计算剩余库存
        const leftNumber = tmpKCNumber - DDGTWLNumber - WLBHNumber;
        // end 计算剩余库存

        if (number > leftNumber) {
          throw new Error(`物料类型id${key}库存数量不够!`);
        }
      }
    }
    // end 检查中转GYS的库存是否足够

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.WLBH.update(
      {
        GYSId,
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
