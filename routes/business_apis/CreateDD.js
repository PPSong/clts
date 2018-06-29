import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';
import moment from 'moment';

export const PP_DDOperationLock = {};

export default class CreateDD extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { PPId, name } = req.body;
    name = name.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // 检查PPId
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查PPId

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 创建DD和相关Snapshot
    const r = await DBTables.sequelize.query('call genDD(:PPId, :name)', {
      transaction,
      replacements: { PPId, name },
    });
    const result = r[0];
    if (result.code <= 0) {
      throw Error(result.msg);
    }

    const DDId = result.DDId;

    // 获取和此订单有关的柜台id数组
    const GTIds = await ppUtils.getGTListInDD(DDId, transaction);

    for (let GTId of GTIds) {
      // 创建柜台陈列快照数据
      let CL = await ppUtils.getGTCL(GTId, transaction);

      const now = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
      await DBTables.sequelize.query(`
        INSERT INTO DDGTCL
        (DDId, GTId, DWCL, WLCL, createdAt, updatedAt)
        VALUES
        (${DDId}, ${GTId}, '${JSON.stringify(CL.DWCLs)}', '${JSON.stringify(CL.WLCLs)}', '${now}', '${now}')
      `, { 
        type: DBTables.sequelize.QueryTypes.INSERT,
        transaction 
      });
    }

    // end 创建DD和相关Snapshot

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[PPId];
    // end 清除PP_DDOperationLock
  }

  static async errorCatchingHook(req, res, next, user, transaction) {
    const { PPId } = req.body;
    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[PPId];
    // end 清除PP_DDOperationLock
  }
}
