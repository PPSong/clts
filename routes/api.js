import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
/* eslint-enable */
import {
  sequelize,
  JS,
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
} from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('pptest', obj);
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

// 新建KFJL [ADMIN, PPJL]
router.post('/createKFJL', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.ADMIN && user.JS !== JS.PPJL) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { username, password, PPId } = req.body;

    // 检查操作记录权限
    if (user.JS === JS.PPJL) {
      // 如果PP不在PPJL权限范围, 则报错
      const allowPPIds = await user.getPPJLPPs({}, { transaction }).map(item => item.toJSON().id);

      if (!allowPPIds.includes(parseInt(PPId))) {
        throw new Error('记录不在权限范围!');
      }
    }
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

    const tmpPP = await PP.findOne({
      where: {
        id: PPId,
      },
      transaction,
    });

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
      name, code, QY, CS,
    } = req.body;

    const { PPId } = user;

    // 检查操作记录权限
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

// 编辑 柜台图 [KFJL]
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

    const { GTId, imageUrl } = req.body;

    // 检查操作记录权限
    const tmpGT = await GT.findOne({
      where: {
        id: GTId,
      },
      transaction,
    });

    if (!(tmpGT && tmpGT.PPId === user.PPId)) {
      throw new Error('没有操作权限!');
    }
    // end 检查操作记录权限

    // 设置image
    tmpGT.imageUrl = imageUrl;
    await tmpGT.save({ transaction });
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

    const { username, password } = req.body;

    // 检查操作记录权限
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

    // 设定GZ给自己所属PP
    await tmpGZUser.setGZPPs([user.PPId], { transaction });
    // end 设定GZ给自己所属PP

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
    // 检查userId角色是柜长, 品牌和操作者一致, 没有被disabled
    const tmpGZ = await User.findOne({
      where: {
        id: GZUserId,
        JS: JS.GZ,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpGZ) {
      throw new Error('记录操作不合法!');
    }

    const PPIds = await tmpGZ.getGZPPs({ transaction });
    if (PPIds[0].id !== user.PPId) {
      throw new Error('记录操作不合法!');
    }
    // end 检查userId角色是柜长, 品牌和操作者一致

    // 检查柜台都有效, 没有被disabled
    const tmpGTs = GT.findAll({
      where: {
        id: {
          $in: GTIds,
        },
        disabledAt: {
          $ne: null,
        },
      },
      transaction,
    });

    if (tmpGTs.length > 0) {
      throw new Error('记录操作不合法!');
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
    // 检查DP的PP, DWs所属的GT的PP与操作者同一品牌, 而且都是enable状态
    const tmpDP = await DP.findOne({
      where: {
        id,
        PPId: user.PPId,
        disabledAt: null,
      },
    });

    if (!tmpDP) {
      throw new Error('记录操作不合法!');
    }

    const tmpDWs = await DW.findAll({
      where: {
        id: {
          $in: DWIds,
        },
        disabledAt: null,
      },
      include: [
        {
          model: GT,
          as: 'GT',
          where: {
            PPId: user.PPId,
          },
        },
      ],
      transaction,
    });

    if (tmpDWs.length !== DWIds.length) {
      throw new Error('记录操作不合法!');
    }
    // end 检查操作记录权限

    // 设置DP_DWs
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

    // 检查PPId与操作者同一品牌, 而且都是enable状态
    const tmpPP = await PP.findOne({
      where: {
        id: PPId,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpPP) {
      throw new Error('没有对应记录!');
    }

    if (user.JS === JS.KFJL) {
      if (tmpPP.id !== user.PPId) {
        throw new Error('没有权限!');
      }
    }
    // end 检查PPId与操作者同一品牌, 而且都是enable状态

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

    // 检查PPId与操作者同一品牌, 而且都是enable状态
    const tmpPP = await PP.findOne({
      where: {
        id: PPId,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpPP) {
      throw new Error('没有对应记录!');
    }

    if (user.JS === JS.KFJL) {
      if (tmpPP.id !== user.PPId) {
        throw new Error('没有权限!');
      }
    }
    // end 检查PPId与操作者同一品牌, 而且都是enable状态

    // 检查WLId与操作者同一品牌, 而且都是enable状态, 而且是二级
    const tmpWLId = await WL.findOne({
      where: {
        id: WLId,
        level: 2,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpWLId) {
      throw new Error('没有对应记录!');
    }
    // end 检查WLId与操作者同一品牌, 而且都是enable状态, 而且是二级

    // 检查FGTesterIds与操作者同一品牌, 而且都是enable状态
    const FGTesterIds = FGTesters.map(item => item.id);
    for (let i = 0; i < FGTesterIds.length; i++) {
      const tmpFGTester = await FG_Tester.findOne({
        where: {
          id: FGTesterIds[i],
          PPId,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpFGTester) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查FGTesterIds与操作者同一品牌, 而且都是enable状态

    // 检查SJWLIds与操作者同一品牌, 而且都是enable状态, 而且都是三级
    const SJWLIds = SJWLs.map(item => item.id);
    for (let i = 0; i < SJWLIds.length; i++) {
      const tmpSJWL = await WL.findOne({
        where: {
          id: SJWLIds[i],
          PPId,
          level: 3,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpSJWL) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查SJWLIds与操作者同一品牌, 而且都是enable状态

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
      tmpEJZH.addFGTester(tmpFGTester.id, { through: { number: tmpFGTester.number } });
    }
    // end 配置EJZH FGTesters

    // 配置EJZH SJWLs
    for (let i = 0; i < SJWLs.length; i++) {
      const tmpSJWL = SJWLs[i];
      tmpEJZH.addSJWL(tmpSJWL.id, { through: { number: tmpSJWL.number } });
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

    // 检查编辑的EJZH与操作者同一品牌, 而且都是enable状态
    const tmpEJZH = await EJZH.findOne({
      where: {
        id,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpEJZH) {
      throw new Error('没有对应记录!');
    }

    if (user.JS === JS.KFJL) {
      if (tmpEJZH.PPId !== user.PPId) {
        throw new Error('没有权限!');
      }
    }
    // end 检查编辑的EJZH与操作者同一品牌, 而且都是enable状态

    // 检查WLId与EJZH同一品牌, 而且都是enable状态, 而且是二级
    const tmpWLId = await WL.findOne({
      where: {
        id: WLId,
        PPId: tmpEJZH.PPId,
        level: 2,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpWLId) {
      throw new Error('没有对应记录!');
    }
    // end 检查WLId与EJZH同一品牌, 而且都是enable状态, 而且是二级

    // 检查FGTesterIds与EJZH同一品牌, 而且都是enable状态
    const FGTesterIds = FGTesters.map(item => item.id);
    for (let i = 0; i < FGTesterIds.length; i++) {
      const tmpFGTester = await FG_Tester.findOne({
        where: {
          id: FGTesterIds[i],
          PPId: tmpEJZH.PPId,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpFGTester) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查FGTesterIds与EJZH同一品牌, 而且都是enable状态

    // 检查SJWLIds与EJZH同一品牌, 而且都是enable状态, 而且都是三级
    const SJWLIds = SJWLs.map(item => item.id);
    for (let i = 0; i < SJWLIds.length; i++) {
      const tmpSJWL = await WL.findOne({
        where: {
          id: SJWLIds[i],
          PPId: tmpEJZH.PPId,
          level: 3,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpSJWL) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查SJWLIds与EJZH同一品牌, 而且都是enable状态, 而且都是三级

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

    // 检查PPId与操作者同一品牌, 而且都是enable状态
    const tmpPP = await PP.findOne({
      where: {
        id: PPId,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpPP) {
      throw new Error('没有对应记录!');
    }

    if (user.JS === JS.KFJL) {
      if (tmpPP.id !== user.PPId) {
        throw new Error('没有权限!');
      }
    }
    // end 检查PPId与操作者同一品牌, 而且都是enable状态

    // 检查WLId与操作者同一品牌, 而且都是enable状态, 而且是一级
    const tmpWLId = await WL.findOne({
      where: {
        id: WLId,
        level: 1,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpWLId) {
      throw new Error('没有对应记录!');
    }
    // end 检查WLId与操作者同一品牌, 而且都是enable状态, 而且是一级d

    // 检查EJZHs与操作者同一品牌, 而且都是enable状态
    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      const tmpEJZH = await EJZH.findOne({
        where: {
          id: EJZHIds[i],
          PPId,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpEJZH) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查EJZHIds与操作者同一品牌, 而且都是enable状态

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
      tmpYJZH.addEJZH(tmpEJZH.id, { through: { number: tmpEJZH.number } });
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

    // 检查编辑的YJZH与操作者同一品牌, 而且都是enable状态
    const tmpYJZH = await YJZH.findOne({
      where: {
        id,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpYJZH) {
      throw new Error('没有对应记录!');
    }

    if (user.JS === JS.KFJL) {
      if (tmpYJZH.PPId !== user.PPId) {
        throw new Error('没有权限!');
      }
    }
    // end 检查编辑的YJZH与操作者同一品牌, 而且都是enable状态

    // 检查WLId与YJZH同一品牌, 而且都是enable状态, 而且是一级
    const tmpWLId = await WL.findOne({
      where: {
        id: WLId,
        PPId: tmpYJZH.PPId,
        level: 1,
        disabledAt: null,
      },
      transaction,
    });

    if (!tmpWLId) {
      throw new Error('没有对应记录!');
    }
    // end 检查WLId与YJZH同一品牌, 而且都是enable状态, 而且是一级

    // 检查EJZHIds与YJZH同一品牌, 而且都是enable状态
    const EJZHIds = EJZHs.map(item => item.id);
    for (let i = 0; i < EJZHIds.length; i++) {
      const tmpEJZH = await EJZH.findOne({
        where: {
          id: EJZHIds[i],
          PPId: tmpYJZH.PPId,
          disabledAt: null,
        },
        transaction,
      });

      if (!tmpEJZH) {
        throw new Error('没有对应记录!');
      }
    }
    // end 检查EJZHIds与YJZH同一品牌, 而且都是enable状态

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

// 常规RESTFUL API
router.post('/:table', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).create(req.body);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.get('/:table', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).getList(req.query);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.get('/:table/:id', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).findOne(req.params.id);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.put('/:table/:id', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).edit(req.params.id, req.body);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.delete('/:table/:id', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).delete(req.params.id, req.body);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

export default router;
