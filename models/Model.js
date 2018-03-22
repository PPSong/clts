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

const ADMIN = 1;
const PPJL = 2;
const KFJL = 3;
const GZ = 4;
const GTBA = 5;
const GYSGLY = 6;
const AZGGLY = 7;
const ZHY = 8;
const AZG = 9;

const getBasicTable = (str, editRole = [ADMIN, PPJL]) =>
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
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    email: {
      type: Sequelize.TEXT,
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  },
);

// 角色
export const JS = getBasicTable('JS');

User.belongsTo(JS, { as: 'JS' });

// 品牌
export const PP = getBasicTable('PP');
User.belongsToMany(PP, { through: 'User_PP' });
PP.belongsToMany(User, { through: 'User_PP' });

const initData = (str, num = 200) =>
  Array(num)
    .fill(0)
    .map((_, i) => ({ name: `${str}_${i}` }));

const addUserPP = async (user) => {
  const userId = user.id;
  const ppLength = await PP.count();
  const count = 5;
  const ppId = Array(count)
    .fill(0)
    .map((_, i) => (userId + i) % ppLength + 1);

  const pps = await PP.findAll({
    where: {
      id: {
        [Op.in]: ppId,
      },
    },
  });

  user.addPPs(pps);
};

const createUser = async (js, num) => {
  for (let i = 1; i <= num; i++) {
    const u = await User.create({
      email: `${js}_${i}@1.com`,
      password: bCrypt.hashSync('1', 8),
      JSId: js,
    });
    await addUserPP(u);
  }
};

export const init = async () => {
  try {
    await sequelize.sync({ force: true });

    await JS.bulkCreate([
      {
        id: ADMIN,
        name: '系统管理员',
      },
      {
        id: PPJL,
        name: '品牌经理',
      },
      {
        id: KFJL,
        name: '客服经理',
      },
      {
        id: GZ,
        name: '柜长',
      },
      {
        id: GTBA,
        name: '柜台BA',
      },
      {
        id: GYSGLY,
        name: '供应商管理员',
      },
      {
        id: AZGGLY,
        name: '安装工管理员',
      },
      {
        id: ZHY,
        name: '装货员',
      },
      {
        id: AZG,
        name: '安装工',
      },
    ]);

    await PP.bulkCreate(initData('品牌'));

    await createUser(1, 10);

    // const r = await User.findAll({
    //   attributes: ['email'],
    //   include: [
    //     {
    //       model: JS,
    //       as: 'JS',
    //       attributes: ['name'],
    //     },
    //   ],
    // });
    const r = await sequelize.query('SELECT * FROM `USER` JOIN `JS` ON `USER`.`JSId` = `JS`.`ID`', { type: sequelize.QueryTypes.SELECT });
    ppLog(r);
    // ppLog(r.map(item => item.toJSON()));
  } catch (err) {
    ppLog('init err:', err);
  }
};
