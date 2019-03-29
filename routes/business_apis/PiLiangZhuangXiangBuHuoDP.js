import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangZhuangXiangBuHuoDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      YJZXTime, GTId, DPEWMs, KDXEWM,
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
      YJZXTime: time, GTId, DPEWMs, KDXEWM,
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
        throw new Error(`${tmpKDX}不属于订单id:${YJZXTime}!`);
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
      // end 如果存在则YJZXTime, GTId, HWType, status要符合条件
    } else {
      tmpKDX = await ppUtils.createDDKDXAndZhuangXiang({
        EWM: KDXEWM,
        GTId,
        HWType: DBTables.HWType.DP,
        user,
        GYSId: tmpGYSId,
        transaction,
        YJZXTime,
      });
    }
    // end 检查KDXEWM

    // 检查DPEWMs
    for (const item of DPEWMs) {
      // 确认WYDP不存在
      let tmpWYDP = await DBTables.WYDP.findOne({
        where: {
          uuid: item.uuid,
        },
        transaction,
      });

      if (tmpWYDP) {
        throw new Error(`${tmpWYDP}不属于可装箱状态!`);
      }
      // end 确认WYDP不存在

      // 确认有这个补货需求
      const tmpDWId = item.DWId;
      const tmpDPId = item.typeId;
      const tmpDPBH = await DBTables.DPBH.findOne({
        where: {
          DWId: tmpDWId,
          DPId: tmpDPId,
          YJZXTime,
          status: DBTables.DPBHStatus.YFPFHGYS,
        },
        transaction,
      });
      if (!tmpDPBH) {
        throw new Error(`没有这个补货需求:${JSON.stringify(item)}`);
      }
      // end 确认有这个补货需求

      // 发货供应商是当前用户所属GYS
      if (tmpDPBH.GYSId !== tmpGYSId) {
        throw new Error(`${tmpWYDP}的发货供应商不匹配!`);
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
        throw new Error(`${tmpWYDP}不属于这个柜台id:${GTId}!`);
      }
      // end 发往的柜台的id是GTId

      // 尝试装箱
      await tmpDPBH.update(
        {
          ZXNumber: DBTables.literal('ZXNumber + 1'),
          status: `${DBTables.DPBHStatus.ZXWC}`,
        },
        {
          transaction,
        },
      );
      // end 尝试装箱

      // 获取尝试装箱后任务ZXNumber
      await tmpDPBH.reload({ transaction });
      // end 获取尝试装箱后任务ZXNumber

      // 判断是否任务超限
      if (tmpDPBH.ZXNumber > 1) {
        throw new Error(`${tmpDPBH}任务超限!`);
      }
      // end 判断是否任务超限

      // 创建WYDP并绑定DPBH, 状态为'装箱'
      tmpWYDP = await DBTables.WYDP.create(
        {
          uuid: item.uuid,
          EWM: JSON.stringify(item),
          status: DBTables.WYDPStatus.ZX,
          DPId: tmpDPId,
          DWId: tmpDWId,
          GTId: item.GTId,
          PPId: item.PPId,
          GYSId: tmpGYSId,
          DPBHId: tmpDPBH.id,
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


setTimeout(async () => {
  let data = [{"DDId":14,"DWId":169,"DPId":49,"GTId":"51","PPId":"3","CC":"数码全透哑膜","CZ":"378*593","DPName":"3月底妆产品","DPImageUrl":"2sftaruS0KGD.jpg","ProduceGYSId":2,"DWName":"C彩妆背柜3-3","GYSName":"博域","PPName":"GAC","GTName":"上海梅陇镇","type":"DP","typeId":49,"uuid":"DP2338EE55F6F36352"}]
  let item = data[0];
  await DBTables.WYDP.create(
    {
      uuid: item.uuid,
      EWM: JSON.stringify(item),
      status: DBTables.WYDPStatus.ZX,
      DPId: item.DPId,
      DWId: item.DWId,
      GTId: item.GTId,
      PPId: item.PPId,
      GYSId: item.ProduceGYSId,
      DPBHId: 1,
      KDXId: 1,
    }
  )
}, 1200);