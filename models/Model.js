import Sequelize from 'sequelize';
import bCrypt from 'bcryptjs';
import _ from 'lodash';
import fs from 'fs';
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
  dialectOptions: {
    multipleStatements: true,
  },
  logging: false,
  operatorsAliases,
});

export const JS = {
  ADMIN: '系统管理员',
  PPJL: '品牌经理',
  KFJL: '客服经理',
  GZ: '柜长',
  GTBA: '柜台BA',
  GYSGLY: '供应商管理员',
  AZGSGLY: '安装公司管理员',
  ZHY: '装货员',
  AZG: '安装工',
};

export const QY = {
  EAST: '东区',
  SOUTH: '南区',
  WEST: '西区',
  NORTH: '北区',
};

export const DDStatus = {
  DSP: '待审批',
  YSP: '已审批',
};

export const GYSType = {
  SC: '生产',
  ZZ: '中转',
};

export const WYWLStatus = {
  RK: '入库',
  ZX: '装箱',
  FH: '发货',
  SX: '收箱',
  SH: '收货',
  FK: '反馈',
  FKT: '反馈图',
};

export const WYDPStatus = {
  RK: '入库',
  ZX: '装箱',
  FH: '发货',
  SX: '收箱',
  SH: '收货',
  FK: '反馈',
  FKT: '反馈图',
};

export const KDXStatus = {
  ZX: '装箱',
  FH: '发货',
  SX: '收箱',
};

export const AZFKType = {
  AZCG: '安装成功',
  DS: '丢失',
  CCBD: '尺寸不对',
  PS: '破损',
  QT: '其他',
};

export const EWMType = {
  WL: 'WL',
  DP: 'DP',
  KDX: 'KDX',
};

export const WLBHStatus = {
  DKFJLSP: '待客服经理审批',
  DPPJLSP: '待品牌经理审批',
  BH: '驳回',
  TG: '通过',
};

export const DPBHStatus = {
  DKFJLSP: '待客服经理审批',
  DPPJLSP: '待品牌经理审批',
  BH: '驳回',
  TG: '通过',
};

export const CS = ['北京', '上海', '广州', '深圳'];

const getBasicTable = str =>
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
      },
      disabledAt: {
        type: Sequelize.DATE,
      },
    },
    {
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
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    freezeTableName: true,
    version: true,
  },
);

User.prototype.getGYSId = async function (transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpGYSs;
  let tmpGYSIds;
  let tmpGYSId;

  switch (this.JS) {
    case JS.ZHY:
      tmpGYSs = await this.getZHYGYSs({ transaction });
      tmpGYSIds = tmpGYSs.map(item => item.id);
      // 目前ZHY只能属于一个GYS, 所以取第一个
      tmpGYSId = tmpGYSIds[0];

      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpGYSId;
};

// 检查PP本身是否合法, 并且是否在用户权限范围
User.prototype.checkPPId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;

  const tmpPP = await PP.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpPP) {
    throw new Error('记录不合法!');
  }

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpPP;
};

User.prototype.checkGTId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpGT = await GT.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpGT) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpGT.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.GZ:
      const tmpGTs = await this.getGTs({ transaction });
      const tmpGTIds = tmpGTs.map(item => item.id);
      if (!tmpGTIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.GTBA:
      if (tmpGT.GTBAUserId !== this.id) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpGT;
};

User.prototype.checkWYWLId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  const tmpWYWL = await WYWL.findOne({
    where: {
      id,
    },
    transaction,
  });

  if (!tmpWYWL) {
    throw new Error('记录不合法!');
  }

  const tmpDDGTWLId = tmpWYWL.DDGTWLId;

  switch (this.JS) {
    case JS.AZG:
      await this.checkDD_GT_WLId(tmpDDGTWLId, transaction);
      break;
    case JS.GTBA:
      await this.checkDD_GT_WLId(tmpDDGTWLId, transaction);
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpWYWL;
};

User.prototype.checkDD_GT_WLId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpDD_GT_WL = await DD_GT_WL.findOne({
    where: {
      id,
    },
    transaction,
  });

  if (!tmpDD_GT_WL) {
    throw new Error('记录不合法!');
  }

  const tmpDD = await tmpDD_GT_WL.getDD({ transaction });
  const tmpPPId = tmpDD.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.AZG:
      if (tmpDD_GT_WL.AZGUserId !== this.id) {
        throw new Error('没有权限!');
      }
      break;
    case JS.GTBA:
      if (tmpDD_GT_WL.AZGUserId !== null) {
        throw new Error('没有权限!');
      }
      await this.checkGTId(tmpDD_GT_WL.GTId, transaction);
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpDD_GT_WL;
};

User.prototype.checkWYDPId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  const tmpWYDP = await WYDP.findOne({
    where: {
      id,
    },
    transaction,
  });

  if (!tmpWYDP) {
    throw new Error('记录不合法!');
  }

  const tmpDDDWDPId = tmpWYDP.DDDWDPId;

  switch (this.JS) {
    case JS.AZG:
      await this.checkDD_DW_DPId(tmpDDDWDPId, transaction);
      break;
    case JS.GTBA:
      await this.checkDD_DW_DPId(tmpDDDWDPId, transaction);
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpWYDP;
};

User.prototype.checkDD_DW_DPId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpDD_DW_DP = await DD_DW_DP.findOne({
    where: {
      id,
    },
    include: [
      {
        model: DW,
        as: 'DW',
      },
    ],
    transaction,
  });

  if (!tmpDD_DW_DP) {
    throw new Error('记录不合法!');
  }

  const tmpDD = await tmpDD_DW_DP.getDD({ transaction });
  const tmpPPId = tmpDD.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.AZG:
      if (tmpDD_DW_DP.AZGUserId !== this.id) {
        throw new Error('没有权限!');
      }
      break;
    case JS.GTBA:
      if (tmpDD_DW_DP.AZGUserId !== null) {
        throw new Error('没有权限!');
      }
      await this.checkGTId(tmpDD_DW_DP.DW.GTId, transaction);
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpDD_DW_DP;
};

User.prototype.checkDDId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpDD = await DD.findOne({
    where: {
      id,
    },
    transaction,
  });

  if (!tmpDD) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpDD.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpDD;
};

User.prototype.checkGZUserId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  let tmpGZPPs = [];
  let tmpGZPPIds = [];
  const tmpGZ = await User.findOne({
    where: {
      id,
      JS: JS.GZ,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpGZ) {
    throw new Error('记录不合法!');
  }

  tmpGZPPs = await tmpGZ.getGZPPs({ transaction });
  tmpGZPPIds = tmpGZPPs.map(item => item.id);

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (_.difference(tmpGZPPIds, tmpPPIds).length > 0) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (_.difference(tmpGZPPIds, tmpPPIds).length > 0) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpGZ;
};

User.prototype.checkDPId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;

  let tmpGYSs;
  let tmpGYSIds;

  const tmpDP = await DP.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpDP) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpDP.PPId;
  const tmpGYSId = tmpDP.GYSId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.ZHY:
      tmpGYSs = await this.getZHYGYSs({ transaction });
      // 目前ZHY只能属于一个GYS, 所以只需要取第一个
      const tmpGYS = tmpGYSs[0];

      // 如果不是中转GYS也不是所属GYZ则报错
      if (!(tmpGYS.type === GYSType.ZZ || tmpGYS.id === tmpGYSId)) {
        throw new Error('没有权限!');
      }

      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpDP;
};

User.prototype.checkDWId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpDW = await DW.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpDW) {
    throw new Error('记录不合法!');
  }

  const tmpGT = await tmpDW.getGT({ transaction });
  const tmpPPId = tmpGT.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpDW;
};

User.prototype.checkGYSId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpGYSs;
  let tmpGYSIds;

  const tmpGYS = await GYS.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpGYS) {
    throw new Error('记录不合法!');
  }

  switch (this.JS) {
    case JS.ADMIN:
    case JS.PPJL:
    case JS.KFJL:
      break;
    case JS.GYSGLY:
      tmpGYSs = await this.getGLYGYSs({ transaction });
      tmpGYSIds = tmpGYSs.map(item => item.id);
      if (!tmpGYSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.ZHY:
      tmpGYSs = await this.getZHYGYSs({ transaction });
      tmpGYSIds = tmpGYSs.map(item => item.id);
      if (!tmpGYSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpGYS;
};

User.prototype.checkAZGSId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpAZGSs;
  let tmpAZGSIds;

  const tmpAZGS = await AZGS.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpAZGS) {
    throw new Error('记录不合法!');
  }

  switch (this.JS) {
    case JS.ADMIN:
    case JS.PPJL:
    case JS.KFJL:
      break;
    case JS.AZGSGLY:
      tmpAZGSs = await this.getGLYAZGSs({ transaction });
      tmpAZGSIds = tmpAZGSs.map(item => item.id);
      if (!tmpAZGSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.AZG:
      tmpAZGSs = await this.getAZGAZGSs({ transaction });
      tmpAZGSIds = tmpAZGSs.map(item => item.id);
      if (!tmpAZGSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpAZGS;
};

User.prototype.checkFGId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpFG = await FG.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpFG) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpFG.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpFG;
};

User.prototype.checkTesterId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpTester = await Tester.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpTester) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpTester.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpTester;
};

User.prototype.checkFGTesterId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpFGTester = await FG_Tester.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpFGTester) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpFGTester.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpFGTester;
};

User.prototype.checkWLId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;

  let tmpGYSs;
  let tmpGYSIds;

  const tmpWL = await WL.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpWL) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpWL.PPId;
  const tmpGYSId = tmpWL.GYSId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.ZHY:
      tmpGYSs = await this.getZHYGYSs({ transaction });
      // 目前ZHY只能属于一个GYS, 所以只需要取第一个
      const tmpGYS = tmpGYSs[0];

      // 如果不是中转GYS也不是所属GYZ则报错
      if (!(tmpGYS.type === GYSType.ZZ || tmpGYS.id === tmpGYSId)) {
        throw new Error('没有权限!');
      }

      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpWL;
};

User.prototype.checkEJZHId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpEJZH = await EJZH.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpEJZH) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpEJZH.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpEJZH;
};

User.prototype.checkYJZHId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpPPs;
  let tmpPPIds;
  const tmpYJZH = await YJZH.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpYJZH) {
    throw new Error('记录不合法!');
  }

  const tmpPPId = tmpYJZH.PPId;

  switch (this.JS) {
    case JS.ADMIN:
      break;
    case JS.PPJL:
      tmpPPs = await this.getPPJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);

      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.KFJL:
      tmpPPs = await this.getKFJLPPs({ transaction });
      tmpPPIds = tmpPPs.map(item => item.id);
      if (!tmpPPIds.includes(tmpPPId)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpYJZH;
};

User.prototype.checkGYSId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpGYSs;
  let tmpGYSIds;

  const tmpGYS = await GYS.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpGYS) {
    throw new Error('记录不合法!');
  }

  switch (this.JS) {
    case JS.ADMIN:
    case JS.PPJL:
    case JS.KFJL:
      break;
    case JS.GYSGLY:
      tmpGYSs = await this.getGLYGYSs({ transaction });
      tmpGYSIds = tmpGYSs.map(item => item.id);
      if (!tmpGYSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    case JS.ZHY:
      tmpGYSs = await this.getZHYGYSs({ transaction });
      tmpGYSIds = tmpGYSs.map(item => item.id);
      if (!tmpGYSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpGYS;
};

User.prototype.checkAZGSId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  let tmpAZGSs;
  let tmpAZGSIds;

  const tmpAZGS = await AZGS.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpAZGS) {
    throw new Error('记录不合法!');
  }

  switch (this.JS) {
    case JS.AZGSGLY:
      tmpAZGSs = await this.getGLYAZGSs({ transaction });
      tmpAZGSIds = tmpAZGSs.map(item => item.id);
      if (!tmpAZGSIds.includes(id)) {
        throw new Error('没有权限!');
      }
      break;
    default:
      throw new Error('没有权限!');
  }

  return tmpAZGS;
};

// 品牌
export const PP = getBasicTable('PP');

// 品牌经理
export const PPJL_PP = sequelize.define(
  'PPJL_PP',
  {
    UserId: {
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

User.belongsToMany(PP, {
  through: 'PPJL_PP',
  as: 'PPJLPPs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
PP.belongsToMany(User, {
  through: 'PPJL_PP',
  as: 'PPJLs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 客服经理
export const KFJL_PP = sequelize.define(
  'KFJL_PP',
  {
    UserId: {
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

User.belongsToMany(PP, {
  through: 'KFJL_PP',
  as: 'KFJLPPs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
PP.belongsToMany(User, {
  through: 'KFJL_PP',
  as: 'KFJLs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 柜长
export const GZ_PP = sequelize.define(
  'GZ_PP',
  {
    UserId: {
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

User.belongsToMany(PP, {
  through: 'GZ_PP',
  as: 'GZPPs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
PP.belongsToMany(User, {
  through: 'GZ_PP',
  as: 'GZs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 柜台
export const GT = sequelize.define(
  'GT',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name',
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'code',
    },
    PPId: {
      type: Sequelize.INTEGER,
    },
    QY: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(QY).includes(val)) {
            throw new Error('非法区域名称!');
          }
        },
      },
    },
    GZUserId: {
      type: Sequelize.INTEGER,
    },
    GTBAUserId: {
      type: Sequelize.INTEGER,
      unique: 'GTBAUserId',
      allowNull: false,
    },
    CS: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(CS).includes(val)) {
            throw new Error('非法城市名称!');
          }
        },
      },
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
    note: {
      type: Sequelize.TEXT,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

GT.belongsTo(User, {
  as: 'GZ',
  foreignKey: 'GZUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
User.hasMany(GT, {
  as: 'GTs',
  foreignKey: 'GZUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GT.belongsTo(User, {
  as: 'GTBA',
  foreignKey: 'GTBAUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
User.hasOne(GT, {
  as: 'GTBA',
  foreignKey: 'GTBAUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GT.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 供应商
export const GYS = sequelize.define(
  'GYS',
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
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(GYSType).includes(val)) {
            throw new Error('非法供应商类型!');
          }
        },
      },
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

GYS.checkZZGYS = async function (id, transaction) {
  const tmpGYS = await GYS.findOne({
    where: {
      id,
      disabledAt: null,
    },
    transaction,
  });

  if (!tmpGYS) {
    throw new Error('记录不合法!');
  }

  if (tmpGYS.type !== GYSType.ZZ) {
    throw new Error('记录不合法!');
  }

  return tmpGYS;
};

// 供应商管理员
export const GLY_GYS = sequelize.define(
  'GLY_GYS',
  {
    UserId: {
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

User.belongsToMany(GYS, {
  through: 'GLY_GYS',
  as: 'GLYGYSs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GYS.belongsToMany(User, {
  through: 'GLY_GYS',
  as: 'GLYs',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 装货员
export const ZHY_GYS = sequelize.define(
  'ZHY_GYS',
  {
    UserId: {
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

User.belongsToMany(GYS, {
  through: 'ZHY_GYS',
  as: 'ZHYGYSs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GYS.belongsToMany(User, {
  through: 'ZHY_GYS',
  as: 'ZHYs',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 安装公司
export const AZGS = getBasicTable('AZGS');

AZGS.prototype.checkAZGUserId = async function (id, transaction) {
  if (!transaction) {
    throw new Error('transaction不能为空!');
  }

  const tmpAZGUser = await User.findOne({
    where: {
      id,
      disabledAt: null,
      JS: JS.AZG,
    },
    transaction,
  });

  if (!tmpAZGUser) {
    throw new Error('记录不合法!');
  }

  const tmpAZGSs = await tmpAZGUser.getAZGAZGSs({ transaction });
  const tmpAZGSIds = tmpAZGSs.map(item => item.id);
  if (!tmpAZGSIds.includes(this.id)) {
    throw new Error('没有权限!');
  }

  return tmpAZGUser;
};

// 安装公司管理员
export const GLY_AZGS = sequelize.define(
  'GLY_AZGS',
  {
    UserId: {
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

User.belongsToMany(AZGS, {
  through: 'GLY_AZGS',
  as: 'GLYAZGSs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
AZGS.belongsToMany(User, {
  through: 'GLY_AZGS',
  as: 'GLYs',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 安装工
export const AZG_AZGS = sequelize.define(
  'AZG_AZGS',
  {
    UserId: {
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

User.belongsToMany(AZGS, {
  through: 'AZG_AZGS',
  as: 'AZGAZGSs',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
AZGS.belongsToMany(User, {
  through: 'AZG_AZGS',
  as: 'AZGs',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 灯片
export const DP = sequelize.define(
  'DP',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    PPId: {
      type: Sequelize.INTEGER,
      unique: 'name_PPId',
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DP.belongsTo(GYS, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DP.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// 灯位
export const DW = sequelize.define(
  'DW',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_GTId',
    },
    GTId: {
      type: Sequelize.INTEGER,
      unique: 'name_GTId',
    },
    DPId: {
      type: Sequelize.INTEGER,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DW.belongsTo(GT, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DW.belongsTo(DP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DP.hasMany(DW, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// FG
export const FG = sequelize.define(
  'FG',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
    note: {
      type: Sequelize.TEXT,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

FG.belongsTo(PP);

// Tester
export const Tester = sequelize.define(
  'Tester',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

Tester.prototype.toString = function () {
  return `[id: ${this.id}, name: ${this.name}]`;
};

Tester.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// FGTester
export const FG_Tester = sequelize.define(
  'FG_Tester',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    FGId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    TesterId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

FG.prototype.toString = function () {
  return `[id: ${this.id}, name: ${this.name}]`;
};

FG.belongsToMany(Tester, {
  through: 'FG_Tester',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
Tester.belongsToMany(FG, {
  through: 'FG_Tester',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
FG_Tester.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WL
export const WL = sequelize.define(
  'WL',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'code_PPId',
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!(val >= 1 && val <= 3)) {
            throw new Error('非法level!');
          }
        },
      },
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
    GYSId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
    note: {
      type: Sequelize.TEXT,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WL.prototype.toString = function () {
  return `[id: ${this.id}, name: ${this.name}]`;
};

WL.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WL.belongsTo(GYS, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// EJZH
export const EJZH = sequelize.define(
  'EJZH',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

EJZH.belongsTo(WL, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
EJZH.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// EJZH_FGTester
export const EJZH_FGTester = sequelize.define(
  'EJZH_FGTester',
  {
    EJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    FGTesterId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

EJZH.belongsToMany(FG_Tester, {
  through: 'EJZH_FGTester',
  as: 'FGTesters',
  foreignKey: 'EJZHId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
FG_Tester.belongsToMany(EJZH, {
  through: 'EJZH_FGTester',
  as: 'EJZHs',
  foreignKey: 'FGTesterId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// EJZH_SJWL
export const EJZH_SJWL = sequelize.define(
  'EJZH_SJWL',
  {
    EJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

EJZH.belongsToMany(WL, {
  through: 'EJZH_SJWL',
  as: 'SJWLs',
  foreignKey: 'EJZHId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WL.belongsToMany(EJZH, {
  through: 'EJZH_SJWL',
  as: 'EJZHs',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// YJZH
export const YJZH = sequelize.define(
  'YJZH',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    disabledAt: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

YJZH.belongsTo(WL, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
YJZH.belongsTo(PP, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// YJZH_EJZH
export const YJZH_EJZH = sequelize.define(
  'YJZH_EJZH',
  {
    YJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    EJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

YJZH.belongsToMany(EJZH, { through: 'YJZH_EJZH', as: 'EJZHs', foreignKey: 'YJZHId' });
EJZH.belongsToMany(YJZH, { through: 'YJZH_EJZH', as: 'YJZHs', foreignKey: 'EJZHId' });

// GT_YJZH
export const GT_YJZH = sequelize.define(
  'GT_YJZH',
  {
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    YJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

GT.belongsToMany(YJZH, { through: 'GT_YJZH' });
YJZH.belongsToMany(GT, { through: 'GT_YJZH' });

// YJZHXGT
export const YJZHXGT = sequelize.define(
  'YJZHXGT',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    YJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

YJZHXGT.belongsTo(YJZH, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
YJZH.hasMany(YJZHXGT, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// EJZHXGT
export const EJZHXGT = sequelize.define(
  'EJZHXGT',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    EJZHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

EJZHXGT.belongsTo(EJZH, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
EJZH.hasMany(EJZHXGT, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD
export const DD = sequelize.define(
  'DD',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'name_PPId',
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(DDStatus).includes(val)) {
            throw new Error('非法订单状态名称!');
          }
        },
      },
    },
    PPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'name_PPId',
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD.prototype.toString = function () {
  return `[id: ${this.id}, name: ${this.name}]`;
};

// DD_GT_WLSnapshot
export const DD_GT_WLSnapshot = sequelize.define(
  'DD_GT_WLSnapshot',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_GT_WLSnapshot.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WLSnapshot.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WLSnapshot.belongsTo(WL, {
  as: 'WL',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_DW_DPSnapshot
export const DD_DW_DPSnapshot = sequelize.define(
  'DD_DW_DPSnapshot',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_WLId',
    },
    DWId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_WLId',
    },
    DPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_WLId',
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_DW_DPSnapshot.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DPSnapshot.belongsTo(DW, {
  as: 'DW',
  foreignKey: 'DWId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DPSnapshot.belongsTo(DP, {
  as: 'DP',
  foreignKey: 'DPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_GT_FGTesterSnapshot
export const DD_GT_FGTesterSnapshot = sequelize.define(
  'DD_GT_FGTesterSnapshot',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    FGTesterId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_GT_FGTesterSnapshot.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_FGTesterSnapshot.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_FGTesterSnapshot.belongsTo(FG_Tester, {
  as: 'FGTester',
  foreignKey: 'FGTesterId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_GT_WL
export const DD_GT_WL = sequelize.define(
  'DD_GT_WL',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_WLId',
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
    ZXNumber: {
      type: Sequelize.INTEGER,
    },
    AZGSId: {
      type: Sequelize.INTEGER,
    },
    AZGUserId: {
      type: Sequelize.INTEGER,
    },
    YJRKDate: {
      type: Sequelize.DATE,
    },
    YJZXDate: {
      type: Sequelize.DATE,
    },
    YJAZDate: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_GT_WL.prototype.toString = function () {
  return `[id: ${this.id}, DD_GT_WL: ${this.DDId}_${this.GTId}_${this.WLId}]`;
};

DD_GT_WL.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.belongsTo(WL, {
  as: 'WL',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.belongsTo(AZGS, {
  as: 'AZGS',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.belongsTo(User, {
  as: 'AZG',
  foreignKey: 'AZGUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.belongsTo(GYS, {
  as: 'GYS',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_DW_DP
export const DD_DW_DP = sequelize.define(
  'DD_DW_DP',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_DPId',
    },
    DWId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_DPId',
    },
    DPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_DWId_DPId',
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
    ZXNumber: {
      type: Sequelize.INTEGER,
    },
    AZGSId: {
      type: Sequelize.INTEGER,
    },
    AZGUserId: {
      type: Sequelize.INTEGER,
    },
    YJRKDate: {
      type: Sequelize.DATE,
    },
    YJZXDate: {
      type: Sequelize.DATE,
    },
    YJAZDate: {
      type: Sequelize.DATE,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_DW_DP.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DP.belongsTo(DW, {
  as: 'DW',
  foreignKey: 'DWId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DP.belongsTo(DP, {
  as: 'DP',
  foreignKey: 'DPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DP.belongsTo(AZGS, {
  as: 'AZGS',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DP.belongsTo(User, {
  as: 'AZG',
  foreignKey: 'AZGUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_GT_FGTester
export const DD_GT_FGTester = sequelize.define(
  'DD_GT_FGTester',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    FGTesterId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'DDId_GTId_FGTesterId',
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD_GT_FGTester.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_FGTester.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_FGTester.belongsTo(FG_Tester, {
  as: 'FGTester',
  foreignKey: 'FGTesterId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// DD_GTFX
export const DD_GTFX = sequelize.define(
  'DD_GTFX',
  {
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

DD.belongsToMany(GT, { through: 'DD_GTFX', as: 'FXGTs', foreignKey: 'DDId' });
GT.belongsToMany(DD, { through: 'DD_GTFX', as: 'FXDDs', foreignKey: 'GTId' });

// KDD
export const KDD = sequelize.define(
  'KDD',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

// KDX
export const KDX = sequelize.define(
  'KDX',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EWM: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    KDDId: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(KDXStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

KDX.belongsTo(KDD, {
  as: 'KDD',
  foreignKey: 'KDDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
KDD.hasMany(KDX, {
  as: 'KDXs',
  foreignKey: 'KDDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

KDX.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GT.hasMany(KDX, {
  as: 'KDXs',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// KDXCZ
export const KDXCZ = sequelize.define(
  'KDXCZ',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    KDXId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(KDXStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

KDXCZ.belongsTo(KDX, {
  as: 'KDX',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
KDX.hasMany(KDXCZ, {
  as: 'KDXCZs',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WYWL
export const WYWL = sequelize.define(
  'WYWL',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EWM: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WYWLStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GYSId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    DDGTWLId: {
      type: Sequelize.INTEGER,
    },
    WLBHId: {
      type: Sequelize.INTEGER,
    },
    KDXId: {
      type: Sequelize.INTEGER,
    },
    AZFKType: {
      type: Sequelize.STRING,
      validate: {
        enumCheck(val) {
          if (!Object.values(AZFKType).includes(val)) {
            throw new Error('非法安装反馈类型!');
          }
        },
      },
    },
    AZFKNote: {
      type: Sequelize.STRING,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WYWL.belongsTo(WL, {
  as: 'WL',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WL.hasMany(WYWL, {
  as: 'WYWLs',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

WYWL.belongsTo(GYS, {
  as: 'GYS',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GYS.hasMany(WYWL, {
  as: 'WYWLs',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

WYWL.belongsTo(DD_GT_WL, {
  as: 'DD_GT_WL',
  foreignKey: 'DDGTWLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_GT_WL.hasMany(WYWL, {
  as: 'WYWLs',
  foreignKey: 'DDGTWLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// todo: 建立和补货的关系

WYWL.belongsTo(KDX, {
  as: 'KDX',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
KDX.hasMany(WYWL, {
  as: 'WYWLs',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WYWLCZ
export const WYWLCZ = sequelize.define(
  'WYWLCZ',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    WYWLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WYWLStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WYWLCZ.belongsTo(WYWL, {
  as: 'WYWL',
  foreignKey: 'WYWLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WYWL.hasMany(WYWLCZ, {
  as: 'WYWLCZs',
  foreignKey: 'WYWLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WYDP
export const WYDP = sequelize.define(
  'WYDP',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EWM: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WYDPStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    DPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GYSId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    DDDWDPId: {
      type: Sequelize.INTEGER,
    },
    DPBHId: {
      type: Sequelize.INTEGER,
    },
    KDXId: {
      type: Sequelize.INTEGER,
    },
    AZFKType: {
      type: Sequelize.STRING,
      validate: {
        enumCheck(val) {
          if (!Object.values(AZFKType).includes(val)) {
            throw new Error('非法安装反馈类型!');
          }
        },
      },
    },
    AZFKNote: {
      type: Sequelize.STRING,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WYDP.belongsTo(DP, {
  as: 'DP',
  foreignKey: 'DPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DP.hasMany(WYDP, {
  as: 'WYDPs',
  foreignKey: 'DPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

WYDP.belongsTo(GYS, {
  as: 'GYS',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GYS.hasMany(WYDP, {
  as: 'WYDPs',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

WYDP.belongsTo(DD_DW_DP, {
  as: 'DD_DW_DP',
  foreignKey: 'DDDWDPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD_DW_DP.hasMany(WYDP, {
  as: 'WYDPs',
  foreignKey: 'DDDWDPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// todo: 建立和补货的关系

WYDP.belongsTo(KDX, {
  as: 'KDX',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
KDX.hasMany(WYDP, {
  as: 'WYDPs',
  foreignKey: 'KDXId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WYDPCZ
export const WYDPCZ = sequelize.define(
  'WYDPCZ',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    WYDPId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WYDPStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WYDPCZ.belongsTo(WYDP, {
  as: 'WYDP',
  foreignKey: 'WYDPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WYDP.hasMany(WYDPCZ, {
  as: 'WYDPCZs',
  foreignKey: 'WYDPId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WLQJFKT
export const WLQJFKT = sequelize.define(
  'WLQJFKT',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

// DPQJFKT
export const DPQJFKT = sequelize.define(
  'DPQJFKT',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    DDId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

// WLBH
export const WLBH = sequelize.define(
  'WLBH',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    GTId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    WLId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    DDId: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WLBHStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    note: {
      type: Sequelize.TEXT,
    },
    KFJLNote: {
      type: Sequelize.TEXT,
    },
    PPJLNote: {
      type: Sequelize.TEXT,
    },
    AZGSId: {
      type: Sequelize.INTEGER,
    },
    AZGUserId: {
      type: Sequelize.INTEGER,
    },
    GYSId: {
      type: Sequelize.INTEGER,
    },
    HBUUID: {
      type: Sequelize.UUID,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WLBH.belongsTo(GT, {
  as: 'GT',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GT.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'GTId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.belongsTo(WL, {
  as: 'WL',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WL.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'WLId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.belongsTo(DD, {
  as: 'DD',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
DD.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'DDId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.belongsTo(AZGS, {
  as: 'AZGS',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
AZGS.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'AZGSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.belongsTo(User, {
  as: 'AZG',
  foreignKey: 'AZGUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
User.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'AZGUserId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.belongsTo(GYS, {
  as: 'GYS',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
GYS.hasMany(WLBH, {
  as: 'WLBHs',
  foreignKey: 'GYSId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

// WLBHCZ
export const WLBHCZ = sequelize.define(
  'WLBHCZ',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    WLBHId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        enumCheck(val) {
          if (!Object.values(WLBHStatus).includes(val)) {
            throw new Error('非法状态名称!');
          }
        },
      },
    },
    UserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    version: true,
    freezeTableName: true,
  },
);

WLBHCZ.belongsTo(WLBH, {
  as: 'WLBH',
  foreignKey: 'WLBHId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});
WLBH.hasMany(WLBHCZ, {
  as: 'WLBHCZs',
  foreignKey: 'WLBHId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

User.likeSearch = () => ['JS', 'PPId', 'QY', 'username', 'GYSId', 'AZGSId'];

const initData = (str, num = 200) =>
  Array(num)
    .fill(0)
    .map((_, i) => ({ name: `${str}${i + 1}` }));

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

    // // 新建品牌
    // await PP.bulkCreate(initData('PP', 2));

    // // 新建供应商
    // await GYS.create({
    //   name: 'GYS1',
    //   isSC: true,
    //   isKC: true,
    // });
    // await GYS.create({
    //   name: 'GYS2',
    //   isSC: true,
    //   isKC: false,
    // });
    // await GYS.create({
    //   name: 'GYS3',
    //   isSC: false,
    //   isKC: true,
    // });

    // // 新建安装公司
    // await AZGS.bulkCreate(initData('AZGS', 2));

    // // 新建Admin
    // await User.create({
    //   username: 'admin',
    //   password: bCrypt.hashSync('1', 8),
    //   JS: JS.ADMIN,
    // });

    // // 新建品牌经理
    // let tmpPPJL = await User.create({
    //   username: 'PPJL1',
    //   password: bCrypt.hashSync('1', 8),
    //   JS: JS.PPJL,
    // });

    // let tmpPP = await PP.findOne({
    //   where: {
    //     name: 'PP1',
    //   },
    // });

    // tmpPP.setPPJLs([tmpPPJL]);

    // tmpPPJL = await User.create({
    //   username: 'PPJL2',
    //   password: bCrypt.hashSync('1', 8),
    //   JS: JS.PPJL,
    // });

    // tmpPP = await PP.findOne({
    //   where: {
    //     name: 'PP2',
    //   },
    // });

    // tmpPP.setPPJLs([tmpPPJL]);

    // // 新建客服经理
    // let tmpKFJL = await User.create({
    //   username: 'KFJL1',
    //   password: bCrypt.hashSync('1', 8),
    //   JS: JS.KFJL,
    // });

    // tmpPP = await PP.findOne({
    //   where: {
    //     name: 'PP1',
    //   },
    // });

    // tmpPP.setKFJLs([tmpKFJL]);

    // tmpKFJL = await User.create({
    //   username: 'KFJL2',
    //   password: bCrypt.hashSync('1', 8),
    //   JS: JS.KFJL,
    // });

    // tmpPP = await PP.findOne({
    //   where: {
    //     name: 'PP2',
    //   },
    // });

    // tmpPP.setKFJLs([tmpPPJL]);

    // await createUser(1, 20);
  } catch (err) {
    ppLog('init err:', err);
  }
};
