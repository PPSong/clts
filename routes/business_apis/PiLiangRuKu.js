import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class PiLiangRuKu extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // 检查二维码是否都属于同一种WL或者DP
    const tmpTypeTypeIds = EWMs.map(item => `${item.type}_${item.typeId}`);
    const tmpUniqueTypeTypeIds = [...new Set(tmpTypeTypeIds)];
    if (tmpUniqueTypeTypeIds.length !== 1) {
      throw new Error('二维码组必须属于同一种物料或灯片!');
    }

    const tmpType = tmpUniqueTypeTypeIds[0].split('_')[0];
    const tmpId = tmpUniqueTypeTypeIds[0].split('_')[1];
    if (![DBTables.EWMType.WL, DBTables.EWMType.DP].includes(tmpType)) {
      throw new Error('入库必须是物料或灯片!');
    }
    // end 检查二维码是否都属于同一种WL或者DP

    // 检查二维码中WLId/DPId是否属于ZHY所属GYS, 包括中转GYS
    if (tmpType === DBTables.EWMType.WL) {
      await user.checkWLId(tmpId, transaction);
    } else {
      await user.checkDPId(tmpId, transaction);
    }
    // end 检查二维码中WLId/DPId是否属于ZHY所属GYS, 包括中转GYS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpGYSId = await user.getGYSId(transaction);

    if (tmpType === DBTables.EWMType.WL) {
      await this.processWL(EWMs, tmpId, tmpGYSId, user, transaction);
    } else {
      await this.processDP(EWMs, tmpId, tmpGYSId, user, transaction);
    }
  }

  static async processWL(EWMs, WLId, GYSId, user, transaction) {
    const newRecords = EWMs.map(item => ({
      EWM: JSON.stringify(item),
      status: DBTables.WYWLStatus.RK,
      WLId,
      GYSId,
    }));

    // 批量新建WYWLs
    const tmpWYWLs = await DBTables.WYWL.bulkCreate(newRecords, {
      transaction,
    });
    // end 批量新建WYWLs

    const tmpWYWLCZs = tmpWYWLs.map(item => ({
      WYWLId: item.id,
      status: DBTables.WYWLStatus.RK,
      UserId: user.id,
    }));

    // 新建相关WYWLCZ
    await DBTables.WYWLCZ.bulkCreate(tmpWYWLCZs, {
      transaction,
    });
    // end 新建相关WYWLCZ
  }

  static async processDP(EWMs, DPId, GYSId, user, transaction) {
    const newRecords = EWMs.map(item => ({
      EWM: JSON.stringify(item),
      status: DBTables.WYDPStatus.RK,
      DPId,
      GYSId,
    }));

    // 批量新建WYDPs
    const tmpWYDPs = await DBTables.WYDP.bulkCreate(newRecords, {
      transaction,
    });
    // end 批量新建WYDPs

    const tmpWYDPCZs = tmpWYDPs.map(item => ({
      WYDPId: item.id,
      status: DBTables.WYDPStatus.RK,
      UserId: user.id,
    }));

    // 新建相关WYDPCZ
    await DBTables.WYDPCZ.bulkCreate(tmpWYDPCZs, {
      transaction,
    });
    // end 新建相关WYDPCZ
  }
}
