import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
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
} from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj);
};

const PP_DDOperationLock = {};

const router = express.Router();

// 新建PPJL [ADMIN]
router.post('/createPPJL', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.ADMIN) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限
    transaction = await sequelize.transaction();

    const { username, password, PPId } = req.body;

    // 检查操作记录权限
    // end 检查操作记录权限

    // 新建用户
    const tmpUser = await User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: JS.PPJL,
      },
      { transaction },
    );

    const tmpPP = await PP.findOne({
      where: {
        id: PPId,
      },
      transaction,
    });

    await tmpPP.setPPJLs([tmpUser], { transaction });
    // end 新建用户

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

// 新建KFJL [PPJL]
router.post('/createKFJL', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.PPJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { username, password, PPId } = req.body;

    // 检查操作记录权限
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查操作记录权限

    // 新建用户
    const tmpUser = await User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: JS.KFJL,
      },
      { transaction },
    );

    await tmpPP.setKFJLs([tmpUser], { transaction });
    // end 新建用户

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

// 新建GT, GTBA [KFJL]
router.post('/createGT_GTBA', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      PPId, name, code, QY, CS,
    } = req.body;

    // 检查操作记录权限
    await user.checkPPId(PPId, transaction);
    // end 检查操作记录权限

    // 新建GTBAUser
    const tmpGTBAUser = await User.create(
      {
        username: code,
        password: bCrypt.hashSync('123456', 8),
        JS: JS.GTBA,
      },
      { transaction },
    );
    // end 新建GTBAUser

    // 新建GT
    const tmpGT = await GT.create(
      {
        name,
        code,
        PPId,
        QY,
        GTBAUserId: tmpGTBAUser.id,
        CS,
      },
      { transaction },
    );
    // end 新建GT

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

// 编辑柜台图 [KFJL]
router.post('/setGT_IMAGE', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, imageUrl } = req.body;

    // 检查操作记录权限
    const tmpGT = await user.checkGTId(id, transaction);
    // end 检查操作记录权限

    // 设置image
    await tmpGT.update(
      {
        imageUrl,
      },
      { transaction },
    );

    // end 设置image

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

// 创建 GZ [KFJL]
router.post('/createGZ', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { PPId, username, password } = req.body;

    // 检查操作记录权限
    await user.checkPPId(PPId, transaction);
    // end 检查操作记录权限

    // 创建GZ用户
    const tmpGZUser = await User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: JS.GZ,
      },
      { transaction },
    );
    // end 创建GZ用户

    // 设定GZ的PP
    await tmpGZUser.setGZPPs([PPId], { transaction });
    // end 设定GZ的PP

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

// 配置 GZ 负责柜台 [KFJL]
router.post('/setGZ_GTs', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { GZUserId, GTIds } = req.body;

    // 检查操作记录权限
    const tmpGZ = await user.checkGZUserId(GZUserId, transaction);
    for (let i = 0; i < GTIds.length; i++) {
      await user.checkGTId(GTIds[i], transaction);
    }
    // end 检查操作记录权限

    // 设置GTIds
    await tmpGZ.setGTs(GTIds, { transaction });
    // end 设置GTIds

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

// 新建GYS, GLY
router.post('/createGYSAndGLY', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      name, username, password, type,
    } = req.body;

    // 检查操作记录权限
    // end 检查操作记录权限

    // 新建GYSGLY
    const tmpGYSGLYUser = await User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: JS.GYSGLY,
      },
      { transaction },
    );
    // end 新建GYSGLY

    // 新建GYS
    const tmpGYS = await GYS.create(
      {
        name,
        type,
      },
      { transaction },
    );
    // end 新建GYS

    await tmpGYS.setGLYs([tmpGYSGLYUser], { transaction });

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

// 新建AZGS, GLY
router.post('/createAZGSAndGLY', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { name, username, password } = req.body;

    // 检查操作记录权限
    // end 检查操作记录权限

    // 新建AZGSGLY
    const tmpAZGSGLYUser = await User.create(
      {
        username,
        password: bCrypt.hashSync(password, 8),
        JS: JS.AZGSGLY,
      },
      { transaction },
    );
    // end 新建AZGSGLY

    // 新建AZGS
    const tmpAZGS = await AZGS.create(
      {
        name,
      },
      { transaction },
    );
    // end 新建AZGS

    await tmpAZGS.setGLYs([tmpAZGSGLYUser], { transaction });

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

// 配置 DP_DWs [KFJL]
router.post('/setDP_DWs', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, DWIds } = req.body;

    // 检查操作记录权限
    await user.checkDPId(id, transaction);
    for (let i = 0; i < DWIds.length; i++) {
      await user.checkDWId(DWIds[i], transaction);
    }
    // end 检查操作记录权限

    // 设置DP_DWs
    const tmpDP = await DP.findOne({
      where: {
        id,
      },
      transaction,
    });
    await tmpDP.setDWs(DWIds, { transaction });
    // end 设置GTIds

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

// KFJL 创建 FG, Tester, FGTester
router.post('/createFG_Tester_FGTester', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { PPId, FG: FGPayload } = req.body;

    // 检查操作记录权限
    await user.checkPPId(PPId, transaction);

    // 检查FG如果在对应PP中已存在是enable状态
    const tmpFG = await FG.findOne({
      where: {
        PPId,
        name: FG.name,
      },
      transaction,
    });

    if (tmpFG) {
      if (tmpFG.disabledAt != null) {
        throw new Error('记录状态不正确!');
      }
    }
    // end 检查FG如果在对应PP中已存在是enable状态

    // 检查Testers如果在对应PPId已存在是enable状态
    const { Testers } = FGPayload;
    for (let i = 0; i < Testers.length; i++) {
      const tmpTester = await Tester.findOne({
        where: {
          PPId,
          name: Testers[i].name,
        },
        transaction,
      });

      if (tmpTester) {
        if (tmpTester.disabledAt != null) {
          throw new Error('记录状态不正确!');
        }
      }
    }
    // end 检查Testers如果在对应PPId已存在是enable状态

    // end 检查操作记录权限

    // 如不存在则创建FG
    let tmpFG2 = await FG.findOne({
      where: {
        PPId,
        name: FG.name,
      },
      transaction,
    });

    if (!tmpFG2) {
      tmpFG2 = await FG.create(
        {
          name: FGPayload.name,
          PPId,
          note: FGPayload.note,
        },
        { transaction },
      );
    }
    // end 如不存在则创建FG

    // 如不存在则创建Tester
    const TesterIds = [];
    for (let i = 0; i < Testers.length; i++) {
      let tmpTester = await Tester.findOne({
        where: {
          PPId,
          name: Testers[i],
        },
        transaction,
      });

      if (!tmpTester) {
        tmpTester = await Tester.create(
          {
            name: Testers[i],
            PPId,
          },
          { transaction },
        );
      }

      TesterIds.push(tmpTester.id);
    }
    // end 如不存在则创建Tester

    // 把Testers配置到FG上
    await tmpFG2.setTesters(TesterIds, { through: { PPId }, transaction });
    // end 把Testers配置到FG上

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

// KFJL 创建 EJZH
router.post('/createEJZH', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      PPId, name, WLId, imageUrl, XGTs, FGTesters, SJWLs,
    } = req.body;

    // 检查操作记录权限
    await user.checkPPId(PPId, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    // 检查WL是二级
    if (tmpWL.level !== 2) {
      throw new Error('没有对应记录!');
    }
    // end 检查WL是二级

    // 检查FGTesterIds
    const FGTesterIds = FGTesters.map(item => item.id);
    for (let i = 0; i < FGTesterIds.length; i++) {
      await user.checkFGTesterId(FGTesterIds[i], transaction);
    }
    // end 检查FGTesterIds

    // 检查SJWLIds
    const SJWLIds = SJWLs.map(item => item.id);
    for (let i = 0; i < SJWLIds.length; i++) {
      const tmpSJWL = await user.checkWLId(SJWLIds[i], transaction);

      if (tmpSJWL.level !== 3) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查SJWLIds

    // 创建EJZH
    const tmpEJZH = await EJZH.create(
      {
        name,
        WLId,
        PPId,
        imageUrl,
      },
      { transaction },
    );

    // 创建EJZHXGTs
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await EJZHXGT.create(
        {
          EJZHId: tmpEJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 创建EJZHXGTs

    // 配置EJZH FGTesters
    for (let i = 0; i < FGTesters.length; i++) {
      const tmpFGTester = FGTesters[i];
      await tmpEJZH.addFGTester(tmpFGTester.id, {
        through: { number: tmpFGTester.number },
        transaction,
      });
    }
    // end 配置EJZH FGTesters

    // 配置EJZH SJWLs
    for (let i = 0; i < SJWLs.length; i++) {
      const tmpSJWL = SJWLs[i];
      await tmpEJZH.addSJWL(tmpSJWL.id, { through: { number: tmpSJWL.number }, transaction });
    }
    // end 配置EJZH SJWLs

    // end 创建EJZH

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

// KFJL 编辑 EJZH
router.post('/editEJZH', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
    } = req.body;

    // 检查操作记录权限
    const tmpEJZH = await user.checkEJZHId(id, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 2) {
      throw new Error('没有对应记录!');
    }

    // FGTesterIds
    const FGTesterIds = FGTesters.map(item => item.id);
    for (let i = 0; i < FGTesterIds.length; i++) {
      await user.checkFGTesterId(FGTesterIds[i], transaction);
    }
    // end FGTesterIds

    // SJWLIds
    const SJWLIds = SJWLs.map(item => item.id);
    for (let i = 0; i < SJWLIds.length; i++) {
      const tmpSJWL = await user.checkWLId(SJWLIds[i], transaction);
      if (tmpSJWL.level !== 3) {
        throw new Error('没有对应记录!');
      }
    }
    // end SJWLIds

    // 编辑EJZH
    await tmpEJZH.update(
      {
        WLId,
        imageUrl,
      },
      { transaction },
    );

    // 重置 EJZHXGTs
    await EJZHXGT.destroy({
      where: {
        EJZHId: tmpEJZH.id,
      },
      transaction,
    });
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await EJZHXGT.create(
        {
          EJZHId: tmpEJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 重置 EJZHXGTs

    // 重置 FGTesters
    await tmpEJZH.setFGTesters(null, { transaction });
    for (let i = 0; i < FGTesters.length; i++) {
      const tmpFGTester = FGTesters[i];
      await tmpEJZH.addFGTester(tmpFGTester.id, {
        through: { number: tmpFGTester.number },
        transaction,
      });
    }
    // end 重置 FGTesters

    // 配置EJZH SJWLs
    await tmpEJZH.setSJWLs(null, { transaction });
    for (let i = 0; i < SJWLs.length; i++) {
      const tmpSJWL = SJWLs[i];
      await tmpEJZH.addSJWL(tmpSJWL.id, { through: { number: tmpSJWL.number }, transaction });
    }
    // end 配置EJZH SJWLs

    // end 创建EJZH

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

// KFJL 创建 YJZH
router.post('/createYJZH', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      PPId, name, WLId, imageUrl, XGTs, EJZHs,
    } = req.body;

    // 检查操作记录权限
    const tmpPP = await user.checkPPId(PPId, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 1) {
      throw new Error('没有对应记录!');
    }

    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      await user.checkEJZHId(EJZHIds[i], transaction);
    }

    // 创建YJZH
    const tmpYJZH = await YJZH.create(
      {
        name,
        WLId,
        PPId,
        imageUrl,
      },
      { transaction },
    );

    // 创建YJZHXGTs
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await YJZHXGT.create(
        {
          YJZHId: tmpYJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 创建YJZHXGTs

    // 配置YJZH EJZHs
    for (let i = 0; i < EJZHs.length; i++) {
      const tmpEJZH = EJZHs[i];
      await tmpYJZH.addEJZH(tmpEJZH.id, { through: { number: tmpEJZH.number }, transaction });
    }
    // end 配置YJZH EJZHs

    // end 创建EJZH

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

// KFJL 编辑 YJZH
router.post('/editYJZH', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      id, WLId, imageUrl, XGTs, EJZHs,
    } = req.body;

    // 检查操作记录权限
    const tmpYJZH = await user.checkYJZHId(id, transaction);
    const tmpWL = await user.checkWLId(WLId, transaction);
    if (tmpWL.level !== 1) {
      throw new Error('没有对应记录!');
    }

    // 检查EJZHIds与YJZH同一品牌, 而且都是enable状态
    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      await user.checkEJZHId(EJZHIds[i], transaction);
    }
    // end 检查EJZHIds与YJZH同一品牌, 而且都是enable状态
    // end 检查操作记录权限

    // 编辑 EJZH
    await tmpYJZH.update(
      {
        WLId,
        imageUrl,
      },
      { transaction },
    );

    // 重置 YJZHXGTs
    await YJZHXGT.destroy({
      where: {
        YJZHId: tmpYJZH.id,
      },
      transaction,
    });
    for (let i = 0; i < XGTs.length; i++) {
      const tmpXGT = await YJZHXGT.create(
        {
          YJZHId: tmpYJZH.id,
          imageUrl: XGTs[i],
        },
        {
          transaction,
        },
      );
    }
    // end 重置 EJZHXGTs

    // 配置YJZH EJZHs
    await tmpYJZH.setEJZHs(null, { transaction });
    for (let i = 0; i < EJZHs.length; i++) {
      const tmpEJZH = EJZHs[i];
      await tmpYJZH.addEJZH(tmpEJZH.id, { through: { number: tmpEJZH.number }, transaction });
    }
    // end 配置YJZH EJZHs

    // end 编辑 EJZH

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

// KFJL 配置YJZH_GTs
router.post('/setYJZH_GTs', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, GTs } = req.body;

    // 检查操作记录权限
    const tmpYJZH = await user.checkYJZHId(id, transaction);
    for (let i = 0; i < GTs.lengths; i++) {
      await user.checkGTId(GTs[i].id);
    }
    // end 检查操作记录权限

    // 配置YJZH_GTs
    await tmpYJZH.setGTs(null, { transaction });
    for (let i = 0; i < GTs.length; i++) {
      const tmpGT = GTs[i];
      await tmpYJZH.addGT(tmpGT.id, { through: { number: tmpGT.number }, transaction });
    }
    // end 配置YJZH_GTs

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

// KFJL 生成订单
router.post('/createDD', async (req, res, next) => {
  let transaction;
  const { user } = req;
  let tmpPPId;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { PPId, name } = req.body;
    tmpPPId = PPId;

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    }
    // end 检查PP_DDOperationLock

    // 检查操作记录权限
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查操作记录权限

    // 创建DD和相关Snapshot
    const r = await sequelize.query('call genDD(:PPId, :name)', {
      transaction,
      replacements: { PPId, name },
    });
    const result = r[0];
    if (result.code <= 0) {
      throw Error(result.msg);
    }
    // end 创建DD

    await transaction.commit();

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpPPId];
    // end 清除PP_DDOperationLock

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpPPId];
    // end 清除PP_DDOperationLock

    ppLog(err);
    next(err);
  }
});

// KFJL 重新生成订单
router.post('/reCreateDD', async (req, res, next) => {
  let transaction;
  const { user } = req;
  let tmpDD;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { DDId } = req.body;

    // 检查操作记录权限
    tmpDD = await user.checkDDId(DDId, transaction);
    // end 检查操作记录权限

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // 重置DD和相关Snapshot
    const r = await sequelize.query('call reGenDD(:DDId)', {
      transaction,
      replacements: { DDId },
    });
    const result = r[0];
    if (result.code <= 0) {
      throw Error(result.msg);
    }
    // end 重置DD和相关Snapshot

    await transaction.commit();

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());

    // 清除PP_DDOperationLock
    if (tmpDD) {
      delete PP_DDOperationLock[tmpDD.PPId];
    }
    // end 清除PP_DDOperationLock

    ppLog(err);
    next(err);
  }
});

// KFJL 设置DD_GTFXs
router.post('/setDD_GTFXs', async (req, res, next) => {
  let transaction;
  const { user } = req;
  let tmpDD;

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, GTIds } = req.body;

    // 检查操作记录权限
    tmpDD = await user.checkDDId(id, transaction);
    for (let i = 0; i < GTIds.lengths; i++) {
      await user.checkGTId(GTIds[i].id);
    }
    // end 检查操作记录权限

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    // setDD_GTFXs
    await tmpDD.setFXGTs(GTIds, { transaction });
    // end setDD_GTFXs

    await transaction.commit();

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());

    // 清除PP_DDOperationLock
    if (tmpDD) {
      delete PP_DDOperationLock[tmpDD.PPId];
    }
    // end 清除PP_DDOperationLock

    ppLog(err);
    next(err);
  }
});

// PPJL 批量设置订单柜台物料的安装公司
router.post('/setDDGTWLs_AZGS', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.PPJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, DD_GT_WLIds } = req.body;

    // 检查操作记录权限
    // 检查DD_GT_WL是否属于同一个DD
    const tmpDD_GT_WLs = await DD_GT_WL.findAll({
      where: {
        id: {
          $in: DD_GT_WLIds,
        },
      },
      transaction,
    });

    const tmpDD_GT_WLIds = tmpDD_GT_WLs.map(item => item.DDId);

    if (tmpDD_GT_WLIds.length === 0) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = tmpDD_GT_WLIds[0];

    for (let i = 1; i < tmpDD_GT_WLIds.length; i++) {
      if (tmpDD_GT_WLIds[i] !== tmpDDId) {
        throw new Error('操作记录应该要属于同一个订单!');
      }
    }
    // end 检查DD_GT_WL是否属于同一个DD

    // 检查订单所属品牌是否在权限范围
    const tmpDD = await user.checkDDId(tmpDDId, transaction);
    // end 检查订单所属品牌是否在权限范围

    // 检查订单状态是否是'待审批'
    if (tmpDD.status !== DDStatus.DSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'待审批'
    // end 检查操作记录权限

    await DD_GT_WL.update(
      {
        AZGSId: id,
      },
      {
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
        transaction,
      },
    );

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

// PPJL 批量设置订单灯位灯片的安装公司
router.post('/setDDDWDPs_AZGS', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.PPJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id, DD_DW_DPIds } = req.body;

    // 检查操作记录权限
    // 检查DD_DW_DP是否属于同一个DD
    const tmpDD_DW_DPs = await DD_DW_DP.findAll({
      where: {
        id: {
          $in: DD_DW_DPIds,
        },
      },
      transaction,
    });

    const tmpDD_DW_DPIds = tmpDD_DW_DPs.map(item => item.DDId);

    if (tmpDD_DW_DPIds.length === 0) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = tmpDD_DW_DPIds[0];

    for (let i = 1; i < tmpDD_DW_DPIds.length; i++) {
      if (tmpDD_DW_DPIds[i] !== tmpDDId) {
        throw new Error('操作记录应该要属于同一个订单!');
      }
    }
    // end 检查DD_DW_DP是否属于同一个DD

    // 检查订单所属品牌是否在权限范围
    const tmpDD = await user.checkDDId(tmpDDId, transaction);
    // end 检查订单所属品牌是否在权限范围

    // 检查订单状态是否是'待审批'
    if (tmpDD.status !== DDStatus.DSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'待审批'

    // end 检查操作记录权限

    await DD_DW_DP.update(
      {
        AZGSId: id,
      },
      {
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
        transaction,
      },
    );

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

// PPJL 审批通过DD
router.post('/approveDD', async (req, res, next) => {
  let transaction;
  const { user } = req;
  let tmpDD;

  try {
    // 检查api调用权限
    if (![JS.PPJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { id } = req.body;

    // 检查操作记录权限
    tmpDD = await user.checkDDId(id, transaction);
    if (tmpDD.status !== DDStatus.DSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查操作记录权限

    // 检查PP_DDOperationLock
    if (PP_DDOperationLock[tmpDD.PPId]) {
      throw new Error('订单相关操作正在进行中, 请稍候再试!');
    } else {
      PP_DDOperationLock[tmpDD.PPId] = true;
    }
    // end 检查PP_DDOperationLock

    await tmpDD.update(
      {
        status: DDStatus.YSP,
      },
      { transaction },
    );

    await transaction.commit();

    // 清除PP_DDOperationLock
    delete PP_DDOperationLock[tmpDD.PPId];
    // end 清除PP_DDOperationLock

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());

    // 清除PP_DDOperationLock
    if (tmpDD) {
      delete PP_DDOperationLock[tmpDD.PPId];
    }
    // end 清除PP_DDOperationLock

    ppLog(err);
    next(err);
  }
});

// GYSGLY 批量设置订单柜台物料的发货供应商
router.post('/setDDGTWLs_GYS', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GYSGLY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { DD_GT_WLIds, GYSId } = req.body;

    // 检查操作记录权限
    await GYS.checkZZGYS(GYSId, transaction);
    // 检查DD_GT_WL是否属于同一个DD, 并且当前GYS是操作者所属供应商
    const tmpDD_GT_WLs = await DD_GT_WL.findAll({
      where: {
        id: {
          $in: DD_GT_WLIds,
        },
      },
      transaction,
    });

    const tmpDD_GT_WLIdGYSIds = tmpDD_GT_WLs.map(item => ({ DDId: item.DDId, GYSId: item.GYSId }));

    if (tmpDD_GT_WLIdGYSIds.length === 0) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = tmpDD_GT_WLIdGYSIds[0].DDId;

    for (let i = 1; i < tmpDD_GT_WLIdGYSIds.length; i++) {
      if (tmpDD_GT_WLIdGYSIds[i].DDId !== tmpDDId) {
        throw new Error('操作记录应该要属于同一个订单!');
      }

      await user.checkGYSId(tmpDD_GT_WLIdGYSIds[i].GYSId, transaction);
    }
    // end 检查DD_GT_WL是否属于同一个DD, 并且当前GYS是操作者所属供应商

    // 检查订单状态是否是'已审批'
    const tmpDD = await DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DDStatus.YSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'已审批'
    // end 检查操作记录权限

    await DD_GT_WL.update(
      {
        GYSId,
      },
      {
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
        transaction,
      },
    );

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

// GYSGLY 批量设置订单灯位灯片的发货供应商
router.post('/setDDDWDPs_GYS', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.GYSGLY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { DD_DW_DPIds, GYSId } = req.body;

    // 检查操作记录权限
    await GYS.checkZZGYS(GYSId, transaction);
    // 检查DD_DW_DP是否属于同一个DD, 并且当前GYS是操作者所属供应商
    const tmpDD_DW_DPs = await DD_DW_DP.findAll({
      where: {
        id: {
          $in: DD_DW_DPIds,
        },
      },
      transaction,
    });

    const tmpDD_DW_DPIdGYSIds = tmpDD_DW_DPs.map(item => ({ DDId: item.DDId, GYSId: item.GYSId }));

    if (tmpDD_DW_DPIdGYSIds.length === 0) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = tmpDD_DW_DPIdGYSIds[0].DDId;

    for (let i = 1; i < tmpDD_DW_DPIdGYSIds.length; i++) {
      if (tmpDD_DW_DPIdGYSIds[i].DDId !== tmpDDId) {
        throw new Error('操作记录应该要属于同一个订单!');
      }

      await user.checkGYSId(tmpDD_DW_DPIdGYSIds[i].GYSId, transaction);
    }
    // end 检查DD_DW_DP是否属于同一个DD, 并且当前GYS是操作者所属供应商

    // 检查订单状态是否是'已审批'
    const tmpDD = await DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DDStatus.YSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'已审批'
    // end 检查操作记录权限

    await DD_DW_DP.update(
      {
        GYSId,
      },
      {
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
        transaction,
      },
    );

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

// AZGSGLY 批量设置DD_GT_WL安装工
router.post('/setDDGTWLs_AZG', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.AZGSGLY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { DD_GT_WLIds, AZGUserId } = req.body;

    // 检查操作记录权限
    // 检查DD_GT_WL是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS
    const DD_GT_WLs = await DD_GT_WL.findAll({
      where: {
        id: {
          $in: DD_GT_WLIds,
        },
      },
      transaction,
    });

    if (DD_GT_WLs.length < 1) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = DD_GT_WLs[0].DDId;
    const tmpAZGSId = DD_GT_WLs[0].AZGSId;

    for (let i = 1; i < DD_GT_WLs.length; i++) {
      if (DD_GT_WLs[i].DDId !== tmpDDId) {
        throw new Error('记录需要属于同一个订单!');
      }

      if (DD_GT_WLs[i].AZGSId !== tmpAZGSId) {
        throw new Error('记录需要属于同一个安装公司!');
      }
    }

    // 检查tmpAZGSId是否属于当前用户操作范围
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查tmpAZGSId是否属于当前用户操作范围

    // 检查AZGUserId是否属于tmpAZGS
    const AZGUser = await tmpAZGS.checkAZGUserId(AZGUserId, transaction);
    // end 检查AZGUserId是否属于tmpAZGS

    // 检查订单状态是否是'已审批'
    const tmpDD = await DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DDStatus.YSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'已审批'
    // end 检查DD_GT_WL是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS
    // end 检查操作记录权限

    await DD_GT_WL.update(
      {
        AZGUserId,
      },
      {
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
        transaction,
      },
    );

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

// AZGSGLY 批量设置DD_DW_DP安装工
router.post('/setDDDWDPs_AZG', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.AZGSGLY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { DD_DW_DPIds, AZGUserId } = req.body;

    // 检查操作记录权限
    // 检查DD_DW_DP是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS
    const DD_DW_DPs = await DD_DW_DP.findAll({
      where: {
        id: {
          $in: DD_DW_DPIds,
        },
      },
      transaction,
    });

    if (DD_DW_DPs.length < 1) {
      throw new Error('没有找到对应记录!');
    }

    const tmpDDId = DD_DW_DPs[0].DDId;
    const tmpAZGSId = DD_DW_DPs[0].AZGSId;

    for (let i = 1; i < DD_DW_DPs.length; i++) {
      if (DD_DW_DPs[i].DDId !== tmpDDId) {
        throw new Error('记录需要属于同一个订单!');
      }

      if (DD_DW_DPs[i].AZGSId !== tmpAZGSId) {
        throw new Error('记录需要属于同一个安装公司!');
      }
    }

    // 检查tmpAZGSId是否属于当前用户操作范围
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查tmpAZGSId是否属于当前用户操作范围

    // 检查AZGUserId是否属于tmpAZGS
    const AZGUser = await tmpAZGS.checkAZGUserId(AZGUserId, transaction);
    // end 检查AZGUserId是否属于tmpAZGS

    // 检查订单状态是否是'已审批'
    const tmpDD = await DD.findOne({
      where: {
        id: tmpDDId,
      },
      transaction,
    });
    if (tmpDD.status !== DDStatus.YSP) {
      throw new Error('记录状态不正确!');
    }
    // end 检查订单状态是否是'已审批'
    // end 检查DD_DW_DP是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS
    // end 检查操作记录权限

    await DD_DW_DP.update(
      {
        AZGUserId,
      },
      {
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
        transaction,
      },
    );

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

// ZHY 批量入库
router.post('/piLiangRuKu', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.ZHY].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    // [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    const { EWMs } = req.body;

    // 检查操作记录权限
    // 检查二维码是否都属于同一种WL或者都属于DP
    const tmpTypeTypeIds = EWMs.map(item => `${item.type}_${item.typeId}`);
    const tmpUniqueTypeTypeIds = [...new Set(tmpTypeTypeIds)];
    if (tmpUniqueTypeTypeIds.length !== 1) {
      throw new Error('二维码组必须属于同一种物料或灯片!');
    }

    const tmpType = tmpUniqueTypeTypeIds[0].split('_')[0];
    const tmpId = tmpUniqueTypeTypeIds[0].split('_')[1];
    if (![EWMType.WL, EWMType.DP].includes(tmpType)) {
      throw new Error('入库必须是物料或灯片!');
    }
    // end 检查二维码是否都属于同一种WL或者都属于DP

    // 检查二维码中WLId/DPId是否属于ZHY所属GYS, 包括中转GYS
    if (tmpType === EWMType.WL) {
      await user.checkWLId(tmpId, transaction);
    } else {
      await user.checkDPId(tmpId, transaction);
    }
    // end 检查二维码中WLId/DPId是否属于ZHY所属GYS, 包括中转GYS
    // end 检查操作记录权限

    const tmpGYSId = await user.getGYSId(transaction);

    if (tmpType === EWMType.WL) {
      const newRecords = EWMs.map(item => ({
        EWM: JSON.stringify(item),
        status: WYWLStatus.RK,
        WLId: tmpId,
        GYSId: tmpGYSId,
      }));

      await WYWL.bulkCreate(newRecords, {
        transaction,
      });
    } else {
      const newRecords = EWMs.map(item => ({
        EWM: JSON.stringify(item),
        status: WYDPStatus.RK,
        DPId: tmpId,
        GYSId: tmpGYSId,
      }));

      await WYDP.bulkCreate(newRecords, {
        transaction,
      });
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
