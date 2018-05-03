import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';
import _ from 'lodash';

/* eslint-disable */
import * as tables from '../tables';
import * as businessApis from './business_apis';
/* eslint-enable */
import { sequelize } from '../models/Model';

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
// 设置PP_GTFXs [KFJL]
router.post('/setPPGTFXs', businessApis.SetPPGTFXs.getApi());
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
// 批量入库WL [ZHY]
router.post('/piLiangRuKuWL', businessApis.PiLiangRuKuWL.getApi());
// 批量入库DP [ZHY]
router.post('/piLiangRuKuDP', businessApis.PiLiangRuKuDP.getApi());
// 批量出库WL [ZHY]
router.post('/piLiangChuKuWL', businessApis.PiLiangChuKuWL.getApi());
// 批量出库DP [ZHY]
router.post('/piLiangChuKuDP', businessApis.PiLiangChuKuDP.getApi());
// 批量消库WL [ZHY]
router.post('/piLiangXiaoKuWL', businessApis.PiLiangXiaoKuWL.getApi());
// 批量消库DP [ZHY]
router.post('/piLiangXiaoKuDP', businessApis.PiLiangXiaoKuDP.getApi());
// 订单批量装箱DDWL [ZHY]
router.post(
  '/piLiangZhuangXiangDDWL',
  businessApis.PiLiangZhuangXiangDDWL.getApi(),
);
// 订单批量装箱DDDP [ZHY]
router.post(
  '/piLiangZhuangXiangDDDP',
  businessApis.PiLiangZhuangXiangDDDP.getApi(),
);
// 订单批量装箱BHWL [ZHY]
router.post(
  '/piLiangZhuangXiangBuHuoWL',
  businessApis.PiLiangZhuangXiangBuHuoWL.getApi(),
);
// 订单批量装箱BHDP [ZHY]
router.post(
  '/piLiangZhuangXiangBuHuoDP',
  businessApis.PiLiangZhuangXiangBuHuoDP.getApi(),
);
// 出箱WL [ZHY]
router.post('/chuXiangWL', businessApis.ChuXiangWL.getApi());
// 出箱DP [ZHY]
router.post('/chuXiangDP', businessApis.ChuXiangDP.getApi());
// 关联快递 [ZHY]
router.post('/guanLianKuaiDi', businessApis.GuanLianKuaiDi.getApi());
// 解除关联快递 [ZHY]
router.post(
  '/jieChuGuanLianKuaiDi',
  businessApis.JieChuGuanLianKuaiDi.getApi(),
);
// 收箱 [GTBA]
router.post('/shouXiang', businessApis.ShouXiang.getApi());
// 收货WL [GTBA, AZG]
router.post('/shouHuoWL', businessApis.ShouHuoWL.getApi());
// 收货DP [GTBA, AZG]
router.post('/shouHuoDP', businessApis.ShouHuoDP.getApi());
// 安装反馈DDWL状态 [GTBA, AZG]
router.post(
  '/anZhuangFanKuiDDWLZhuangTai',
  businessApis.AnZhuangFanKuiDDWLZhuangTai.getApi(),
);
// 安装反馈DDDP状态 [GTBA, AZG]
router.post(
  '/anZhuangFanKuiDDDPZhuangTai',
  businessApis.AnZhuangFanKuiDDDPZhuangTai.getApi(),
);
// 安装反馈全景WL图片 [GTBA, AZG]
router.post(
  '/anZhuangFanKuiQuanJingWLTuPian',
  businessApis.AnZhuangFanKuiQuanJingWLTuPian.getApi(),
);
// 安装反馈全景DP图片 [GTBA, AZG]
router.post(
  '/anZhuangFanKuiQuanJingDPTuPian',
  businessApis.AnZhuangFanKuiQuanJingDPTuPian.getApi(),
);
// 申请上市WLBH [GZ, GTBA, AZG]
router.post(
  '/shenQingShangShiWLBH',
  businessApis.ShenQingShangShiWLBH.getApi(),
);
// 申请上市DPBH [GZ, GTBA, AZG]
router.post(
  '/shenQingShangShiDPBH',
  businessApis.ShenQingShangShiDPBH.getApi(),
);
// 申请日常WLBH [GZ, GTBA]
router.post(
  '/shenQingRiChangWLBH',
  businessApis.ShenQingRiChangWLBH.getApi(),
);
// 申请日常DPBH [GZ, GTBA]
router.post(
  '/shenQingRiChangDPBH',
  businessApis.ShenQingRiChangDPBH.getApi(),
);
// 批量审批通过WLBH [KFJL]
router.post(
  '/piLiangShenPiTongGuoWLBHa',
  businessApis.PiLiangShenPiTongGuoWLBHa.getApi(),
);
// 批量审批通过DPBH [KFJL]
router.post(
  '/piLiangShenPiTongGuoDPBHa',
  businessApis.PiLiangShenPiTongGuoDPBHa.getApi(),
);
// 单独审批通过WLBHa [KFJL]
router.post(
  '/danDuShenPiTongGuoWLBHa',
  businessApis.DanDuShenPiTongGuoWLBHa.getApi(),
);
// 单独审批通过DPBHa [KFJL]
router.post(
  '/danDuShenPiTongGuoDPBHa',
  businessApis.DanDuShenPiTongGuoDPBHa.getApi(),
);
// 单独审批驳回WLBHa [KFJL]
router.post(
  '/danDuShenPiBoHuiWLBHa',
  businessApis.DanDuShenPiBoHuiWLBHa.getApi(),
);
// 单独审批驳回DPBHa [KFJL]
router.post(
  '/danDuShenPiBoHuiDPBHa',
  businessApis.DanDuShenPiBoHuiDPBHa.getApi(),
);
// 为WLBH分配AZGS [PPJL]
router.post('/setWLBH0AZGS', businessApis.SetWLBH0AZGS.getApi());
// 为DPBH分配AZGS [PPJL]
router.post('/setDPBH0AZGS', businessApis.SetDPBH0AZGS.getApi());
// 批量审批通过WLBH [PPJL]
router.post(
  '/piLiangShenPiTongGuoWLBHb',
  businessApis.PiLiangShenPiTongGuoWLBHb.getApi(),
);
// 批量审批通过DPBHb [PPJL]
router.post(
  '/piLiangShenPiTongGuoDPBHb',
  businessApis.PiLiangShenPiTongGuoDPBHb.getApi(),
);
// 单独审批通过WLBHb [PPJL]
router.post(
  '/danDuShenPiTongGuoWLBHb',
  businessApis.DanDuShenPiTongGuoWLBHb.getApi(),
);
// 单独审批通过DPBHb [PPJL]
router.post(
  '/danDuShenPiTongGuoDPBHb',
  businessApis.DanDuShenPiTongGuoDPBHb.getApi(),
);
// 单独审批驳回WLBHb [PPJL]
router.post(
  '/danDuShenPiBoHuiWLBHb',
  businessApis.DanDuShenPiBoHuiWLBHb.getApi(),
);
// 单独审批驳回DPBHb [PPJL]
router.post(
  '/danDuShenPiBoHuiDPBHb',
  businessApis.DanDuShenPiBoHuiDPBHb.getApi(),
);
// setWLBHYJZXTime [生产GYSGLY]
router.post('/setWLBHs0YJZXTime', businessApis.SetWLBHs0YJZXTime.getApi());
// setDPBHYJZXTime [生产GYSGLY]
router.post('/setDPBHs0YJZXTime', businessApis.SetDPBHs0YJZXTime.getApi());
// 为WLBH分配发货GYS [生产GYS]
router.post('/fenPeiWLBHFaHuoGYS', businessApis.FenPeiWLBHFaHuoGYS.getApi());
// 为DPBH分配发货GYS [生产GYS]
router.post('/fenPeiDPBHFaHuoGYS', businessApis.FenPeiDPBHFaHuoGYS.getApi());
// 分配WLBH的AZG [AZGSGLY]
router.post('/setWLBHs0AZG', businessApis.SetWLBHs0AZG.getApi());
// 分配DPBH的AZG [AZGSGLY]
router.post('/setDPBHs0AZG', businessApis.SetDPBHs0AZG.getApi());


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
    const r = await new Table(req.user).edit(
      req.params.id,
      req.body,
      transaction,
    );
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
    const r = await new Table(req.user).delete(
      req.params.id,
      req.body,
      transaction,
    );
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
