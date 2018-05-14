import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class JieChuGuanLianKuaiDi extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs } = req.body;

    // 检查KDXEWM是否是KDX
    const notKDXRecords = EWMs.filter(item => item.type !== DBTables.EWMType.KDX);
    if (notKDXRecords.length > 0) {
      throw new Error(`${notKDXRecords}不是快递箱二维码!`);
    }
    // end 检查KDXEWM是否是KDX
  }

  static async mainProcess(req, res, next, user, transaction) {
    // EWM: [{ type: 'KDX', uuid: '123456'}]
    const { EWMs } = req.body;
    const EWMstrings = EWMs.map(item => JSON.stringify(item));

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWMs都存在
    const tmpKDXs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'KDX',
      EWMs,
      transaction,
    );
    // end 检查EWMs都存在

    // 检查EWMs是属于FH状态
    const notZXRecords = await tmpKDXs.filter(item => item.status !== DBTables.KDXStatus.FH);
    if (notZXRecords.length > 0) {
      throw new Error(`${notZXRecords}不属于${DBTables.KDXStatus.FH}, 不能解除关联快递!`);
    }
    // end 检查EWMs是属于FH状态

    // 不用检查ZHY是否有权限解除这个KDX的关联, 谁都可以解除

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 解除EWMs绑上KDDId
    for (const item of tmpKDXs) {
      await item.update(
        {
          KDDId: null,
        },
        {
          transaction,
        },
      );
    }
    // end 解除EWMs绑上KDDId

    // 转为状态ZX, 新建相关KDXCZ
    const ids = tmpKDXs.map(item => item.id);
    const tmpGYSId = await user.getGYSId(transaction);

    await ppUtils.changeKDXsStatus({
      ids,
      status: DBTables.KDXStatus.ZX,
      user,
      GYSId: tmpGYSId,
      transaction,
    });
    // end 转为状态ZX, 新建相关KDXCZ

    // 改变KDX中WL/DP的状态为ZX(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(
      EWMs,
      DBTables.WYWLStatus.ZX,
      user,
      transaction,
    );
    await ppUtils.changeWYDPsInKDXsStatus(
      EWMs,
      DBTables.WYDPStatus.ZX,
      user,
      transaction,
    );
    // end 改变KDX中WL/DP的状态为ZX(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
  }
}
