import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangZhuangXiangDDDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      DDId, GTId, DPEWMs, KDXEWM,
    } = req.body;

    // 检查KDXEWM是否是KDX
    if (KDXEWM.type !== DBTables.EWMType.KDX) {
      throw new Error('快递箱二维码不正确!');
    }
    // end 检查KDXEWM是否是KDX

    // 检查DPEWMs是否都是DP
    const notDPEWMs = DPEWMs.filter(item => item.type !== DBTables.EWMType.DP);
    if (notDPEWMs.length > 0) {
      throw new Error(`${notDPEWMs}不属于灯片, 不能装箱!`);
    }
    // end 检查HWEWMs是否都是DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      DDId, GTId, DPEWMs, KDXEWM,
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
      if (tmpKDX.HWType !== DBTables.HWType.DP) {
        throw new Error(`${tmpKDX}不属于装灯片!`);
      }
      if (tmpKDX.status !== DBTables.KDXStatus.ZX) {
        throw new Error(`${tmpKDX}不在装箱状态!`);
      }
      // end 如果存在则DDId, GTId, HWType, status要符合条件
    } else {
      tmpKDX = await ppUtils.createDDKDXAndZhuangXiang({
        EWM: KDXEWM,
        GTId,
        HWType: DBTables.HWType.DP,
        user,
        transaction,
        DDId,
      });
    }
    // end 检查KDXEWM

    // 检查DPEWMs
    const tmpWYDPs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYDP',
      DPEWMs,
      transaction,
    );
    for (const item of tmpWYDPs) {
      // 只有状态在'装箱'前, 且不是'消库'状态可装箱
      if (
        !(
          DBTables.WYDPStatusMap.get(item.statue) <
            DBTables.WYDPStatusMap.get(DBTables.WYDPStatus.ZX) &&
          item.statue !== DBTables.WYDPStatus.XK
        )
      ) {
        throw new Error(`${item}的状态不能装箱!`);
      }
      // end 只有状态在'装箱'前, 且不是'消库'状态可装箱
    }

    // 检查DPEWMs是否都是当前用户所属GYS作为发货GYS发往DDId_GTId的
    const tmpGYSId = await user.getGYSId({ transaction });
    const tmpTargetDPs = await checkDPEWMsFromUserGYSForSameDDGTAndGetTasks(
      DDId,
      GTId,
      tmpGYSId,
      DPEWMs,
      transaction,
    );
    // end 检查DPEWMs是否都是当前用户所属GYS作为发货GYS发往DDId_GTId的

    // end 检查DPEWMs

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 装箱

    // 遍历处理每个灯片
    for (const tmpWYDP in tmpWYDPs) {
      // 匹配DD_DW_DP
      const tmpDD_DW_DP = tmpTargetDPs.find(item =>
        item.DDId === DDId &&
          item.DW.GTId === GTId &&
          item.DPId === tmpWYDP.DPId);
      // end 匹配DD_DW_DP

      // 尝试装箱
      await tmpDD_DW_DP.update(
        { ZXNumber: DBTables.literal('ZXNumber + 1') },
        {
          transaction,
        },
      );
      // end 尝试装箱

      // 获取尝试装箱后任务ZXNumber
      await tmpDD_DW_DP.reload({ transaction });
      // end 获取尝试装箱后任务ZXNumber

      // 判断是否任务超限
      if (tmpDD_DW_DP.ZXNumber > 1) {
        throw new Error(`${tmpDD_DW_DP}任务超限!`);
      }
      // end 判断是否任务超限

      // 判断是否任务'装箱完成'
      if (tmpDD_DW_DP.ZXNumber === 1) {
        await tmpDD_DW_DP.update(
          { status: `${DBTables.DD_DW_DPStatus.ZXWC}` },
          {
            transaction,
          },
        );
      }
      // end 判断是否任务'装箱完成'

      // 为每个WYDP绑定DD_DW_DP, 并改变状态为'装箱'
      const ids = [tmpWYDP.id];
      await ppUtils.changeWYDPsStatus({
        ids,
        status: DBTables.WYDPStatus.ZX,
        user,
        transaction,
        GYSId: tmpGYSId,
        DDDWDPId: tmpDD_DW_DP.id,
      });
      // end 为每个WYDP绑定DD_DW_DP, 并改变状态为'装箱'
    }
    // end 遍历处理每个灯片

    // end 装箱
  }
}

async function checkDPEWMsFromUserGYSForSameDDGTAndGetTasks(
  DDId,
  GTId,
  GYSId,
  EWMs,
  transaction,
) {
  const tmpDPIds = EWMs.map(item => item.typeId);

  const tmpTargetDPs = await DBTables.DD_DW_DP.findAll({
    include: [
      {
        model: DBTables.DW,
        as: 'DW',
        where: {
          GTId,
        },
      },
    ],
    where: {
      DDId,
      GYSId,
      status: DBTables.DD_DW_DPStatus.YFPFHGYS,
    },
    transaction,
  });

  const tmpTargetDPIds = tmpTargetDPs.map(item => item.DPId);

  const diffDPIds = _.difference(tmpDPIds, tmpTargetDPIds);
  if (diffDPIds.length > 0) {
    throw new Error(`${diffDPIds}不属于从你所属供应商发往目标订单_柜台任务!`);
  }

  return tmpTargetDPs;
}
