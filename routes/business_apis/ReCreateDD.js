import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import { PP_DDOperationLock } from './CreateDD';

export default class ReCreateDD extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DDId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DDId
    const tmpDD = await user.checkDDId(DDId, transaction);
    // end 检查DDId

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 重置DD和相关Snapshot
    const r = await DBTables.sequelize.query('call reGenDD(:DDId)', {
      transaction,
      replacements: { DDId },
    });
    const result = r[0];
    if (result.code <= 0) {
      throw Error(result.msg);
    }
    // end 重置DD和相关Snapshot

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock
  }

  static async errorCatchingHook(req, res, next, user, transaction) {
    const { DDId } = req.body;
    const tmpDD = await DBTables.DD.findOne({
      where: {
        id: DDId,
      },
      transaction,
    });
    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock
  }
}
