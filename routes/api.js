import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';
import _ from 'lodash';

/* eslint-disable */
import * as tables from '../tables';
import * as businessApis from './business_apis';
/* eslint-enable */
import {
  sequelize,
  JS,
  EWMType,
  DDStatus,
  User,
  PP,
  GT,
  GYS,
  AZGS,
  DP,
  DW,
  WL,
  FG,
  Tester,
  FG_Tester,
  EJZH,
  EJZHXGT,
  YJZH,
  YJZHXGT,
  DD,
  DD_GT_WL,
  DD_DW_DP,
  WYWL,
  WYDP,
  WYWLStatus,
  WYDPStatus,
  WYWLCZ,
  WYDPCZ,
  KDX,
  KDXStatus,
  KDXCZ,
  KDD,
} from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj);
};

const router = express.Router();

// 新建PPJL [ADMIN]
router.post('/createPPJL', businessApis.CreatePPJL.getApi());
// 新建KFJL [PPJL]
router.post('/createKFJL', businessApis.CreateKFJL.getApi());
// 新建GT, GTBA [KFJL]
router.post('/createGTWithGTBA', businessApis.CreateGTWithGTBA.getApi());
// 编辑GT图 [KFJL]
router.post('/setGTImage', businessApis.SetGTImage.getApi());
// 创建GZ [KFJL]
router.post('/createGZ', businessApis.CreateGZ.getApi());
// 配置GZ负责GT [KFJL]
router.post('/setGZGTs', businessApis.SetGZGTs.getApi());
// 新建GYS, GLY [KFJL]
router.post('/createGYSWithGLY', businessApis.CreateGYSWithGLY.getApi());
// 新建AZGS, GLY [KFJL]
router.post('/createAZGSWithGLY', businessApis.CreateAZGSWithGLY.getApi());
// 配置DP到DWs [KFJL]
router.post('/setDPDWs', businessApis.SetDPDWs.getApi());
// 创建FG, Tester, FGTester [KFJL]
router.post('/createFGAndTesterAndFGTester', businessApis.CreateFGAndTesterAndFGTester.getApi());
// 创建EJZH [KFJL]
router.post('/createEJZH', businessApis.CreateEJZH.getApi());
// 编辑EJZH [KFJL]
router.post('/editEJZH', businessApis.EditEJZH.getApi());
// 创建YJZH [KFJL]
router.post('/createYJZH', businessApis.CreateYJZH.getApi());
// 编辑YJZH [KFJL]
router.post('/editYJZH', businessApis.EditYJZH.getApi());
// 配置YJZH_GTs [KFJL]
router.post('/setYJZHGTs', businessApis.SetYJZHGTs.getApi());
// 生成DD [KFJL]
router.post('/createDD', businessApis.CreateDD.getApi());
// 重新生成DD [KFJL]
router.post('/reCreateDD', businessApis.ReCreateDD.getApi());
// 设置DD_GTFXs [KFJL]
router.post('/setDDGTFXs', businessApis.SetDDGTFXs.getApi());
// 批量设置DD_GT_WL的AZGS [PPJL]
router.post('/setDDGTWLs0AZGS', businessApis.SetDDGTWLs0AZGS.getApi());
// 批量设置DD_DW_DP的AZGS [PPJL]
router.post('/setDDDWDPs0AZGS', businessApis.SetDDDWDPs0AZGS.getApi());
// 审批通过DD [PPJL]
router.post('/approveDD', businessApis.ApproveDD.getApi());
// 批量设置DD_GT_WL的发货GYS [GYSGLY]
router.post('/setDDGTWLs0GYS', businessApis.SetDDGTWLs0GYS.getApi());
// 批量设置DD_DW_DP的发货GYS [GYSGLY]
router.post('/setDDDWDPs0GYS', businessApis.SetDDDWDPs0GYS.getApi());
// 批量设置DD_GT_WL的AZG [AZGSGLY]
router.post('/setDDGTWLs0AZG', businessApis.SetDDGTWLs0AZG.getApi());
// 批量设置DD_DW_DP的AZG [AZGSGLY]
router.post('/setDDDWDPs0AZG', businessApis.SetDDDWDPs0AZG.getApi());
// 批量入库 [ZHY]
router.post('/piLiangRuKu', businessApis.PiLiangRuKu.getApi());
// 装箱 [ZHY]
router.post('/zhuangXiang', businessApis.ZhuangXiang.getApi());
// 出箱 [ZHY]
router.post('/chuXiang', businessApis.ChuXiang.getApi());
// 关联快递 [ZHY]
router.post('/guanLianKuaiDi', businessApis.GuanLianKuaiDi.getApi());
// 解除关联快递 [ZHY]
router.post('/jieChuGuanLianKuaiDi', businessApis.JieChuGuanLianKuaiDi.getApi());


// GTBA 收箱
router.post('/shouXiang', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GTBA].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { KDXEWMs } = req.body;

    // 检查操作记录权限

    const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));

    const tmpKDXs = await KDX.findAll({
      where: {
        EWM: {
          $in: KDXEWMStrings,
        },
      },
      transaction,
    });

    // 检查KDXEWMs都是存在的
    const tmpKDXEWMStrings = tmpKDXs.map(item => item.EWM);
    const diffEWMs = _.difference(KDXEWMStrings, tmpKDXEWMStrings);
    if (diffEWMs.length > 0) {
      throw new Error(`${diffEWMs}不存在!`);
    }
    // end 检查KDXEWMs都是存在的

    // 检查KDXEWMs是属于FH状态
    const tmpFailedStatusKDXs = tmpKDXs.filter(item => item.status !== KDXStatus.FH);
    if (tmpFailedStatusKDXs.length > 0) {
      throw new Error(`${tmpFailedStatusKDXs}状态不在${KDXStatus.FH}, 无法收箱!`);
    }
    // end 检查KDXEWMs是属于FH状态

    // 检查KDX所属GT是和这个操作员一致
    for (let i = 0; i < tmpKDXs.length; i++) {
      await user.checkGTId(tmpKDXs[i].GTId, transaction);
    }
    // end 检查KDX所属GT是和这个操作员一致

    // end 检查操作记录权限

    // KDX状态转为SX
    await KDX.update(
      {
        status: KDXStatus.SX,
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
      status: KDXStatus.SX,
      UserId: user.id,
    }));
    await KDXCZ.bulkCreate(tmpKDXCZs, {
      transaction,
    });
    // end 新建相关KDXCZ

    const tmpWYWLSql = `
    SELECT
      a.id id
    FROM
      WYWL a
    JOIN
      KDX b
    ON
      a.KDXId = b.id
    AND
      b.EWM in (:KDXEWMs);
    `;
    const tmpWYWLCZSqlR = await sequelize.query(tmpWYWLSql, {
      transaction,
      replacements: { KDXEWMs: tmpKDXEWMStrings },
    });
    const tmpWYWLIds = tmpWYWLCZSqlR[0];

    // 更改相关WYWL状态为ZX
    await WYWL.update(
      {
        status: WYWLStatus.SX,
      },
      {
        where: {
          id: {
            $in: tmpWYWLIds.map(item => item.id),
          },
        },
        transaction,
      },
    );
    // end 更改相关WYWL状态为ZX

    // 新建相关WYWLCZ
    const tmpWYWLCZs = tmpWYWLIds.map(item => ({
      WYWLId: item.id,
      status: WYWLStatus.SX,
      UserId: user.id,
    }));
    await WYWLCZ.bulkCreate(tmpWYWLCZs, {
      transaction,
    });
    // end 新建相关WYWLCZ

    const tmpWYDPSql = `
    SELECT
    a.id
    FROM
    WYDP a
    JOIN
    KDX b
    ON
    a.KDXId = b.id
    AND
    b.EWM in (:KDXEWMs);
    `;
    const tmpWYDPCZSqlR = await sequelize.query(tmpWYDPSql, {
      transaction,
      replacements: { KDXEWMs: tmpKDXEWMStrings },
    });
    const tmpWYDPIds = tmpWYDPCZSqlR[0];

    // 更改相关WYDP状态为ZX
    await WYDP.update(
      {
        status: WYDPStatus.SX,
      },
      {
        where: {
          id: {
            $in: tmpWYDPIds.map(item => item.id),
          },
        },
        transaction,
      },
    );
    // end 更改相关WYDP状态为ZX

    // 新建相关WYDPCZ
    const tmpWYDPCZs = tmpWYDPIds.map(item => ({
      WYDPId: item.id,
      status: WYDPStatus.SX,
      UserId: user.id,
    }));
    await WYDPCZ.bulkCreate(tmpWYDPCZs, {
      transaction,
    });
    // end 新建相关WYDPCZ

    // end 新建相关记录

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

async function shouHuoWYWL(WYWLEWM, user, transaction) {
  const WYWLEWMString = JSON.stringify(WYWLEWM);
  const tmpWYWL = await WYWL.findOne({
    where: {
      EWM: WYWLEWMString,
    },
    transaction,
  });
  if (!tmpWYWL) {
    throw new Error(`${WYWLEWM}不存在!`);
  }

  // 检查HWEWMs是属于SX状态
  if (tmpWYWL.status !== WYWLStatus.SX) {
    throw new Error(`${WYWLEWM}状态不是${WYWLStatus.SX}状态, 不能收货!`);
  }
  // end 检查HWEWMs是属于SX状态

  // 检查HWEWMs和这个操作员是否一致
  await user.checkWYWLId(tmpWYWL.id, transaction);
  // end 检查HWEWMs和这个操作员是否一致

  // end 检查操作记录权限

  // HWEWMs状态转为SH
  await tmpWYWL.update(
    {
      status: WYWLStatus.SH,
    },
    {
      transaction,
    },
  );
  // end HWEWMs状态转为SH

  // 新建相关WYWLCZ
  await WYWLCZ.create(
    {
      WYWLId: tmpWYWL.id,
      status: WYWLStatus.SH,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYWLCZ

  // end 新建相关记录
}

async function shouHuoWYDP(WYDPEWM, user, transaction) {
  const WYDPEWMString = JSON.stringify(WYDPEWM);
  const tmpWYDP = await WYWL.findOne({
    where: {
      EWM: WYDPEWMString,
    },
    transaction,
  });
  if (!tmpWYDP) {
    throw new Error(`${WYDPEWM}不存在!`);
  }

  // 检查HWEWMs是属于SX状态
  if (tmpWYDP.status !== WYDPStatus.SX) {
    throw new Error(`${WYDPEWM}状态不是${WYDPStatus.SX}状态, 不能收货!`);
  }
  // end 检查HWEWMs是属于SX状态

  // 检查HWEWMs和这个操作员是否一致
  await user.checkWYDPId(tmpWYDP.id, transaction);
  // end 检查HWEWMs和这个操作员是否一致

  // end 检查操作记录权限

  // HWEWMs状态转为SH
  await tmpWYDP.update(
    {
      status: WYDPStatus.SH,
    },
    {
      transaction,
    },
  );
  // end HWEWMs状态转为SH

  // 新建相关WYDPCZ
  await WYDPCZ.create(
    {
      WYDPId: tmpWYDP.id,
      status: WYDPStatus.SH,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WYDPCZ

  // end 新建相关记录
}

// AZG 收货
router.post('/shouHuo', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GTBA, JS.AZG].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { HWEWMs } = req.body;

    for (let i = 0; i < HWEWMs.length; i++) {
      if (HWEWMs[i].type === EWMType.WL) {
        await shouHuoWYWL(HWEWMs[i], user, transaction);
      } else if (HWEWMs[i].type === EWMType.DP) {
        await shouHuoWYDP(HWEWMs[i], user, transaction);
      } else {
        throw new Error(`${HWEWMs[i]}不属于可收货的类型!`);
      }
    }

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// AZG 安装反馈状态
router.post('/anZhuangFanKuiZhuangTai', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GTBA].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { HWEWMs } = req.body;

    // 检查操作记录权限

    // 检查HWEWMs是属于SH状态
    // end 检查HWEWMs是属于SH状态

    // 检查HWEWMs所属AZGUserId是和这个操作员一致
    // end 检查HWEWMs所属AZGUserId是和这个操作员一致

    // end 检查操作记录权限

    // HWEWMs状态转为FK
    // end HWEWMs状态转为FK

    // 新建相关WYWLCZ/WYDPCZ
    // end 新建相关WYWLCZ/WYDPCZ

    // end 新建相关记录

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// AZG 安装WL反馈图片
router.post('/anZhuangWLFanKuiTuPian', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GTBA].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // WYWLs: [{id: 1, imageUrl: 'xxx'}]
    const { GTId, WYWLs, QJTImageUrl } = req.body;

    // 检查操作记录权限

    // 检查这个DD_GT属于这个AZG的任务都在这里了
    // end 检查这个DD_GT属于这个AZG的任务都在这里了

    // WYWLs状态为FK
    // end WYWLs状态为FK

    // end 检查操作记录权限

    // WYWLs状态转为FKT, 加上反馈图
    // end WYWLs状态转为FKT, 加上反馈图

    // 重置WLQJFKT
    // end 重置WLQJFKT

    // 新建相关WYWLCZ/WYDPCZ
    // end 新建相关WYWLCZ/WYDPCZ

    // end 新建相关记录

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// AZG, GTBA, GZ 申请上市物料补货
router.post('/shenQingShangShiWLBuHuo', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.AZG, JS.GTBA, JS.GZ].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      DDId, GTId, WYId, imageUrl, note,
    } = req.body;

    // 检查操作记录权限

    // 检查这个GT是否在操作员权限范围
    // end 检查这个GT是否在操作员权限范围

    // 检查这个WLId是否在这个柜台, 如果是AZG, 是否这个WL的安装工
    // end 检查这个WLId是否在这个柜台, 如果是AZG, 是否这个WL的安装工

    // end 检查操作记录权限

    // 创建WLBH
    // end 创建WLBH

    // 新建相关WLBHCZ
    // end 新建相关WLBHCZ

    // end 新建相关记录

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// AZG, GTBA, GZ 申请日常物料补货
router.post('/shenQingRiChangWLBuHuo', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.AZG, JS.GTBA, JS.GZ].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      GTId, WYId, imageUrl, note,
    } = req.body;

    // 检查操作记录权限

    // 检查这个GT是否在操作员权限范围
    // end 检查这个GT是否在操作员权限范围

    // 检查这个WLId是否在这个柜台, 如果是AZG, 是否这个WL的安装工
    // end 检查这个WLId是否在这个柜台, 如果是AZG, 是否这个WL的安装工

    // end 检查操作记录权限

    // 创建WLBH
    // end 创建WLBH

    // 新建相关WLBHCZ
    // end 新建相关WLBHCZ

    // end 新建相关记录

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 常规RESTFUL API
router.post('/:table', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).create(req.body, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.get('/:table', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).getList(req.query, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.get('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).findOne(req.params.id, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.put('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).edit(req.params.id, req.body, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.delete('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).delete(req.params.id, req.body, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

export default router;
