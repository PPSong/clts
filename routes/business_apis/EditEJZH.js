import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class EditEJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // XGTs: ['XGT_T1', 'XGT_T2'];
    // FGTesters: [
    //   {
    //     id: 2,
    //     number: 2,
    //   },
    //   {
    //     id: 3,
    //     number: 2,
    //   },
    // ];
    // SJWLs: [
    //   {
    //     id: 1,
    //     number: 2,
    //   },
    // ];
    const {
      id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EJZH
    const tmpEJZH = await user.checkEJZHId(id, transaction);
    // end 检查EJZH

    // 检查WLId
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 2) {
      throw new Error(`${tmpWL}不是二级物料!`);
    }
    // end 检查WLId

    // 检查FGTesterIds
    if (FGTesters) {
      const FGTesterIds = FGTesters.map(item => item.id);
      for (let i = 0; i < FGTesterIds.length; i++) {
        await user.checkFGTesterId(FGTesterIds[i], transaction);
      }
    }
    // end 检查FGTesterIds

    // 检查SJWLIds
    if (SJWLs) {
      const SJWLIds = SJWLs.map(item => item.id);
      for (let i = 0; i < SJWLIds.length; i++) {
        const tmpSJWL = await user.checkWLId(SJWLIds[i], transaction);
        if (tmpSJWL.level !== 3) {
          throw new Error(`${tmpSJWL}不是三级物料!`);
        }
      }
    }
    // end 检查SJWLIds

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 编辑EJZH
    await tmpEJZH.update(
      {
        WLId,
        imageUrl,
      },
      { transaction },
    );

    // 重置EJZHXGTs
    await DBTables.EJZHXGT.destroy({
      where: {
        EJZHId: tmpEJZH.id,
      },
      transaction,
    });
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await DBTables.EJZHXGT.create(
        {
          EJZHId: tmpEJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 重置EJZHXGTs

    // 重置FGTesters
    if (FGTesters) {
      await tmpEJZH.setFGTesters(null, { transaction });
      for (let i = 0; i < FGTesters.length; i++) {
        const tmpFGTester = FGTesters[i];
        await tmpEJZH.addFGTester(tmpFGTester.id, {
          through: { number: tmpFGTester.number },
          transaction,
        });
      }
    }
    // end 重置FGTesters

    // 重置EJZH的SJWLs
    if (SJWLs) {
      await tmpEJZH.setSJWLs(null, { transaction });
      for (let i = 0; i < SJWLs.length; i++) {
        const tmpSJWL = SJWLs[i];
        await tmpEJZH.addSJWL(tmpSJWL.id, {
          through: { number: tmpSJWL.number },
          transaction,
        });
      }
    }
    // end 重置EJZH的SJWLs

    // end 编辑EJZH
  }
}
