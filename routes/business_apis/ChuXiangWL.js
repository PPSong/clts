import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ChuXiangWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs } = req.body;

    // 检查WLEWMs是否都是WL
    const notWLEWMs = EWMs.filter(item => item.type !== DBTables.EWMType.WL);
    if (notWLEWMs.length > 0) {
      throw new Error(`${notWLEWMs}不属于物料, 不能出箱!`);
    }
    // end 检查HWEWMs是否都是WL
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWEWMs: [{ type: 'WL'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWMs存在
    const tmpWYWLs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYWL',
      EWMs,
      transaction,
    );
    // end 检查EWMs存在

    // 检查EWMs都在装箱状态
    const notZXRecords = tmpWYWLs.filter(item => item.status !== DBTables.WYWLStatus.ZX);
    if (notZXRecords.length > 0) {
      throw new Error(`${notZXRecords}不在${DBTables.WYWLStatus.ZX}状态, 不能出箱!`);
    }
    // end 检查EWMs都在装箱状态

    // 检查EWMs都在当前用户所属GYS处
    const tmpGYSId = await user.getGYSId(transaction);
    const notRightGYSRecords = tmpWYWLs.filter(item => item.GYSId !== tmpGYSId);
    if (notRightGYSRecords.length > 0) {
      throw new Error(`${notRightGYSRecords}不在当前用户所属供应商处, 不能出箱!`);
    }
    // end 检查EWMs都在当前用户所属GYS处

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 出箱
    for (const item of tmpWYWLs) {
      await chuXiangWYWL(item, user, tmpGYSId, transaction);
    }
    // end 出箱
  }
}

async function chuXiangWYWL(WYWL, user, GYSId, transaction) {
  if (WYWL.DDGTWLId !== null) {
    // 处理绑在DD_GT_WL的情况

    // 减少DD_GT_WL ZXNumber
    await DBTables.DD_GT_WL.update(
      { ZXNumber: DBTables.literal('ZXNumber - 1') },
      {
        where: {
          id: WYWL.DDGTWLId,
        },
        transaction,
      },
    );
    // end 减少DD_GT_WL ZXNumber

    // 清除绑上KDXID, DD_GT_WL,
    await WYWL.update(
      {
        DDGTWLId: null,
        KDXId: null,
      },
      {
        transaction,
      },
    );
    // end 清除绑上KDXID, DD_GT_WL,

    // 转为RK状态
    const ids = [WYWL.id];
    await ppUtils.changeWYWLsStatus({
      ids,
      status: DBTables.WYWLStatus.RK,
      user,
      transaction,
      GYSId,
    });
    // end 转为RK状态
  } else if (WYWL.WLBHId !== null) {
    // 处理绑在WLBH的情况

    // 减少WLBH的ZXNumber
    await DBTables.WLBH.update(
      { ZXNumber: DBTables.literal('ZXNumber - 1') },
      {
        where: {
          id: WYWL.WLBHId,
        },
        transaction,
      },
    );
    // end 减少WLBH的ZXNumber

    // 清除绑上KDXID, WLBHId
    await WYWL.update(
      {
        WLBHId: null,
        KDXId: null,
      },
      {
        transaction,
      },
    );
    // end 清除绑上KDXID, WLBHId

    // 转为RK状态
    const ids = [WYWL.id];
    await ppUtils.changeWYWLsStatus({
      ids,
      status: DBTables.WYWLStatus.RK,
      user,
      transaction,
      GYSId,
    });
    // end 转为RK状态
  } else {
    throw new Error(`${WYWL}记录有问题!`);
  }
}
