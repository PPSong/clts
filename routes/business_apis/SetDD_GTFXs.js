import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import { PP_DDOperationLock } from './CreateDD';

export default class setDDGTFXs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, GTIds } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpDD = await user.checkDDId(id, transaction);
    for (let i = 0; i < GTIds.lengths; i++) {
      await user.checkGTId(GTIds[i].id);
    }

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // set DD_GTFXs
    await tmpDD.setFXGTs(GTIds, { transaction });
    // end set DD_GTFXs

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
