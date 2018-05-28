import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateYJZH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // XGTs: ['YJZH1Url'];
    // EJZHs: [
    //   {
    //     id: 2,
    //     number: 2,
    //   },
    //   {
    //     id: 3,
    //     number: 2,
    //   },
    // ];
    let {
      PPId, name, WLId, imageUrl, XGTs, EJZHs,
    } = req.body;
    if (name) name = name.trim();
    EJZHs = EJZHs || [];

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查PP
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查PP

    // 检查WLId
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 1) {
      throw new Error(`${tmpWL}不是一级物料!`);
    }
    // end 检查WLId

    // 检查EJZHs
    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      await user.checkEJZHId(EJZHIds[i], transaction);
    }
    // end 检查EJZHs

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 创建YJZH
    const tmpYJZH = await DBTables.YJZH.create(
      {
        name,
        WLId,
        PPId,
        imageUrl,
      },
      { transaction },
    );

    // 创建YJZHXGTs
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
    // end 创建YJZHXGTs

    // 配置YJZH的EJZHs
    for (let i = 0; i < EJZHs.length; i++) {
      const tmpEJZH = EJZHs[i];
      await tmpYJZH.addEJZH(tmpEJZH.id, {
        through: { number: tmpEJZH.number },
        transaction,
      });
    }

    // end 配置YJZH的EJZHs

    // end 创建YJZH
  }
}
