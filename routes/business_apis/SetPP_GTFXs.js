import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import { PP_DDOperationLock } from './CreateDD';

export default class SetPP_GTFXs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, GTIds } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpPP = await user.checkPPId(id, transaction);
    for (let i = 0; i < GTIds.lengths; i++) {
      await user.checkGTId(GTIds[i].id);
    }

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpPP.id]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpPP.id] = true;
    }
    // end 检查PP_DDOperationLock

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // set PP_GTFXs
    await tmpPP.setFXGTs(GTIds, { transaction });
    // end set PP_GTFXs

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpPP.id];
    // end 清除PP_DDOperationLock
  }

  static async errorCatchingHook(req, res, next, user, transaction) {
    const { id } = req.body;
    const tmpPP = await DBTables.PP.findOne({
      where: {
        id,
      },
      transaction,
    });
    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpPP.id];
    // end 清除PP_DDOperationLock
  }
}
