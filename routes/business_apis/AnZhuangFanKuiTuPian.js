import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class AnZhuangFanKuiTuPian extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.GTBA, DBTables.JS.AZG];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWPayloads = [{id: 1, imageUrl: 'XX'}]
    const {
      DDId, GTId, EWMType, QJTs, HWPayloads,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    if (EWMType === DBTables.EWMType.WL) {
      await processWYWLs(DDId, GTId, QJTs, HWPayloads, user, transaction);
    } else if (EWMType === DBTables.EWMType.DP) {
      await processWYDPs(DDId, GTId, QJTs, HWPayloads, user, transaction);
    } else {
      throw new Error('必须都是物料或灯片!');
    }
  }
}

async function processWYWLs(DDId, GTId, WYWLPayloads, user, transaction) {
  // 检查是否是操作者在本DD_GT的所有任务
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

  const targetWYWLs = await DBTables.WYWL.findAll({
    include: [
      {
        model: DBTables.DD_GT_WL,
        as: 'DD_GT_WL',
        where: tmpWhere,
      },
    ],
    transaction,
  });

  // 检查是否已有过FK
  const hasFKRecords = targetWYWLs.filter(item => item.status === DBTables.WYWLStatus.FKT);
  if (hasFKRecords.length !== 0) {
    throw new Error('已有反馈图, 不能再上传反馈图了!');
  }
  // end 检查是否已有过FK

  const targetWYWLIds = targetWYWLs.map(item => item.id);
  const tmpWYWLIds = WYWLPayloads.map(item => item.id);
  const isSame = _.isEqual(targetWYWLIds.sort(), tmpWYWLIds.sort());
  if (!isSame) {
    throw new Error('反馈图必须包含所有在本订单在本柜台的物料安装任务!');
  }
  // end 检查是否是操作者在本DD_GT的所有任务

  // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 新建WLQJFKT
  // end 新建WLQJFKT

  // HWEWMs状态转为FKT, 新建相关WYWLCZ/WYDPCZ
  for (let i = 0; i < WYWLPayloads.length; i++) {
    await ppUtils.changeWYWLsStatus(
      [WYWLPayloads[i].id],
      DBTables.WYWLStatus.FKT,
      user,
      transaction,
      null,
      WYWLPayloads[i].imageUrl,
    );
  }
  // end HWEWMs状态转为FKT, 新建相关WYWLCZ/WYDPCZ
}

async function processWYDPs(DDId, GTId, WYDPPayloads, user, transaction) {
  // 检查是否是操作者在本DD_GT的所有任务
  let tmpWhere;
  if (user.JS === DBTables.JS.AZG) {
    tmpWhere = {
      DDId,
      AZGUserId: user.id,
    };
  } else if (user.JS === DBTables.JS.GTBA) {
    tmpWhere = {
      DDId,
      AZGSId: null,
    };
  } else {
    throw new Error('没有权限!');
  }

  const targetWYDPs = await DBTables.WYDP.findAll({
    include: [
      {
        model: DBTables.DD_DW_DP,
        as: 'DD_DW_DP',
        where: tmpWhere,
        include: [
          {
            model: DBTables.DW,
            as: 'DW',
            where: {
              GTId,
            },
          },
        ],
      },
    ],
    transaction,
  });

  // 检查是否已有过FK
  const hasFKRecords = targetWYDPs.filter(item => item.AZFK !== null);
  if (hasFKRecords.length !== 0) {
    throw new Error('已有安装反馈, 不能再反馈了!');
  }
  // end 检查是否已有过FK

  const targetWYDPIds = targetWYDPs.map(item => item.id);
  const tmpWYDPIds = WYDPPayloads.map(item => item.id);
  const isSame = _.isEqual(targetWYDPIds.sort(), tmpWYDPIds.sort());
  if (!isSame) {
    throw new Error('反馈必须包含所有在本订单在本柜台的灯片安装任务!');
  }
  // end 检查是否是操作者在本DD_GT的所有任务

  // 检查HWEWMs不是属于SH状态的只可以填非安装成功类型的AZFKType
  const tmpUnReceivedWYDPs = tmpWYDPIds.filter(item => item.status !== DBTables.WYDPStatus.SH);
  const tmpUnReceivedWYDPIds = tmpUnReceivedWYDPs.map(item => item.id);

  const tmpFailedPayloads = WYDPPayloads.filter(item => tmpUnReceivedWYDPIds.includes(item.id) && item.AZFK === DBTables.AZFKType.AZCG);
  if (tmpFailedPayloads.length > 0) {
    throw new Error(`${tmpFailedPayloads}不是${DBTables.WYDPStatus.SH}状态, 不能反馈为:${DBTables.AZFKType.AZCG}`);
  }
  // end 检查HWEWMs不是属于SH状态的只可以填非安装成功类型的AZFKType

  // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 新建DPQJFKT
  // end 新建DPQJFKT

  // HWEWMs状态转为FK, 同时填写AZFK, 新建相关WYWLCZ/WYDPCZ
  for (let i = 0; i < WYDPPayloads.length; i++) {
    await ppUtils.changeWYDPsStatus(
      [WYDPPayloads[i].id],
      DBTables.WYDPStatus.FK,
      user,
      transaction,
      WYDPPayloads[i].AZFK,
    );
  }
  // end HWEWMs状态转为FK, 同时填写AZFK, 新建相关WYWLCZ/WYDPCZ
}
