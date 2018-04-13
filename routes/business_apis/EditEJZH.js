import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class EditEJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpEJZH = await user.checkEJZHId(id, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 2) {
      throw new Error(`${tmpWL}不是二级物料!`);
    }

    // FGTesterIds
    const FGTesterIds = FGTesters.map(item => item.id);
    for (let i = 0; i < FGTesterIds.length; i++) {
      await user.checkFGTesterId(FGTesterIds[i], transaction);
    }
    // end FGTesterIds

    // SJWLIds
    const SJWLIds = SJWLs.map(item => item.id);
    for (let i = 0; i < SJWLIds.length; i++) {
      const tmpSJWL = await user.checkWLId(SJWLIds[i], transaction);
      if (tmpSJWL.level !== 3) {
        throw new Error(`${tmpSJWL}不是三级物料!`);
      }
    }
    // end SJWLIds
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 编辑EJZH
    await tmpEJZH.update(
      {
        WLId,
        imageUrl,
      },
      { transaction },
    );

    // 重置 EJZHXGTs
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
    // end 重置 EJZHXGTs

    // 重置 FGTesters
    await tmpEJZH.setFGTesters(null, { transaction });
    for (let i = 0; i < FGTesters.length; i++) {
      const tmpFGTester = FGTesters[i];
      await tmpEJZH.addFGTester(tmpFGTester.id, {
        through: { number: tmpFGTester.number },
        transaction,
      });
    }
    // end 重置 FGTesters

    // 配置EJZH的SJWLs
    await tmpEJZH.setSJWLs(null, { transaction });
    for (let i = 0; i < SJWLs.length; i++) {
      const tmpSJWL = SJWLs[i];
      await tmpEJZH.addSJWL(tmpSJWL.id, { through: { number: tmpSJWL.number }, transaction });
    }
    // end 配置EJZH的SJWLs

    // end 编辑EJZH
  }
}
