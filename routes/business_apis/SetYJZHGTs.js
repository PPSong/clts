import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetYJZHGTs extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // GTs: [
    //   {
    //     id: 2,
    //     number: 2,
    //   },
    //   {
    //     id: 3,
    //     number: 2,
    //   },
    // ];
    const { id, GTs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查YJZH
    const tmpYJZH = await user.checkYJZHId(id, transaction);
    // end 检查YJZH

    // 检查GTs
    for (let i = 0; i < GTs.length; i++) {
      await user.checkGTId(GTs[i].id, transaction);
    }
    // end 检查GTs

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 重置YJZH_GTs
    await tmpYJZH.setGTs(null, { transaction });
    for (let i = 0; i < GTs.length; i++) {
      const tmpGT = GTs[i];
      await tmpYJZH.addGT(tmpGT.id, { through: { number: tmpGT.number }, transaction });
    }
    // end 重置YJZH_GTs
  }
}
