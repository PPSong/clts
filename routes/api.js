import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
/* eslint-enable */
import {
  sequelize,
  JS,
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
} from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj);
};

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
      name, username, password, isSC, isKC,
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
        isSC,
        isKC,
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

    const {
      id, GTs,
    } = req.body;

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

  try {
    // 检查api调用权限
    if (![JS.KFJL].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const {
      PPId, name,
    } = req.body;

    // 检查操作记录权限
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查操作记录权限

    // 创建DD和相关Snapshot
    const r = await sequelize.query('call genDD(:PPId, :name, :status)', {
      transaction,
      replacements: { PPId, name, status: DDStatus.DSP },
    });
    const result = r[0];
    if (!result.code) {
      throw Error(result.msg);
    }
    // end 创建DD

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
