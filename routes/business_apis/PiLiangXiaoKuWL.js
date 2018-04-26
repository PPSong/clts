import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangXiaoKuWL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    // 检查二维码是否都属于WL
    const { EWMs } = req.body;
    const notWLs = EWMs.filter(item => item.type !== 'WL');

    if (notWLs.length > 0) {
      throw new Error(`${notWLs}不是物料二维码!`);
    }
    // end 检查二维码是否都属于WL
  }

  static async mainProcess(req, res, next, user, transaction) {
    // [{ type: 'WL'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpGYSId = await user.getGYSId(transaction);

    // 遍历处理每个EWM
    for (const item of EWMs) {
      await processWL(item, user, tmpGYSId, transaction);
    }
    // end 遍历处理每个EWM
  }
}

async function processWL(EWM, user, GYSId, transaction) {
  const tmpWYWL = await DBTables.WYWL.findOne({
    where: {
      EWM: JSON.stringify(EWM),
    },
    transaction,
  });

  if (!tmpWYWL) {
    // 如果EWM不存在, 报错
    throw new Error(`${EWM}不存在, 不可消库!`);
  } else {
    // 如果EWM存在, 只有状态在'装箱'前, 且不是'消库'状态可消库
    if (
      DBTables.WYWLStatusMap.get(tmpWYWL.status) <
        DBTables.WYWLStatusMap.get(DBTables.WYWLStatus.ZX) &&
      tmpWYWL.status !== DBTables.WYWLStatus.XK
    ) {
      await ppUtils.changeWYWLStatusOnGYS(
        tmpWYWL,
        DBTables.WYWLStatus.XK,
        user,
        GYSId,
        transaction,
      );
    } else {
      throw new Error(`${tmpWYWL}的状态不能消库!`);
    }
  }
}
