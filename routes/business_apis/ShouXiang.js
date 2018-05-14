import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class ShouXiang extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA];
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
    const notFHRecords = tmpKDXs.filter(item => item.status !== DBTables.KDXStatus.FH);
    if (notFHRecords.length > 0) {
      throw new Error(`${notFHRecords}不在状态: ${DBTables.KDXStatus.FH}, 不能收箱!`);
    }
    // end 检查EWMs是属于FH状态

    // 检查KDX所属同一个GT, 且是和这个操作员一致
    const tmpGTs = tmpKDXs.map(item => item.GTId);
    const tmpUniqueGTs = [...new Set(tmpGTs)];
    if (tmpUniqueGTs.length !== 1) {
      throw new Error(`${tmpKDXs}不属于同一个柜台!`);
    }

    const tmpGTId = tmpUniqueGTs[0];
    await user.checkGTId(tmpGTId, transaction);
    // end 检查KDX所属同一个GT, 且是和这个操作员一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 转为状态SX, 新建相关KDXCZ
    const ids = tmpKDXs.map(item => item.id);
    await ppUtils.changeKDXsStatus({
      ids,
      status: DBTables.KDXStatus.SX,
      user,
      GYSId: null,
      transaction,
    });
    // end 转为状态SX, 新建相关KDXCZ

    // 改变KDX中WL/DP的状态为FH(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(
      EWMs,
      DBTables.WYWLStatus.SX,
      user,
      transaction,
    );
    await ppUtils.changeWYDPsInKDXsStatus(
      EWMs,
      DBTables.WYDPStatus.SX,
      user,
      transaction,
    );
    // end 改变KDX中WL/DP的状态为FH(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
  }
}
