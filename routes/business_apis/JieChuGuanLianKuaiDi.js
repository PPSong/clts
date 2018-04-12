import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class JieChuGuanLianKuaiDi extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
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
    await ppUtils.checkRecordStatus(
      tmpKDXs,
      DBTables.KDXStatus.FH,
      '不能解除绑定快递',
      transaction,
    );
    // end 检查KDXEWMs是属于FH状态

    // 不用检查ZHY是否有权限解除这个KDX的关联, 谁都可以解除

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // KDXEWMs取消绑定KDDId, 转为状态ZX
    await DBTables.KDX.update(
      {
        status: DBTables.KDXStatus.ZX,
        KDDId: null,
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
    // end KDXEWMs取消绑定KDDId, 转为状态ZX

    // 新建相关KDXCZ
    const tmpKDXCZs = tmpKDXs.map(item => ({
      KDXId: item.id,
      status: DBTables.KDXStatus.ZX,
      UserId: user.id,
    }));
    await DBTables.KDXCZ.bulkCreate(tmpKDXCZs, {
      transaction,
    });
    // end 新建相关KDXCZ

    // 改变KDX中WL/DP的状态位FH, 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(KDXEWMs, DBTables.WYWLStatus.ZX, user, transaction);
    await ppUtils.changeWYDPsInKDXsStatus(KDXEWMs, DBTables.WYWLStatus.ZX, user, transaction);
    // end 改变KDX中WL/DP的状态位FH, 并添加WYWLCZ/WYDPCZ
  }
}
