import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetWLBH0AZGS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    for (let i = 0; i < ids.length; i++) {
      const tmpWLBH = await DBTables.WLBH.findOne({
        include: [
          {
            model: DBTables.GT,
            as: 'GT',
          },
        ],
        where: {
          id: ids[i],
        },
      });

      if (!tmpWLBH) {
        throw new Error(`物料补货记录id:${ids[i]}不存在!`);
      }

      await user.checkPPId(tmpWLBH.GT.PPId, transaction);

      if (tmpWLBH.status !== DBTables.WLBHStatus.KFJLSPTG) {
        throw new Error(`物料补货记录:${tmpWLBH}状态不属于${DBTables.WLBHStatus.KFJLSPTG}!`);
      }

      // set AZGS
      await tmpWLBH.update(
        {
          AZGSId,
        },
        { transaction },
      );
      // end set AZGS
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
  }
}
