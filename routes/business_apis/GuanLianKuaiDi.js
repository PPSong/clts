import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class GuanLianKuaiDi extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const { EWMs, KDDCode } = req.body;

    // 检查KDXEWM是否是KDX
    const notKDXRecords = EWMs.filter(item => item.type !== DBTables.EWMType.KDX);
    if (notKDXRecords.length > 0) {
      throw new Error(`${notKDXRecords}不是快递箱二维码!`);
    }
    // end 检查KDXEWM是否是KDX
  }

  static async mainProcess(req, res, next, user, transaction) {
    // EWM: [{ type: 'KDX', uuid: '123456'}]
    const { EWMs, KDDCode } = req.body;
    const EWMStrings = EWMs.map(item => JSON.stringify(item));

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查EWMs都存在
    const tmpKDXs = await ppUtils.checkEWMsExistanceAndGetRecords(
      'KDX',
      EWMs,
      transaction,
    );
    // end 检查EWMs都存在

    // 检查EWMs是属于ZX状态
    const notZXRecords = await tmpKDXs.filter(item => item.status !== DBTables.KDXStatus.ZX);
    if (notZXRecords.length > 0) {
      throw new Error(`${notZXRecords}不属于${DBTables.KDXStatus.ZX}, 不能关联快递!`);
    }
    // end 检查EWMs是属于ZX状态

    // 检查EWMs属于同一个GT
    const tmpGTIds = tmpKDXs.map(item => item.GTId);
    const tmpUniqueGTIds = [...new Set(tmpGTIds)];
    if (tmpUniqueGTIds.length !== 1) {
      throw new Error(`${tmpKDXs}不属于同一个柜台!`);
    }
    const tmpGTId = tmpUniqueGTIds[0];
    // end 检查EWMs属于同一个GT

    // 检查KDD
    let tmpKDD = await DBTables.KDD.findOne({
      where: {
        code: KDDCode,
      },
      transaction,
    });

    if (tmpKDD) {
      // 如果存在则GTId要符合条件
      if (tmpKDD.GTId !== tmpGTId) {
        throw new Error(`${tmpKDD}不属于柜台id:${tmpGTId}!`);
      }
      // end 如果存在则GTId要符合条件
    } else {
      tmpKDD = await DBTables.KDD.create({
        code: KDDCode,
        GTId: tmpGTId,
      });
    }
    // end 检查KDD

    // 不用检查ZHY是否有权限快递这个KDX, 谁都可以快递

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // EWMs绑上KDDId, 转为状态FH, 新建相关KDXC
    const ids = tmpKDXs.map(item => item.id);
    const tmpGYSId = await user.getGYSId(transaction);
    await ppUtils.changeKDXsStatus({
      ids,
      status: DBTables.KDXStatus.FH,
      user,
      GYSId: tmpGYSId,
      transaction,
      KDDId: tmpKDD.id,
    });
    // end EWMs绑上KDDId, 转为状态FH, 新建相关KDXCZ

    // 改变KDX中WL/DP的状态为FH(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
    await ppUtils.changeWYWLsInKDXsStatus(
      EWMs,
      DBTables.WYWLStatus.FH,
      user,
      transaction,
    );
    await ppUtils.changeWYDPsInKDXsStatus(
      EWMs,
      DBTables.WYDPStatus.FH,
      user,
      transaction,
    );
    // end 改变KDX中WL/DP的状态为FH(对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败), 并添加WYWLCZ/WYDPCZ
  }
}
