import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangXiaoKuDP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    // 检查二维码是否都属于DP
    const { EWMs } = req.body;
    const notDPs = EWMs.filter(item => item.type !== 'DP');

    if (notDPs.length > 0) {
      throw new Error(`${notDPs}不是灯片二维码!`);
    }
    // end 检查二维码是否都属于DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    // [{ type: 'DP'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpGYSId = await user.getGYSId({ transaction });

    // 遍历处理每个EWM
    for (const item of EWMs) {
      await processDP(item, user, tmpGYSId, transaction);
    }
    // end 遍历处理每个EWM
  }
}

async function processDP(EWM, user, GYSId, transaction) {
  const tmpWYDP = await DBTables.WYDP.findOne({
    where: {
      EWM: JSON.stringify(EWM),
    },
    transaction,
  });

  if (!tmpWYDP) {
    // 如果EWM不存在, 报错
    throw new Error(`${EWM}不存在, 不可消库!`);
  } else {
    // 如果EWM存在, 只有状态在'装箱'前, 且不是'消库'状态可消库
    if (
      DBTables.WYDPStatusMap.get(tmpWYDP.statue) <
        DBTables.WYDPStatusMap.get(DBTables.WYDPStatus.ZX) &&
      tmpWYDP.statue !== DBTables.WYDPStatus.XK
    ) {
      await ppUtils.changeWYDPStatusOnGYS(
        tmpWYDP,
        DBTables.WYDPStatus.XK,
        user,
        GYSId,
        transaction,
      );
    } else {
      throw new Error(`${tmpWYDP}的状态不能消库!`);
    }
  }
}
