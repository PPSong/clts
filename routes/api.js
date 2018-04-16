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
// 收箱 [GTBA]
router.post('/shouXiang', businessApis.ShouXiang.getApi());
// 收货 [GTBA, AZG]
router.post('/shouHuo', businessApis.ShouHuo.getApi());
// 安装反馈状态 [GTBA, AZG]
router.post('/anZhuangFanKuiZhuangTai', businessApis.AnZhuangFanKuiZhuangTai.getApi());
// 安装反馈图片 [GTBA, AZG]
router.post('/anZhuangFanKuiTuPian', businessApis.AnZhuangFanKuiTuPian.getApi());
// 申请上市物料补货 [GZ, GTBA, AZG]
router.post('/shenQingShangShiWLBH', businessApis.ShenQingShangShiWLBH.getApi());
// 批量审批通过物料补货 [KFJL]
router.post('/piLiangShengPiTongGuoWLBHa', businessApis.PiLiangShengPiTongGuoWLBHa.getApi());
// 单独审批通过物料补货 [KFJL]
router.post('/danDuShengPiTongGuoWLBHa', businessApis.DanDuShengPiTongGuoWLBHa.getApi());
// 单独审批驳回物料补货 [KFJL]
router.post('/danDuShengPiBoHuiWLBHa', businessApis.DanDuShengPiBoHuiWLBHa.getApi());
// 为物料补货分配AZGS [PPJL]
router.post('/setWLBH0AZGS', businessApis.SetWLBH0AZGS.getApi());


//--
// 为物料补货分配AZGS [PPJL]
// ids, AZGSId

//--
// 批量审批通过物料补货 [PPJL]
// ids
// 检查操作记录权限
// end 检查操作记录权限

// 修改状态, 新建相关WLBHCZ
// end 修改状态, 新建相关WLBHCZ

//--
// 单独审批通过物料补货 [PJJL]
// id note(optional)
// 检查操作记录权限
// end 检查操作记录权限

// 修改状态, 新建相关WLBHCZ
// end 修改状态, 新建相关WLBHCZ

//--
// 单独审批驳回物料补货 [PPJL]
// id note(must)
// 检查操作记录权限
// end 检查操作记录权限

// 修改状态, 新建相关WLBHCZ
// end 修改状态, 新建相关WLBHCZ

//--
// 为物料补货分配发货GYS [生产GYS]
// ids GYSId
// 检查操作记录权限
// 如果ZZGYS, 要检查是否库存足够
// end 检查操作记录权限

// 修改状态, 新建相关WLBHCZ
// end 修改状态, 新建相关WLBHCZ

//--
// 并单 [生产GYS]
// ids
// 检查属于同一个发货GYS

//--
// 分配AZG [AZGSGLY]
// HBTime, GTId, WLIds, AZGUserId

// 装箱 [ZHY]
// HBTime, GTId, WLEWMs, KDXEWM

// 出箱--修改原来的出箱函数 [ZHY]

// 关联KDD-修改原来的

// 取消关联-修改原来的

// 收箱-修改原来的

// 收货-修改原来的

// 反馈

// 反馈图


// ZHY 出箱
router.post('/chuXiang', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.ZHY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // HWEWMs: [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const {
      HWEWMs,
    } = req.body;

    // 检查操作记录权限

    // 检查HWEWMs是属于ZX状态
    // end 检查HWEWMs是属于ZX状态

    // 检查ZHY是否有权限出箱这个货物
    // end 检查ZHY是否有权限出箱这个货物

    // end 检查操作记录权限

    // 新建相关记录
    // 如需新建KDX则新建
    // end 如需新建KDX则新建

    // HWEWMs清除绑上KDXID, DD_GT_WL/DD_DW_DP, 转为RK状态
    // end HWEWMs清除绑上KDXID, DD_GT_WL/DD_DW_DP, 转为RK状态

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

// ZHY 关联快递
router.post('/guanLiangKuaiDi', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.ZHY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const {
      KDXEWMs,
      KDDCode,
    } = req.body;

    // 检查操作记录权限

    // 检查KDXEWMs是属于ZX状态, 而且属于同一个GT
    // end 检查KDXEWMs是属于ZX状态, 而且属于同一个GT

    // 不用检查ZHY是否有权限快递这个KDX, 谁都可以快递

    // end 检查操作记录权限

    // 新建相关记录
    // 如需新建KDD则新建
    // end 如需新建KDD则新建

    // KDX状态转为FH
    // end KDX状态转为FH

    // 新建相关KDXCZ
    // end 新建相关KDXCZ

    // KDXEWMs绑上KDDId, 转为状态FH
    // end KDXEWMs绑上KDDId, 转为状态FH

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

// ZHY 解除关联快递
router.post('/jieChuGuanLiangKuaiDi', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.ZHY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const {
      KDXEWMs,
    } = req.body;

    // 检查操作记录权限

    // 检查KDXEWMs是属于KD状态
    // end 检查KDXEWMs是属于KD状态

    // 不用检查ZHY是否有权限解除这个KDX的关联, 谁都可以解除

    // end 检查操作记录权限

    // KDX状态转为ZX
    // end KDX状态转为ZX

    // 新建相关KDXCZ
    // end 新建相关KDXCZ

    // KDXEWMs取消绑定KDDId, 转为状态ZX
    // end KDXEWMs取消绑定KDDId, 转为状态ZX

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

// ZHY 收箱
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
    const {
      KDXEWMs,
    } = req.body;

    // 检查操作记录权限

    // 检查KDXEWMs是属于KD状态
    // end 检查KDXEWMs是属于KD状态

    // 检查KDX所属GT是和这个操作员一致
    // end 检查KDX所属GT是和这个操作员一致

    // end 检查操作记录权限

    // KDX状态转为SX
    // end KDX状态转为SX

    // 新建相关KDXCZ
    // end 新建相关KDXCZ

    // KDXEWMs转为状态SX
    // end KDXEWMs转为状态SX

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

// AZG 收货
router.post('/shouHuo', async (req, res, next) => {
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
    const {
      HWEWMs,
    } = req.body;

    // 检查操作记录权限

    // 检查HWEWMs是属于SX状态
    // end 检查HWEWMs是属于SX状态

    // 检查HWEWMs所属GT是和这个操作员一致
    // end 检查HWEWMs所属GT是和这个操作员一致

    // end 检查操作记录权限

    // HWEWMs状态转为SH
    // end HWEWMs状态转为SH

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
    const {
      HWEWMs,
    } = req.body;

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
    const {
      GTId,
      WYWLs,
      QJTImageUrl,
    } = req.body;

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
router.post('/shenShangShiQingWLBuHuo', async (req, res, next) => {
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
      DDId,
      GTId,
      WYId,
      imageUrl,
      note,
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
router.post('/shenRiChangQingWLBuHuo', async (req, res, next) => {
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
      GTId,
      WYId,
      imageUrl,
      note,
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
