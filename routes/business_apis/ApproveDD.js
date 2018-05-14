import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import { PP_DDOperationLock } from './CreateDD';

export default class ApproveDD extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DDId
    const tmpDD = await user.checkDDId(id, transaction);
    if (tmpDD.status !== DBTables.DDStatus.CS) {
      throw new Error(`${tmpDD}状态为:${tmpDD.status}, 不能被审批!`);
    }
    // end 检查DDId

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await tmpDD.update(
      {
        status: DBTables.DDStatus.YSP,
      },
      { transaction },
    );

    // 清除当前PP的PP_GTFX
    await DBTables.PP_GTFX.destroy({
      where: {
        PPId: tmpDD.PPId,
      },
      transaction,
    });
    // end 清除当前PP的PP_GTFX

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock
  }

  static async errorCatchingHook(req, res, next, user, transaction) {
    const { id } = req.body;
    const tmpDD = await DBTables.DD.findOne({
      where: {
        id,
      },
      transaction,
    });
    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock
  }
}
