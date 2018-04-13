import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ZhuangXiang extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      DDId, GTId, HWEWMs, KDXEWM,
    } = req.body;

    // 检查KDXEWM是否是KDX
    if (KDXEWM.type !== DBTables.EWMType.KDX) {
      throw new Error('快递箱二维码不正确!');
    }
    // end 检查KDXEWM是否是KDX

    // 检查HWEWMs是否都是WL/DP
    const validateFailedEWMs = HWEWMs.filter(item => item.type !== DBTables.EWMType.WL && item.type !== DBTables.EWMType.DP);
    if (validateFailedEWMs.length > 0) {
      throw new Error(`${validateFailedEWMs}不属于物料或灯片, 不能装箱!`);
    }
    // end 检查HWEWMs是否都是WL/DP
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWEWMs: [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    // KDXEWM: { type: 'KDX', uuid: '123456'}
    const {
      DDId, GTId, HWEWMs, KDXEWM,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    const tmpWYWLEWMs = HWEWMs.filter(item => item.type === DBTables.EWMType.WL);
    const tmpWYDPEWMs = HWEWMs.filter(item => item.type === DBTables.EWMType.DP);

    // 检查tmpWYWLEWMs是否都发往DDId_GTId
    await checkWLEWMsForSameDDGT(DDId, GTId, tmpWYWLEWMs, transaction);
    // end 检查tmpWYWLEWMs是否都发往DDId_GTId

    // 检查tmpWYDPEWMs是否都发往DDId_GTId
    await checkDPEWMsForSameDDGT(DDId, GTId, tmpWYDPEWMs, transaction);
    // end 检查tmpWYDPEWMs是否都发往DDId_GTId

    // 检查tmpWYWLEWMs的发货GYS是否唯一
    const tmpWLGYSId = await checkWLEWMsFromSameGYSAndGetIt(DDId, GTId, tmpWYWLEWMs, transaction);
    // end 检查tmpWYWLEWMs的发货GYS是否唯一

    // 检查tmpDPWLEWMs的发货GYS是否唯一
    const tmpDPGYSId = await checkDPEWMsFromSameGYSAndGetIt(DDId, GTId, tmpWYDPEWMs, transaction);
    // end 检查tmpDPWLEWMs的发货GYS是否唯一

    if (tmpWLGYSId && tmpDPGYSId) {
      // tmpWLGYSId, tmpDPGYSId都存在是否一致且属于操作者同一GYS
      if (tmpWLGYSId !== tmpDPGYSId) {
        throw new Error('物料和灯片必须是同一个发货供应商!');
      } else {
        await user.checkGYSId(tmpWLGYSId);
      }
    } else if (tmpWLGYSId || tmpDPGYSId) {
      // tmpWLGYSId, tmpDPGYSId存在一个且属于操作者同一GYS
      const tmpGYSId = tmpWLGYSId || tmpDPGYSId;
      await user.checkGYSId(tmpGYSId, transaction);
    } else {
      // tmpWLGYSId, tmpDPGYSId都不存在
      throw new Error('必须要有发货供应商!');
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建相关记录
    // 如需新建KDX则新建, 并新建相关KDXCZ
    const KDXEWMString = JSON.stringify(KDXEWM);
    let tmpKDX = await DBTables.KDX.findOne({
      where: {
        EWM: KDXEWMString,
      },
      transaction,
    });

    if (tmpKDX) {
      // KDX已存在
      if (tmpKDX.GTId !== GTId) {
        // 检查已有KDX所属GT
        throw new Error(`快递箱:${tmpKDX}不属于这个柜台!`);
      }

      if (tmpKDX.status !== DBTables.KDXStatus.ZX) {
        // 检查已有KDX当前状态
        throw new Error(`快递箱:${tmpKDX}状态为:${tmpKDX.status}, 不能装箱!`);
      }
    } else {
      // KDX不存在
      tmpKDX = await DBTables.KDX.create(
        {
          EWM: KDXEWMString,
          GTId,
          status: DBTables.KDXStatus.ZX,
        },
        {
          transaction,
        },
      );
    }

    // 新建相关KDXCZ
    await DBTables.KDXCZ.create(
      {
        KDXId: tmpKDX.id,
        status: DBTables.KDXStatus.ZX,
        UserId: user.id,
      },
      { transaction },
    );
    // end 新建相关KDXCZ

    // end 如需新建KDX则新建, 并新建相关KDXCZ

    for (let i = 0; i < tmpWYWLEWMs.length; i++) {
      // WL
      const tmpDDGTWL = await DBTables.DD_GT_WL.findOne({
        where: {
          DDId,
          GTId,
          WLId: tmpWYWLEWMs[i].typeId,
        },
        transaction,
      });
      if (tmpDDGTWL.ZXNumber === tmpDDGTWL.number) {
        // 如果预订数额已满则报错
        throw new Error(`${tmpWYWLEWMs[i]}数额已满!`);
      }
      await zhuangXiangWLEWM(
        tmpDDGTWL,
        tmpWYWLEWMs[i],
        tmpWLGYSId,
        tmpKDX.id,
        user,
        transaction,
      );
      await DBTables.sequelize.query(
        'UPDATE DD_GT_WL SET ZXNumber = IFNULL(ZXNumber, 0) + 1 WHERE id = :id',
        {
          transaction,
          replacements: { id: tmpDDGTWL.id },
          raw: true,
          type: 'UPDATE',
        },
      );
    }

    for (let i = 0; i < tmpWYDPEWMs.length; i++) {
      // DP
      const tmpDDDWDP = await DBTables.DD_DW_DP.findOne({
        where: {
          DDId,
          DPId: tmpWYDPEWMs[i].typeId,
          ZXNumber: null,
        },
        include: [
          {
            model: DBTables.DW,
            as: 'DW',
            where: {
              GTId,
            },
          },
        ],
        transaction,
      });
      if (!tmpDDDWDP) {
        // 如果预订数额已满则报错
        throw new Error(`${tmpWYDPEWMs[i]}数额已满!`);
      }
      await zhuangXiangDPEWM(
        tmpDDDWDP,
        tmpWYDPEWMs[i],
        tmpDPGYSId,
        tmpKDX.id,
        user,
        transaction,
      );
      await DBTables.sequelize.query('UPDATE DD_DW_DP SET ZXNumber = 1 WHERE ID = :id', {
        transaction,
        replacements: { id: tmpDDDWDP.id },
        raw: true,
        type: 'UPDATE',
      });
    }

    // end 新建相关记录
  }
}

async function checkWLEWMsForSameDDGT(DDId, GTId, EWMs, transaction) {
  const tmpWLIds = EWMs.map(item => item.typeId);

  const tmpTargetWLs = await DBTables.DD_GT_WL.findAll({
    where: {
      DDId,
      GTId,
    },
    transaction,
  });

  const tmpTargetWLIds = tmpTargetWLs.map(item => item.WLId);

  const diffWLIds = _.difference(tmpWLIds, tmpTargetWLIds);
  if (diffWLIds.length > 0) {
    throw new Error(`${diffWLIds}不属于目标柜台!`);
  }
}

async function checkDPEWMsForSameDDGT(DDId, GTId, EWMs, transaction) {
  const tmpDPIds = EWMs.map(item => item.typeId);

  const tmpTargetDPs = await DBTables.DD_DW_DP.findAll({
    where: {
      DDId,
    },
    include: [
      {
        model: DBTables.DW,
        as: 'DW',
        where: {
          GTId,
        },
      },
    ],
    transaction,
  });
  const tmpTargetDPIds = tmpTargetDPs.map(item => item.DPId);

  const diffDPIds = _.difference(tmpDPIds, tmpTargetDPIds);
  if (diffDPIds.length > 0) {
    throw new Error(`${diffDPIds}不属于目标柜台!`);
  }
}

async function checkWLEWMsFromSameGYSAndGetIt(DDId, GTId, EWMs, transaction) {
  const tmpWLIds = EWMs.map(item => item.typeId);

  const tmpDDGTWLs = await DBTables.DD_GT_WL.findAll({
    where: {
      DDId,
      GTId,
      WLId: {
        $in: tmpWLIds,
      },
    },
    transaction,
  });

  const tmpDDGTWLGYSIds = tmpDDGTWLs.map(item => item.GYSId);
  const tmpUniqueDDGTWLGYSIds = [...new Set(tmpDDGTWLGYSIds)];

  if (tmpUniqueDDGTWLGYSIds.length > 1) {
    throw new Error('物料必须属于同一个发货供应商!');
  }

  if (tmpUniqueDDGTWLGYSIds.length === 1) {
    return tmpDDGTWLGYSIds[0];
  }
  return null;
}

async function checkDPEWMsFromSameGYSAndGetIt(DDId, GTId, EWMs, transaction) {
  const tmpDPIds = EWMs.map(item => item.typeId);

  const tmpDDDWDPs = await DBTables.DD_DW_DP.findAll({
    where: {
      DDId,
      DPId: {
        $in: tmpDPIds,
      },
    },
    include: [
      {
        model: DBTables.DW,
        as: 'DW',
        where: {
          GTId,
        },
      },
    ],
    transaction,
  });

  const tmpDDDWDPGYSIds = tmpDDDWDPs.map(item => item.GYSId);
  const tmpUniqueDDDWDPGYSIds = [...new Set(tmpDDDWDPGYSIds)];

  if (tmpUniqueDDDWDPGYSIds.length > 1) {
    throw new Error('灯片必须属于同一个发货供应商!');
  }

  if (tmpUniqueDDDWDPGYSIds.length === 1) {
    return tmpUniqueDDDWDPGYSIds[0];
  }
  return null;
}

async function zhuangXiangDPEWM(DDDWDP, WYDPEWM, GYSId, KDXId, user, transaction) {
  const WYDPEWMString = JSON.stringify(WYDPEWM);
  let tmpWYDP = await DBTables.WYDP.findOne({
    where: {
      EWM: WYDPEWMString,
    },
    transaction,
  });

  if (tmpWYDP) {
    // WYDP存在
    if (tmpWYDP.status !== DBTables.WYDPStatus.RK) {
      // 如果不属于RK状态报错
      throw new Error(`${WYDPEWM}状态为:${tmpWYDP.status}, 不可装箱!`);
    }

    if (tmpWYDP.GYSId !== GYSId) {
      // 发货供应商不正确
      throw new Error(`${WYDPEWM}发货供应商为:${tmpWYDP.GYSId}, 不可装箱!`);
    }

    // 设置状态, 绑定KDXId
    await tmpWYDP.update(
      {
        status: DBTables.WYDPStatus.ZX,
        DDGTWLId: DDDWDP.id,
        KDXId,
      },
      {
        transaction,
      },
    );
  } else {
    // WYDP不存在就新建
    tmpWYDP = await DBTables.WYDP.create(
      {
        EWM: WYDPEWMString,
        status: DBTables.WYWLStatus.ZX,
        DPId: WYDPEWM.typeId,
        GYSId,
        DDDWDPId: DDDWDP.id,
        KDXId,
      },
      {
        transaction,
      },
    );
  }

  // 新建相关WYDPCZ
  await DBTables.WYDPCZ.create(
    {
      WYDPId: tmpWYDP.id,
      status: DBTables.WYDPStatus.ZX,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYDPCZ
}

async function zhuangXiangWLEWM(DDGTWL, WYWLEWM, GYSId, KDXId, user, transaction) {
  const WYWLEWMString = JSON.stringify(WYWLEWM);
  let tmpWYWL = await DBTables.WYWL.findOne({
    where: {
      EWM: WYWLEWMString,
    },
    transaction,
  });

  if (tmpWYWL) {
    // WYWL存在
    if (tmpWYWL.status !== DBTables.WYWLStatus.RK) {
      // 如果不属于RK状态报错
      throw new Error(`${WYWLEWM}状态为:${tmpWYWL.status}, 不可装箱!`);
    }

    if (tmpWYWL.GYSId !== GYSId) {
      // 发货供应商不正确
      throw new Error(`${WYWLEWM}发货供应商为:${tmpWYWL.GYSId}, 不可装箱!`);
    }

    // 设置状态, 绑定KDXId
    await tmpWYWL.update(
      {
        status: DBTables.WYWLStatus.ZX,
        DDGTWLId: DDGTWL.id,
        KDXId,
      },
      {
        transaction,
      },
    );
  } else {
    // WYWL不存在就新建
    tmpWYWL = await DBTables.WYWL.create(
      {
        EWM: WYWLEWMString,
        status: DBTables.WYWLStatus.ZX,
        WLId: WYWLEWM.typeId,
        GYSId,
        DDGTWLId: DDGTWL.id,
        KDXId,
      },
      {
        transaction,
      },
    );
  }

  // 新建相关WYWLCZ
  await DBTables.WYWLCZ.create(
    {
      WYWLId: tmpWYWL.id,
      status: DBTables.WYWLStatus.ZX,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYWLCZ
}
