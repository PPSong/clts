import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateEJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let {
      PPId, name, WLId, imageUrl, XGTs, FGTesters, SJWLs, XGTNote
    } = req.body;
    if (name) name = name.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);

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

    // 创建EJZH
    const tmpEJZH = await DBTables.EJZH.create(
      {
        name,
        WLId,
        PPId,
        imageUrl,
        XGTNote,
      },
      { transaction },
    );

    // 创建EJZHXGTs
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
    // end 创建EJZHXGTs

    // 配置EJZH FGTesters
    if (FGTesters) {
      for (let i = 0; i < FGTesters.length; i++) {
        const tmpFGTester = FGTesters[i];
        await tmpEJZH.addFGTester(tmpFGTester.id, {
          through: { number: tmpFGTester.number },
          transaction,
        });
      }
    }
    // end 配置EJZH FGTesters

    // 配置EJZH SJWLs
    if (SJWLs) {
      for (let i = 0; i < SJWLs.length; i++) {
        const tmpSJWL = SJWLs[i];
        await tmpEJZH.addSJWL(tmpSJWL.id, {
          through: { number: tmpSJWL.number },
          transaction,
        });
      }
    }
    // end 配置EJZH SJWLs

    // end 创建EJZH
  }
}
