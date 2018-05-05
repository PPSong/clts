import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class AnZhuangFanKuiQuanJingDPTuPian extends BusinessApiBase {
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
        AZGUserId: user.id,
      };
    } else if (user.JS === DBTables.JS.GTBA) {
      // 检查GTId是否是GTBA的所属GT
      await user.checkGTId(GTId, transaction);
      // end 检查GTId是否是GTBA的所属GT

      tmpWhere = {
        DDId,
        AZGSId: null,
      };
    } else {
      throw new Error('没有权限!');
    }

    const tmpDD_DW_DPs = await DBTables.DD_DW_DP.findAll({
      include: [
        {
          model: DBTables.DW,
          as: 'DW',
          where: {
            GTId,
          },
        },
      ],
      where: {
        ...tmpWhere,
        status: DBTables.DD_DW_DPStatus.KPQJT,
      },
      transaction,
    });

    if (tmpDD_DW_DPs.length === 0) {
      throw new Error('没有任务可拍全景图!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpRecords = imageUrls.map(item => ({
      imageUrl: item,
      DDId,
      GTId,
      UserId: user.id,
    }));
    await DBTables.DPQJFKT.bulkCreate(tmpRecords, {
      transaction,
    });

    // 修改相关任务状态为'完成'
    const ids = tmpDD_DW_DPs.map(item => item.id);
    await DBTables.DD_DW_DP.update(
      {
        status: DBTables.DD_DW_DPStatus.WC,
      },
      {
        where: {
          id: {
            $in: ids,
          },
        },
        transaction,
      },
    );
    // end 修改相关任务状态为'完成'
  }
}
