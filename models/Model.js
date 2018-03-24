import Sequelize from 'sequelize';
import bCrypt from 'bcryptjs';
import debug from 'debug';

const ppLog = debug('ppLog');

export const { Op } = Sequelize;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col,
};
export const sequelize = new Sequelize('cltp', 'root', 'tcltcl', {
  dialect: 'mysql',
  operatorsAliases,
});

export const JS = {
  ADMIN: '系统管理员',
  PPJL: '品牌经理',
  KFJL: '客服经理',
  GZ: '柜长',
  GTBA: '柜台BA',
  GYSGLY: '供应商管理员',
  AZGGLY: '安装工管理员',
  ZHY: '装货员',
  AZG: '安装工',
};

export const QY = {
  EAST: '东区',
  SOUTH: '南区',
  WEST: '西区',
  NORTH: '北区',
};

const getBasicTable = (str, editRole = [JS.ADMIN, JS.PPJL]) =>
  sequelize.define(
    str,
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        // Edit
        editRole,
      },
    },
    {
      paranoid: true,
      version: true,
      freezeTableName: true,
    },
  );

// 用户
export const User = sequelize.define(
  'User',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    JS: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(JS).includes(val)) {
            throw new Error('非法角色名称!');
          }
        },
      },
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    mail: {
      type: Sequelize.STRING,
    },
    note: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
    version: true,
    validate: {
      check1() {
        ppLog('1');
        // throw new Error('Require either both latitude and longitude or neither1');
      },
      check2() {
        ppLog('2');
        // throw new Error('Require either both latitude and longitude or neither2');
      },
    },
  },
);

// 品牌
export const PP = getBasicTable('PP');
User.belongsTo(PP, { foreignKey: 'PPId' });

// 品牌经理
export const UserPPJL = sequelize.define(
  'UserPPJL',
  {
    PPJLUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    PPId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(PP, { through: 'UserPPJL', as: 'PPJLPPs', foreignKey: 'PPJLUserId' });
PP.belongsToMany(User, { through: 'UserPPJL', as: 'PPJLs', foreignKey: 'PPId' });

// 客服经理
export const UserKFJL = sequelize.define(
  'UserKFJL',
  {
    KFJLUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    PPId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(PP, { through: 'UserKFJL', as: 'KFJLPPs', foreignKey: 'KFJLUserId' });
PP.belongsToMany(User, { through: 'UserKFJL', as: 'KFJLs', foreignKey: 'PPId' });

// 柜长
export const UserGZ = sequelize.define(
  'UserGZ',
  {
    GZUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    PPId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(PP, { through: 'UserGZ', as: 'GZPPs', foreignKey: 'GZUserId' });
PP.belongsToMany(User, { through: 'UserGZ', as: 'GZs', foreignKey: 'PPId' });

// 柜台BA
export const UserGTBA = sequelize.define(
  'UserGTBA',
  {
    GTBAUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    PPId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(PP, { through: 'UserGTBA', as: 'GTBAPPs', foreignKey: 'GTBAUserId' });
PP.belongsToMany(User, { through: 'UserGTBA', as: 'GTBAs', foreignKey: 'PPId' });

// 供应商
export const GYS = getBasicTable('GYS');

// 供应商管理员
export const UserGYSGLY = sequelize.define(
  'UserGYSGLY',
  {
    GYSGLYUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(GYS, { through: 'UserGYSGLY', as: 'GYSGLYGYSs', foreignKey: 'GYSGLYUserId' });
GYS.belongsToMany(User, { through: 'UserGYSGLY', as: 'GYSGLYs', foreignKey: 'GYSId' });

// 装货员
export const UserZHY = sequelize.define(
  'UserZHY',
  {
    ZHYUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(GYS, { through: 'UserZHY', as: 'ZHYGYSs', foreignKey: 'ZHYUserId' });
GYS.belongsToMany(User, { through: 'UserZHY', as: 'ZHYs', foreignKey: 'GYSId' });

// 安装公司
export const AZGS = getBasicTable('AZGS');

// 安装公司管理员
export const UserAZGSGLY = sequelize.define(
  'UserAZGSGLY',
  {
    AZGSGLYUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    AZGSId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(AZGS, { through: 'UserAZGSGLY', as: 'AZGSGLYAZGS', foreignKey: 'AZGSGLYUserId' });
AZGS.belongsToMany(User, { through: 'UserAZGSGLY', as: 'AZGSGLY', foreignKey: 'AZGSId' });

// 安装工
export const UserAZG = sequelize.define(
  'UserAZG',
  {
    AZGUserId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    AZGSId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.belongsToMany(AZGS, { through: 'UserAZG', as: 'AZG', foreignKey: 'AZGSId' });
AZGS.belongsToMany(User, { through: 'UserAZG', as: 'AZGAZGS', foreignKey: 'AZGUserId' });

User.likeSearch = () => ['JS', 'PPId', 'QY', 'username', 'GYSId', 'AZGSId'];

const initData = (str, num = 200) =>
  Array(num)
    .fill(0)
    .map((_, i) => ({ name: `${str}_${i}` }));

const createUser = async (js, num) => {
  const ppLength = await PP.count();
  for (let i = 1; i <= num; i++) {
    const PPId = i % ppLength;
    const u = await User.create({
      username: `u${i}`,
      mail: `${js}_${i}@1.com`,
      password: bCrypt.hashSync('1', 8),
      JS: JS.PPJL,
      PPId: PPId !== 0 ? PPId : ppLength,
    });
  }
};

export const init = async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    await sequelize.sync({ force: true });

    await PP.bulkCreate(initData('品牌'));

    // 新建Admin
    await User.create({
      username: 'admin',
      password: bCrypt.hashSync('1', 8),
      JS: JS.ADMIN,
    });

    // await createUser(1, 20);
  } catch (err) {
    ppLog('init err:', err);
  }
};
