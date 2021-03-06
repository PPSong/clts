import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangZhuangXiangBuHuoWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      YJZXTime, GTId, WLEWMs, KDXEWM,
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
      YJZXTime: time, GTId, WLEWMs, KDXEWM,
    } = req.body;

    // 转换字符串为当地时间(东8区)
    const YJZXTime = new Date(time);

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpGYSId = await user.getGYSId(transaction);

    // 检查KDXEWM
    let tmpKDX = await DBTables.KDX.findOne({
      where: {
        EWM: JSON.stringify(KDXEWM),
      },
      transaction,
    });

    if (tmpKDX) {
      // 如果存在则YJZXTime, GTId, HWType, status要符合条件
      if (tmpKDX.YJZXTime.getTime() !== new Date(YJZXTime).getTime()) {
        throw new Error(`${tmpKDX}不属于批次:${YJZXTime}!`);
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
      // end 如果存在则YJZXTime, GTId, HWType, status要符合条件
    } else {
      tmpKDX = await ppUtils.createDDKDXAndZhuangXiang({
        EWM: KDXEWM,
        GTId,
        HWType: DBTables.HWType.WL,
        user,
        GYSId: tmpGYSId,
        transaction,
        YJZXTime,
      });
    }
    // end 检查KDXEWM

    // 检查WLEWMs
    // 如果不存在, 先在当前GYS处入库
    for (const item of WLEWMs) {
      const tmpWYWL = await DBTables.WYWL.findOne({
        where: {
          uuid: item.uuid,
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

    // 检查WLEWMs是否都是当前用户所属GYS作为发货GYS发往YJZXTime_GTId的
    const tmpTargetWLBHs = await checkWLEWMsFromUserGYSForSameDDGTAndGetTasks(
      YJZXTime,
      GTId,
      tmpGYSId,
      WLEWMs,
      transaction,
    );
    // end 检查WLEWMs是否都是当前用户所属GYS作为发货GYS发往YJZXTime_GTId的

    // end 检查WLEWMs

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 装箱
    // 遍历处理每个物料
    for (const tmpWYWL of tmpWYWLs) {
      // 匹配WLBH
      const tmpWLBH = tmpTargetWLBHs.find(item =>
        item.YJZXTime.getTime() === YJZXTime.getTime() &&
          item.GTId === GTId &&
          item.WLId === tmpWYWL.WLId &&
          item.ZXNumber === 0);
      // end 匹配WLBH

      // 尝试装箱
      await tmpWLBH.update(
        { ZXNumber: DBTables.literal('ZXNumber + 1') },
        {
          transaction,
        },
      );
      // end 尝试装箱

      // 获取尝试装箱后任务ZXNumber
      await tmpWLBH.reload({ transaction });
      // end 获取尝试装箱后任务ZXNumber

      // 判断是否任务超限
      if (tmpWLBH.ZXNumber > 1) {
        throw new Error(`${tmpWLBH}任务超限!`);
      }
      // end 判断是否任务超限

      // 判断是否任务'装箱完成'
      if (tmpWLBH.ZXNumber === 1) {
        await tmpWLBH.update(
          { status: `${DBTables.WLBHStatus.ZXWC}` },
          {
            transaction,
          },
        );
      }
      // end 判断是否任务'装箱完成'

      // 为每个WYWL绑定WLBH, 并改变状态为'装箱'
      const ids = [tmpWYWL.id];
      await ppUtils.changeWYWLsStatus({
        ids,
        status: DBTables.WYWLStatus.ZX,
        user,
        transaction,
        GYSId: tmpGYSId,
        WLBHId: tmpWLBH.id,
        KDXId: tmpKDX.id,
      });
      // end 为每个WYWL绑定WLBH, 并改变状态为'装箱'
    }
    // end 遍历处理每个物料

    // end 装箱
  }
}

async function checkWLEWMsFromUserGYSForSameDDGTAndGetTasks(
  YJZXTime,
  GTId,
  GYSId,
  EWMs,
  transaction,
) {
  const tmpWLIds = EWMs.map(item => item.typeId);

  const tmpTargetWLBHs = await DBTables.WLBH.findAll({
    where: {
      YJZXTime,
      GTId,
      GYSId,
      status: DBTables.WLBHStatus.YFPFHGYS,
    },
    transaction,
  });

  const tmpTargetWLBHIds = tmpTargetWLBHs.map(item => item.WLId);

  const diffWLIds = _.difference(tmpWLIds, tmpTargetWLBHIds);
  if (diffWLIds.length > 0) {
    throw new Error(`${diffWLIds}不属于从你所属供应商发往目标订单_柜台任务!`);
  }

  return tmpTargetWLBHs;
}
