import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangZhuangXiangDDWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      DDId, GTId, WLEWMs, KDXEWM,
    } = req.body;

    // 检查KDXEWM是否是KDX
    if (KDXEWM.type !== DBTables.EWMType.KDX) {
      throw new Error('快递箱二维码不正确!');
    }
    // end 检查KDXEWM是否是KDX

    // 检查WLEWMs是否都是WL
    const notWLEWMs = WLEWMs.filter(item => item.type !== DBTables.EWMType.WL);
    if (notWLEWMs.length > 0) {
      throw new Error(`${notWLEWMs}不属于物料, 不能装箱!`);
    }
    // end 检查HWEWMs是否都是WL
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      DDId, GTId, WLEWMs, KDXEWM,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查KDXEWM
    let tmpKDX = await DBTables.KDX.findOne({
      where: {
        EWM: JSON.stringify(KDXEWM),
      },
      transaction,
    });

    if (tmpKDX) {
      // 如果存在则DDId, GTId, HWType, status要符合条件
      if (tmpKDX.DDId !== DDId) {
        throw new Error(`${tmpKDX}不属于订单id:${DDId}!`);
      }
      if (tmpKDX.GTId !== GTId) {
        throw new Error(`${tmpKDX}不属于柜台id:${GTId}!`);
      }
      if (tmpKDX.HWType !== DBTables.HWType.WL) {
        throw new Error(`${tmpKDX}不属于装物料!`);
      }
      if (tmpKDX.status !== DBTables.KDXStatus.ZX) {
        throw new Error(`${tmpKDX}不在装箱状态!`);
      }
      // end 如果存在则DDId, GTId, HWType, status要符合条件
    } else {
      tmpKDX = await ppUtils.createDDKDXAndZhuangXiang({
        EWM: KDXEWM,
        GTId,
        HWType: DBTables.HWType.WL,
        user,
        transaction,
        DDId,
      });
    }
    // end 检查KDXEWM

    const tmpGYSId = await user.getGYSId(transaction);

    // 检查WLEWMs
    // 如果不存在, 先在当前GYS处入库
    for (const item of WLEWMs) {
      const tmpWYWL = await DBTables.WYWL.findOne({
        where: {
          EWM: JSON.stringify(item),
        },
        transaction,
      });

      if (!tmpWYWL) {
        await ppUtils.createWYWLAndRuKu(item, user, tmpGYSId, transaction);
      }
    }
    // end 如果不存在, 先在当前GYS处入库

    const tmpWYWLs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYWL',
      WLEWMs,
      transaction,
    );
    for (const item of tmpWYWLs) {
      // 只有状态在'装箱'前, 且不是'消库'状态可装箱
      if (
        !(
          DBTables.WYWLStatusMap.get(item.status) <
            DBTables.WYWLStatusMap.get(DBTables.WYWLStatus.ZX) &&
          item.status !== DBTables.WYWLStatus.XK
        )
      ) {
        throw new Error(`${item}的状态不能装箱!`);
      }
      // end 只有状态在'装箱'前, 且不是'消库'状态可装箱
    }

    // 检查WLEWMs是否都是当前用户所属GYS作为发货GYS发往DDId_GTId的
    const tmpTargetWLs = await checkWLEWMsFromUserGYSForSameDDGTAndGetTasks(
      DDId,
      GTId,
      tmpGYSId,
      WLEWMs,
      transaction,
    );
    // end 检查WLEWMs是否都是当前用户所属GYS作为发货GYS发往DDId_GTId的

    // end 检查WLEWMs

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 装箱

    // 统计每种WL的数量
    const tmpWLNumProvided = WLEWMs.reduce((result, item) => {
      if (result[item.typeId] !== undefined) {
        result[item.typeId]++; // eslint-disable-line no-param-reassign
        return result;
      }
      result[item.typeId] = 1; // eslint-disable-line no-param-reassign
      return result;
    }, {});
    // end 统计每种WL的数量

    // 遍历处理每种物料
    for (const key in tmpWLNumProvided) {
      // 装箱数量
      const num = tmpWLNumProvided[key];
      // end 装箱数量

      // 匹配DD_GT_WL
      const tmpDD_GT_WL = tmpTargetWLs.find(item =>
        item.DDId === +DDId && item.GTId === +GTId && item.WLId === +key);
      // end 匹配DD_GT_WL

      // 尝试装箱
      await tmpDD_GT_WL.update(
        {
          ZXNumber: DBTables.literal(`ZXNumber + ${num}`),
        },
        {
          transaction,
        },
      );
      // end 尝试装箱

      // 获取尝试装箱后任务ZXNumber
      await tmpDD_GT_WL.reload({ transaction });
      // end 获取尝试装箱后任务ZXNumber

      // 判断是否任务超限
      if (tmpDD_GT_WL.ZXNumber > tmpDD_GT_WL.number) {
        throw new Error(`${tmpDD_GT_WL}任务超限!`);
      }
      // end 判断是否任务超限

      // 判断是否任务'装箱完成'
      if (tmpDD_GT_WL.ZXNumber === tmpDD_GT_WL.number) {
        await tmpDD_GT_WL.update(
          { status: `${DBTables.DD_GT_WLStatus.ZXWC}` },
          {
            transaction,
          },
        );
      }
      // end 判断是否任务'装箱完成'

      // 为每个WYWL绑定DD_GT_WL, 并改变状态为'装箱'
      const ids = tmpWYWLs
        .filter(item => item.WLId === +key)
        .map(item => item.id);
      await ppUtils.changeWYWLsStatus({
        ids,
        status: DBTables.WYWLStatus.ZX,
        user,
        transaction,
        GYSId: tmpGYSId,
        DDGTWLId: tmpDD_GT_WL.id,
        KDXId: tmpKDX.id,
      });
      // end 为每个WYWL绑定DD_GT_WL, 并改变状态为'装箱'
    }
    // end 遍历处理每种物料

    // end 装箱
  }
}

async function checkWLEWMsFromUserGYSForSameDDGTAndGetTasks(
  DDId,
  GTId,
  GYSId,
  EWMs,
  transaction,
) {
  const tmpWLIds = EWMs.map(item => item.typeId);
  console.log('ppt', DDId, GTId, GYSId);
  const tmpTargetWLs = await DBTables.DD_GT_WL.findAll({
    where: {
      DDId,
      GTId,
      GYSId,
      status: DBTables.DD_GT_WLStatus.YFPFHGYS,
    },
    transaction,
  });

  const tmpTargetWLIds = tmpTargetWLs.map(item => item.WLId);
  const diffWLIds = _.difference(tmpWLIds, tmpTargetWLIds);
  if (diffWLIds.length > 0) {
    throw new Error(`${diffWLIds}不属于从你所属供应商发往目标订单_柜台任务或任务已超限额!`);
  }

  return tmpTargetWLs;
}
