import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class EditYJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      id, WLId, imageUrl, XGTs, EJZHs,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpYJZH = await user.checkYJZHId(id, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 1) {
      throw new Error(`${tmpWL}不是一级物料!`);
    }

    // 检查EJZHIds与YJZH同一品牌, 而且都是enable状态
    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      await user.checkEJZHId(EJZHIds[i], transaction);
    }
    // end 检查EJZHIds与YJZH同一品牌, 而且都是enable状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 编辑YJZH
    await tmpYJZH.update(
      {
        WLId,
        imageUrl,
      },
      { transaction },
    );

    // 重置 YJZHXGTs
    await DBTables.YJZHXGT.destroy({
      where: {
        YJZHId: tmpYJZH.id,
      },
      transaction,
    });
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await DBTables.YJZHXGT.create(
        {
          YJZHId: tmpYJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 重置 YJZHXGTs

    // 配置YJZH的EJZHs
    await tmpYJZH.setEJZHs(null, { transaction });
    for (let i = 0; i < EJZHs.length; i++) {
      const tmpEJZH = EJZHs[i];
      await tmpYJZH.addEJZH(tmpEJZH.id, { through: { number: tmpEJZH.number }, transaction });
    }
    // end 配置YJZH的EJZHs

    // end 编辑YJZH
  }
}
