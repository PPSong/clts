import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
/* eslint-enable */
import { sequelize, JS, User, PP, GT, GYS, AZGS } from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log(obj);
};

const router = express.Router();

// 新建PPJL
router.post('/createPPJL', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.ADMIN) {
      throw new Error('没有权限!');
    }

    transaction = await sequelize.transaction();

    const { username, password, PPId } = req.body;

    // 检查操作记录权限

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

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 新建KFJL
router.post('/createKFJL', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.ADMIN && user.JS !== JS.PPJL) {
      throw new Error('没有权限!');
    }

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

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 新建GT, GTBA
router.post('/createGT_GTBA', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }

    transaction = await sequelize.transaction();

    const {
      name, code, QY, CS,
    } = req.body;

    const { PPId } = user;

    // 检查操作记录权限

    // 新建GTBAUser
    const tmpGTBAUser = await User.create(
      {
        username: code,
        password: bCrypt.hashSync('123456', 8),
        JS: JS.GTBA,
      },
      { transaction },
    );

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

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 编辑 柜台图
router.post('/setGT_IMAGE', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }

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

    // 设置image
    tmpGT.imageUrl = imageUrl;
    await tmpGT.save({ transaction });

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 配置 GZ 负责柜台
router.post('/setGZ_GTs', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (![JS.ADMIN].includes(user.JS)) {
      throw new Error('没有权限!');
    }
    // end 检查api调用权限

    transaction = await sequelize.transaction();

    const { GZUserId, GTIds } = req.body;

    // 检查操作记录权限
    // 检查userId角色是柜长
    const tmpGZ = User.findOne({
      where: {
        id: GZUserId,
        JS: JS.GZ,
      },
      transaction,
    });

    if (!tmpGZ) {
      throw new Error('记录操作不合法!');
    }

    // 检查柜台都存在, 没有被软删除
    const tmpGTs = GT.findAll({
      where: {
        id: {
          $in: GTIds,
        },
        deletedAt: {
          $ne: null,
        },
      },
      transaction,
      paranoid: false,
    });

    if (tmpGTs.length > 0) {
      throw new Error('记录操作不合法!');
    }
    // end 检查操作记录权限

    // 设置GTIds
    await sequelize.query('UPDATE GT set GZUserId = :GZUserId WHERE id in (:GTIds)', {
      replacements: {
        GZUserId,
        GTIds: GTIds.join(','),
      },
      type: sequelize.QueryTypes.BULKUPDATE,
      transaction,
    });

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 创建 GYS
// router.post('/GYS', async (req, res, next) => {
//   let transaction;
//   const { user } = req;

//   try {
//     // 检查api调用权限
//     if (![JS.KFJL].includes(user.JS)) {
//       throw new Error('没有权限!');
//     }
//     // end 检查api调用权限

//     transaction = await sequelize.transaction();

//     const { name, isSC, isKC } = req.body;

//     // 检查操作记录权限
//     // 检查userId角色是柜长
//     const tmpGZ = User.findOne({
//       where: {
//         id: GZUserId,
//         JS: JS.GZ,
//       },
//       transaction,
//     });

//     if (!tmpGZ) {
//       throw new Error('记录操作不合法!');
//     }

//     // 检查柜台都存在, 没有被软删除
//     const tmpGTs = GT.findAll({
//       where: {
//         id: {
//           $in: GTIds,
//         },
//         deletedAt: {
//           $ne: null,
//         },
//       },
//       transaction,
//       paranoid: false,
//     });

//     if (tmpGTs.length > 0) {
//       throw new Error('记录操作不合法!');
//     }
//     // end 检查操作记录权限

//     // 设置GTIds
//     await sequelize.query('UPDATE GT set GZUserId = :GZUserId WHERE id in (:GTIds)', {
//       replacements: {
//         GZUserId,
//         GTIds: GTIds.join(','),
//       },
//       type: sequelize.QueryTypes.BULKUPDATE,
//       transaction,
//     });

//     await transaction.commit();

//     res.json({
//       code: 1,
//       data: 'ok',
//     });
//   } catch (err) {
//     // Rollback transaction if any errors were encountered
//     await (transaction && transaction.rollback());
//     ppLog(err);
//     next(err);
//   }
// });

// 新建GYS, GYSGLY
router.post('/createGYS_GYSGLY', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }

    transaction = await sequelize.transaction();

    const {
      GYSName, GYSGLYUsername, GYSGLYPassword, isSC, isKC,
    } = req.body;

    // 检查操作记录权限

    // 新建GYSGLY
    const tmpGYSGLYUser = await User.create(
      {
        username: GYSGLYUsername,
        password: bCrypt.hashSync(GYSGLYPassword, 8),
        JS: JS.GYSGLY,
      },
      { transaction },
    );

    // 新建GYS
    const tmpGYS = await GYS.create(
      {
        name: GYSName,
        isSC,
        isKC,
      },
      { transaction },
    );

    await tmpGYS.setGYSGLYs([tmpGYSGLYUser], { transaction });

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

// 新建AZGS, AZGSGLY
router.post('/createAZGS_AZGSGLY', async (req, res, next) => {
  let transaction;
  const { user } = req;

  try {
    // 检查api调用权限
    if (user.JS !== JS.KFJL) {
      throw new Error('没有权限!');
    }

    transaction = await sequelize.transaction();

    const { AZGSName, AZGSGLYUsername, AZGSGLYPassword } = req.body;

    // 检查操作记录权限

    // 新建AZGSGLY
    const tmpAZGSGLYUser = await User.create(
      {
        username: AZGSGLYUsername,
        password: bCrypt.hashSync(AZGSGLYPassword, 8),
        JS: JS.AZGSGLY,
      },
      { transaction },
    );

    // 新建AZGS
    const tmpAZGS = await AZGS.create(
      {
        name: AZGSName,
      },
      { transaction },
    );

    await tmpAZGS.setAZGSGLYs([tmpAZGSGLYUser], { transaction });

    await transaction.commit();

    res.json({
      code: 1,
      data: 'ok',
    });
  } catch (err) {
    // Rollback transaction if any errors were encountered
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
  console.log('pptest3');
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
