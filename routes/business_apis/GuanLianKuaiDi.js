import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class GuanLianKuaiDi extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { KDXEWMs, KDDCode } = req.body;
    const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查KDXEWMs都存在
    const tmpKDXs = await ppUtils.checkEWMsExistanceAndGetRecords('KDX', KDXEWMs, transaction);
    // end 检查KDXEWMs都存在

    // 检查KDXEWMs是属于ZX状态, 而且属于同一个GT
    await ppUtils.checkRecordsStatus(tmpKDXs, DBTables.KDXStatus.ZX, '不能绑定快递', transaction);
    await ppUtils.checkSameGTAndGetGTId(tmpKDXs);
    // end 检查KDXEWMs是属于ZX状态, 而且属于同一个GT

    // 不用检查ZHY是否有权限快递这个KDX, 谁都可以快递

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 如需新建KDD则新建
    const tmpKDDR = await DBTables.KDD.findOrCreate({
      where: {
        code: KDDCode,
      },
      defaults: {
        code: KDDCode,
      },
      transaction,
    });
    // end 如需新建KDD则新建
    const tmpKDD = tmpKDDR[0];

    // KDXEWMs绑上KDDId, 转为状态FH
    await DBTables.KDX.update(
      {
        status: DBTables.KDXStatus.FH,
        KDDId: tmpKDD.id,
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
    // end KDXEWMs绑上KDDId, 转为状态FH

    // 新建相关KDXCZ
    const tmpKDXCZs = tmpKDXs.map(item => ({
      KDXId: item.id,
      status: DBTables.KDXStatus.FH,
      UserId: user.id,
    }));
    await DBTables.KDXCZ.bulkCreate(tmpKDXCZs, {
      transaction,
    });
    // end 新建相关KDXCZ

    // 改变KDX中WL/DP的状态位FH, 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(KDXEWMs, DBTables.WYWLStatus.FH, user, transaction);
    await ppUtils.changeWYDPsInKDXsStatus(KDXEWMs, DBTables.WYDPStatus.FH, user, transaction);
    // end 改变KDX中WL/DP的状态位FH, 并添加WYWLCZ/WYDPCZ
  }
}
