import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ChuXiangDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs } = req.body;

    // 检查DPEWMs是否都是DP
    const notDPEWMs = EWMs.filter(item => item.type !== DBTables.EWMType.DP);
    if (notDPEWMs.length > 0) {
      throw new Error(`${notDPEWMs}不属于灯片, 不能出箱!`);
    }
    // end 检查HWEWMs是否都是DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWEWMs: [{ type: 'DP'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWMs存在
    const tmpWYDPs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'WYDP',
      EWMs,
      transaction,
    );
    // end 检查EWMs存在

    // 检查EWMs都在装箱状态
    const notZXRecords = tmpWYDPs.filter(item => item.status !== DBTables.WYDPStatus.ZX);
    if (notZXRecords.length > 0) {
      throw new Error(`${notZXRecords}不在${DBTables.WYDPStatus.ZX}状态, 不能出箱!`);
    }
    // end 检查EWMs都在装箱状态

    // 检查EWMs都在当前用户所属GYS处
    const tmpGYSId = await user.getGYSId(transaction);
    const notRightGYSRecords = tmpWYDPs.filter(item => item.GYSId !== tmpGYSId);
    if (notRightGYSRecords.length > 0) {
      throw new Error(`${notRightGYSRecords}不在当前用户所属供应商处, 不能出箱!`);
    }
    // end 检查EWMs都在当前用户所属GYS处

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 出箱
    for (const item of tmpWYDPs) {
      await chuXiangWYDP(item, user, tmpGYSId, transaction);
    }
    // end 出箱
  }
}

async function chuXiangWYDP(WYDP, user, GYSId, transaction) {
  if (WYDP.DDDWDPId !== null) {
    // 处理绑在DD_DW_DP的情况

    // 减少DD_DW_DP ZXNumber, 修改状态为YFPFHGYS
    await DBTables.DD_DW_DP.update(
      {
        ZXNumber: 0,
        status: DBTables.DD_DW_DPStatus.YFPFHGYS,
      },
      {
        where: {
          id: WYDP.DDDWDPId,
        },
        transaction,
      },
    );
    // end 减少DD_DW_DP ZXNumber, 修改状态为YFPFHGYS
  } else if (WYDP.DPBHId !== null) {
    // 处理绑在DPBH的情况

    // 减少DPBH的ZXNumber
    await DBTables.DPBH.update(
      {
        ZXNumber: 0,
        status: DBTables.DPBHStatus.YFPFHGYS,
      },
      {
        where: {
          id: WYDP.DPBHId,
        },
        transaction,
      },
    );
    // end 减少DPBH的ZXNumber
  } else {
    throw new Error(`${WYDP}记录有问题!`);
  }

  // 删除与此相关WYDPCZ, WYDP
  await DBTables.WYDPCZ.destroy({
    where: {
      WYDPId: WYDP.id,
    },
    transaction,
  });

  await DBTables.WYDP.destroy({
    where: {
      id: WYDP.id,
    },
    transaction,
  });
  // end 删除与此相关WYDPCZ, WYDP
}
