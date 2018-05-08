import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class AnZhuangFanKuiQuanJingWLTuPian extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZG, DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DDId, GTId, imageUrls } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    let tmpWhere;
    if (user.JS === DBTables.JS.AZG) {
      tmpWhere = {
        DDId,
        GTId,
        AZGUserId: user.id,
      };
    } else if (user.JS === DBTables.JS.GTBA) {
      // 检查GTId是否是GTBA的所属GT
      await user.checkGTId(GTId, transaction);
      // end 检查GTId是否是GTBA的所属GT

      tmpWhere = {
        DDId,
        GTId,
        AZGSId: null,
      };
    } else {
      throw new Error('没有权限!');
    }

    const tmpDD_GT_WLs = await DBTables.DD_GT_WL.findAll({
      where: {
        ...tmpWhere,
        status: DBTables.DD_GT_WLStatus.KPQJT,
      },
      transaction,
    });

    if (tmpDD_GT_WLs.length === 0) {
      throw new Error('没有任务可拍全景图!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpRecords = imageUrls.map(item => ({
      imageUrl: item,
      DDId,
      GTId,
      UserId: user.id,
    }));
    await DBTables.WLQJFKT.bulkCreate(tmpRecords, {
      transaction,
    });

    // 修改相关任务状态为'完成'

    await tmpDD_GT_WLs.update(
      {
        status: DBTables.DD_GT_WLStatus.WC,
      },
      {
        transaction,
      },
    );
    // end 修改相关任务状态为'完成'
  }
}
