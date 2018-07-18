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
    const tmpGYSId = await user.getGYSId(transaction);

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
        GYSId: tmpGYSId,
        transaction,
        DDId,
      });
    }
    // end 检查KDXEWM

    // 检查DPEWMs
    for (const item of DPEWMs) {
      // 确认WYDP不存在
      let tmpWYDP = await DBTables.WYDP.findOne({
        where: {
          EWM: JSON.stringify(item),
        },
        transaction,
      });

      if (tmpWYDP) {
        throw new Error(`${tmpWYDP}不属于可装箱状态!`);
      }
      // end 确认WYDP不存在

      // 确认有这个订单需求
      const tmpDWId = item.DWId;
      const tmpDPId = item.typeId;
      const tmpDD_DW_DP = await DBTables.DD_DW_DP.findOne({
        where: {
          DDId,
          DWId: tmpDWId,
          DPId: tmpDPId,
        },
        transaction,
      });
      if (!tmpDD_DW_DP) {
        throw new Error(`没有这个订单需求:${JSON.stringify(item)}`);
      }
      // end 确认有这个订单需求

      // 发货供应商是当前用户所属GYS
      if (tmpDD_DW_DP.GYSId !== tmpGYSId) {
        throw new Error(`DDId: ${DDId}, DWId: ${tmpDWId}, DPId: ${tmpDPId}的发货供应商不匹配!`);
      }
      // end 发货供应商是当前用户所属GYS

      // 发往的柜台的id是GTId
      const tmpDW = await DBTables.DW.findOne({
        where: {
          id: tmpDWId,
        },
        transaction,
      });
      if (tmpDW.GTId !== GTId) {
        throw new Error(`${JSON.stringify(item)}不属于这个柜台id:${GTId}!`);
      }
      // end 发往的柜台的id是GTId

      // 装箱
      await tmpDD_DW_DP.update(
        {
          ZXNumber: DBTables.literal('ZXNumber + 1'),
          status: `${DBTables.DD_DW_DPStatus.ZXWC}`,
        },
        {
          transaction,
        },
      );
      // end 装箱

      // 获取尝试装箱后任务ZXNumber
      await tmpDD_DW_DP.reload({ transaction });
      // end 获取尝试装箱后任务ZXNumber

      // 判断是否任务超限
      if (tmpDD_DW_DP.ZXNumber > 1) {
        throw new Error(`${tmpDD_DW_DP}任务超限!`);
      }
      // end 判断是否任务超限

      // 创建WYDP并绑定DD_DW_DP, 状态为'装箱'
      tmpWYDP = await DBTables.WYDP.create(
        {
          uuid: item.uuid,
          DWId: item.DWId,
          GTId: item.GTId,
          PPId: item.PPId,
          EWM: JSON.stringify(item),
          status: DBTables.WYDPStatus.ZX,
          DPId: tmpDPId,
          GYSId: tmpGYSId,
          DDDWDPId: tmpDD_DW_DP.id,
          KDXId: tmpKDX.id,
        },
        {
          transaction,
        },
      );

      await DBTables.WYDPCZ.create(
        {
          WYDPId: tmpWYDP.id,
          status: DBTables.WYDPStatus.ZX,
          UserId: user.id,
        },
        {
          transaction,
        },
      );
      // end 创建WYDP并绑定DD_DW_DP, 状态为'装箱'
    }
    // end 检查DPEWMs
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
  }
}
