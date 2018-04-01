import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
/* eslint-enable */
import { sequelize, JS, User, PP, GT, GYS, AZGS } from '../models/Model';

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

    const {
      name, username, password,
    } = req.body;

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
