import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ChuXiang extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWEWMs: [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    const { HWEWMs } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    for (let i = 0; i < HWEWMs.length; i++) {
      if (HWEWMs[i].type === DBTables.EWMType.WL) {
        // WL
        await chuXiangWYWL(HWEWMs[i], user, transaction);
      } else {
        // DP
        await chuXiangWYDP(HWEWMs[i], user, transaction);
      }
    }
  }
}

async function chuXiangWYWL(WYWLEWM, user, transaction) {
  // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 检查HWEWMs存在且是属于ZX状态
  const tmpWYWL = await DBTables.WYWL.findOne({
    where: {
      EWM: JSON.stringify(WYWLEWM),
    },
    transaction,
  });

  if (!tmpWYWL) {
    throw new Error(`没找到对应唯一物料:${WYWLEWM}`);
  }

  if (tmpWYWL.status !== DBTables.WYWLStatus.ZX) {
    throw new Error(`${WYWLEWM}状态是:${tmpWYWL.status}, 不能出箱!`);
  }
  // end 检查HWEWMs存在且是属于ZX状态

  // 检查ZHY是否有权限出箱这个货物
  await user.checkGYSId(tmpWYWL.GYSId, transaction);
  // end 检查ZHY是否有权限出箱这个货物

  // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 新建相关记录

  // 减少DD_GT_WL ZXNumber
  await DBTables.sequelize.query('UPDATE DD_GT_WL SET ZXNumber = ZXNumber - 1 WHERE id = :id', {
    transaction,
    replacements: { id: tmpWYWL.DDGTWLId },
    raw: true,
    type: 'UPDATE',
  });
  // end 减少DD_GT_WL ZXNumber

  // HWEWMs清除绑上KDXID, DD_GT_WL, 转为RK状态
  await tmpWYWL.update(
    {
      KDXId: null,
      DDGTWLId: null,
      status: DBTables.WYWLStatus.RK,
    },
    {
      transaction,
    },
  );
  // end HWEWMs清除绑上KDXID, DD_GT_WL, 转为RK状态

  // 新建相关WYWLCZ
  await DBTables.WYWLCZ.create(
    {
      WYWLId: tmpWYWL.id,
      status: DBTables.WYWLStatus.RK,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYWLCZ

  // end 新建相关记录
}

async function chuXiangWYDP(WYDPEWM, user, transaction) {
  // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 检查HWEWMs存在且是属于ZX状态
  const tmpWYDP = await DBTables.WYDP.findOne({
    where: {
      EWM: JSON.stringify(WYDPEWM),
    },
    transaction,
  });

  if (!tmpWYDP) {
    throw new Error(`没找到对应唯一灯片:${WYDPEWM}`);
  }

  if (tmpWYDP.status !== DBTables.WYDPStatus.ZX) {
    throw new Error(`灯片:${WYDPEWM}状态是:${tmpWYDP.status}, 不能出箱!`);
  }
  // end 检查HWEWMs存在且是属于ZX状态

  // 检查ZHY是否有权限出箱这个货物
  await user.checkGYSId(tmpWYDP.GYSId, transaction);
  // end 检查ZHY是否有权限出箱这个货物

  // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

  // 新建相关记录

  // 减少DD_DW_DP ZXNumber
  await DBTables.sequelize.query('UPDATE DD_DW_DP SET ZXNumber = 0 WHERE id = :id', {
    transaction,
    replacements: { id: tmpWYDP.DDDWDPId },
    raw: true,
    type: 'UPDATE',
  });
  // end 减少DD_DW_DP ZXNumber

  // HWEWMs清除绑上KDXID, DD_DW_DP, 转为RK状态
  await tmpWYDP.update(
    {
      KDXId: null,
      DDDWDPId: null,
      status: DBTables.WYDPStatus.RK,
    },
    {
      transaction,
    },
  );
  // end HWEWMs清除绑上KDXID, DD_DW_DP, 转为RK状态

  // 新建相关WYDPCZ
  await DBTables.WYDPCZ.create(
    {
      WYDPId: tmpWYDP.id,
      status: DBTables.WYDPStatus.RK,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYDPCZ

  // end 新建相关记录
}
