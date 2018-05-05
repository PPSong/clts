import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class AnZhuangFanKuiQuanJingWLTuPian extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZG, DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DDId, GTId, imageUrls } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
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
    let tmpWhere;
    if (user.JS === DBTables.JS.AZG) {
      tmpWhere = {
        DDId,
        GTId,
        AZGUserId: user.id,
      };
    } else if (user.JS === DBTables.JS.GTBA) {
      tmpWhere = {
        DDId,
        GTId,
        AZGSId: null,
      };
    } else {
      throw new Error('没有权限!');
    }

    await DBTables.DD_GT_WL.update(
      {
        status: DBTables.DD_GT_WLStatus.WC,
      },
      {
        where: tmpWhere,
        transaction,
      },
    );
    // end 修改相关任务状态为'完成'
  }
}
