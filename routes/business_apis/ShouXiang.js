import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShouXiang extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { KDXEWMs } = req.body;
    const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查KDXEWMs都存在
    const tmpKDXs = await ppUtils.checkEWMsExistanceAndGetRecords('KDX', KDXEWMs, transaction);
    // end 检查KDXEWMs都存在

    // 检查KDXEWMs是属于FH状态
    await ppUtils.checkRecordsStatus(tmpKDXs, DBTables.KDXStatus.FH, '不能绑定快递', transaction);
    // end 检查KDXEWMs是属于FH状态

    // 检查KDX所属GT是和这个操作员一致
    const tmpGTId = await ppUtils.checkSameGTAndGetGTId(tmpKDXs);
    await user.checkGTId(tmpGTId, transaction);
    // end 检查KDX所属GT是和这个操作员一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // KDX状态转为SX
    await DBTables.KDX.update(
      {
        status: DBTables.KDXStatus.SX,
      },
      {
        where: {
          EWM: {
            $in: KDXEWMStrings,
          },
        },
        transaction,
      },
    );
    // end KDX状态转为SX

    // 新建相关KDXCZ
    const tmpKDXCZs = tmpKDXs.map(item => ({
      KDXId: item.id,
      status: DBTables.KDXStatus.SX,
      UserId: user.id,
    }));
    await DBTables.KDXCZ.bulkCreate(tmpKDXCZs, {
      transaction,
    });
    // end 新建相关KDXCZ

    // 改变KDX中WL/DP的状态位SX, 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(KDXEWMs, DBTables.WYWLStatus.SX, user, transaction);
    await ppUtils.changeWYDPsInKDXsStatus(KDXEWMs, DBTables.WYDPStatus.SX, user, transaction);
    // end 改变KDX中WL/DP的状态位SX, 并添加WYWLCZ/WYDPCZ
  }
}
