import { assert } from 'chai';
import Sequelize from 'sequelize';
import mysql from 'mysql2';
import axios from 'axios';
import debug from 'debug';
import fs from 'fs';
import _ from 'lodash';
const WerollApp = require('../weroll/App');
const werollApp = new WerollApp();

import {
  sequelize,
  JS,
  EWMType,
  DDStatus,
  User,
  PP,
  GT,
  GYS,
  ZHY_GYS,
  AZGS,
  AZG_AZGS,
  DP,
  DW,
  WL,
  FGTester,
  EJZH,
  EJZHXGT,
  YJZH,
  YJZHXGT,
  DD,
  DD_GT_WL,
  DD_GT_WLStatus,
  DD_DW_DP,
  DD_DW_DPStatus,
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
  DD_GT_WLSnapshot,
  DD_DW_DPSnapshot,
  PPJL_PP,
  KFJL_PP,
  QY,
  CS,
  GZ_PP,
  GYSType,
  GLY_AZGS,
  EJZH_FGTester,
  GLY_GYS,
  EJZH_SJWL,
  YJZH_EJZH,
  GT_YJZH,
  AZFKType,
  PP_GTFX,
  WLBH,
  WLBHStatus,
  DPBHStatus,
  HWType,
  DPBH,
  WLQJFKT,
  DPQJFKT,
} from '../models/Model';
import { it } from 'mocha';

const isArrayEqual = function (x, y) {
  return _(x)
    .differenceWith(y, _.isEqual)
    .isEmpty();
};

const readFile = (path, opts = 'utf8') =>
  new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });

const saveData = async (res) => {
  fs.writeFile(`${__dirname}/../tools_izz/APIResponse.json`, `${JSON.stringify(res, null, 2)}`, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('反馈参数格式生成!');
  });
};

const getToken = async (username, password) => {
  const r = await axios.post(`${baseUrl}/auth/signin`, {
    username,
    password,
  });
  return r.data.data.token;
};


const API_DESC = {};

const post = async (path, body, token) => {
  try {
    API_DESC[path] = {};
    const r = await axios.post(`${api}/${path}`, body, {
      headers: {
        Authorization: `bearer ${token}`,
      },
    });


    let deepCopyr = JSON.parse(JSON.stringify(r.data));

    if (deepCopyr.data === undefined) {
      API_DESC[path] = deepCopyr
    } else {
      if (deepCopyr.data.list === undefined) {
        API_DESC[path] = deepCopyr
      } else {
        deepCopyr.data.list = deepCopyr.data.list.slice(0, 1);
        API_DESC[path] = deepCopyr
      }
    }

    return r;
  } catch (err) {
    return err;
  }
};

const put = async (path, body, token) => {
  const r = await axios.put(`${api}/${path}`, body, {
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  let deepCopyr = JSON.parse(JSON.stringify(r.data))

  if (deepCopyr.data === undefined) {
    API_DESC[path] = deepCopyr
  } else {
    if (deepCopyr.data.list === undefined) {
      API_DESC[path] = deepCopyr
    } else {
      deepCopyr.data.list = deepCopyr.data.list.slice(0, 1);
      API_DESC[path] = deepCopyr
    }
  }

  return r;
};

const get = async (path, params, token) => {
  const r = await axios.get(`${api}/${path}`, {
    params,
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  let deepCopyr = JSON.parse(JSON.stringify(r.data));

  if (deepCopyr.data === undefined) {
    API_DESC[path] = deepCopyr
  } else {
    if (deepCopyr.data.list === undefined) {
      API_DESC[path] = deepCopyr
    } else {
      deepCopyr.data.list = deepCopyr.data.list.slice(0, 1);
      API_DESC[path] = deepCopyr
    }
  }

  return r;
};

const getUserIdList = (r) => {
  const userIdList = [];
  for (let i = 0; i < r.length; i++) {
    userIdList.push(r[i].dataValues.UserId);
  }

  return userIdList;
};

const replaceAll = (str, target, replacement) =>
  str.replace(new RegExp(target, 'g'), replacement);

process.env.NODE_ENV = 'test';
const server = require('../app');

const ppLog = debug('ppLog');
const baseUrl = 'http://localhost:3300';
const api = `${baseUrl}/api`;
let adminToken;
let PPJLToken;
let KFJLToken;
let GZToken;
let GTBAToken;
let GYSGLYToken;
let AZGSGLYToken;
let ZHYToken;
let AZGToken;
let API_DESC = {}; //存储调用API返回的参数

let scriptArr;

const initData = async () => {
  await sequelize.sync({ force: true });

  for (let i = 0; i < scriptArr.length; i++) {
    if (scriptArr[i].trim().length > 0) {
      const r = await sequelize.query(scriptArr[i], null, {
        raw: true,
        type: 'INSERT',
      });
    }
  }
};

const createViewAndProcedure = async () => {
  // 创建View
  const viewSql = await readFile(
    `${__dirname}/../tools/dbViewScript.sql`,
    'utf8',
  );
  await sequelize.query(viewSql, {
    type: sequelize.QueryTypes.SELECT,
  });
  // end 创建View

  // 创建Procedure
  const procedureSql = await readFile(`${__dirname}/../tools/dbProcedureScript.sql`);
  const procedureSql1 = replaceAll(
    procedureSql,
    '_DDStatus\\.DSP_',
    DDStatus.DSP,
  );
  const procedureSql2 = replaceAll(
    procedureSql1,
    '_DDStatus\\.YSP_',
    DDStatus.YSP,
  );
  const procedureSql3 = replaceAll(
    procedureSql,
    '_DD_GT_WLStatus\\.CS_',
    DD_GT_WLStatus.CS,
  );
  const procedureSql4 = replaceAll(
    procedureSql1,
    '_DD_DW_DPStatus\\.CS_',
    DD_DW_DPStatus.CS,
  );
  await sequelize.query(procedureSql2, {
    type: sequelize.QueryTypes.SELECT,
  });
  // end 创建创建Procedure
};

describe('SPRT测试', () => {
  before(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456'
    });

    //await con.connect();
    //await con.query('DROP DATABASE IF EXISTS cltp');
    //await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    //await sequelize.authenticate();

    const data = await readFile(`${__dirname}/../tools_izz/initDataScript_izz.sql`);
    scriptArr = data.split(';');

    await initData();
    await createViewAndProcedure();

    adminToken = await getToken('admin', '123456');
    PPJLToken = await getToken('PPJL1', '123456');
    KFJLToken = await getToken('KFJL1', '123456');
    GZToken = await getToken('GZ1', '123456');
    GTBAToken = await getToken('GTBA1', '123456');
    GYSGLYToken = await getToken('GYSGLY1', '123456');
    AZGSGLYToken = await getToken('AZGSGLY1', '123456');
    ZHYToken = await getToken('ZHY1', '123456');
    AZGToken = await getToken('AZG1', '123456');
  });

  after(async () => {
    await saveData(API_DESC);
  });

  beforeEach(async () => {
    await initData();
  });

  describe('test', async () => {
    it('small test', async () => {
      assert.equal(1, 1);
    });
  });

  // 格式说明git
  // describe('API名称', async () => {
  //   describe('成功', async () => {
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // 新建PP [ADMIN]
  describe('PP', async () => {
    describe('成功', async () => {
      it('admin新建PP', async () => {
        const name = 'PP_T';

        const response = await post(
          'PP',
          {
            name,
          },
          adminToken,
        );
        assert.equal(response.data.code, 1);

        const pp = await PP.findOne({ where: { name } });
        assert.notEqual(pp, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => {
        it('admin新建重复的PP', async () => {
          const name = 'PP1';

          const response = await post(
            'PP',
            {
              name,
            },
            adminToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
    });
  });

  // 新建PPJL [ADMIN]
  describe('/createPPJL', async () => {
    describe('成功', async () => {
      it('admin为品牌创建PPJL', async () => {
        const PPId = 7;
        const username = 'PPJL_T';
        const password = '123456';
        const response = await post(
          'createPPJL',
          {
            PPId,
            username,
            password,
          },
          adminToken,
        );
        assert.equal(response.data.code, 1);
        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await PPJL_PP.findAll({ where: { PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);
      });

      it('admin为已经创建过PPJL的PP再次创建PPJL', async () => {
        const PPId = 1;
        const username = 'PPJL_T1';
        const password = '123456';
        const response = await post(
          'createPPJL',
          {
            PPId,
            username,
            password,
          },
          adminToken,
        );
        assert.equal(response.data.code, 1);

        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await PPJL_PP.findAll({ where: { PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);

        const user1 = await User.findOne({ where: { username: 'PPJL1' } });
        assert.notInclude(userList, user1.dataValues.id);
      });
    });
    describe.skip('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 新建KFJL [PPJL]
  describe('/createKFJL', async () => {
    describe('成功', async () => {
      it('PPJL创建KFJL', async () => {
        let tempPPJLToken;
        await post(
          'createPPJL',
          {
            PPId: 7,
            username: 'PPJL_T',
            password: '123456',
          },
          adminToken,
        );
        tempPPJLToken = await getToken('PPJL_T', '123456');

        const PPId = 7;
        const username = 'KFJL_T';
        const password = '123456';

        const response = await post(
          'createKFJL',
          {
            PPId,
            username,
            password,
          },
          tempPPJLToken,
        );
        assert.equal(response.data.code, 1);
        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await KFJL_PP.findAll({ where: { PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);
      });

      it('PPJL为已经创建过KFJL的PP再次创建KFJL', async () => {
        const PPId = 1;
        const username = 'KFJL_T1';
        const password = '123456';

        const response = await post(
          'createKFJL',
          {
            PPId,
            username,
            password,
          },
          PPJLToken,
        );
        assert.equal(response.data.code, 1);
        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await KFJL_PP.findAll({ where: { PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);

        const user1 = await User.findOne({ where: { username: 'KFJL1' } });
        assert.notInclude(userList, user1.dataValues.id);
      }); // PP1的KFJL_T变成KFJL1
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的PP创建PPJL', async () => {
          const PPId = 7;
          const username = 'KFJL_T1';
          const password = '123456';

          const response = await post(
            'createKFJL',
            {
              PPId,
              username,
              password,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 新建GT, GTBA [KFJL]
  describe('/createGTWithGTBA', async () => {
    describe('成功', async () => {
      it('KFJL创建GT', async () => {
        const PPId = 1;
        const name = 'GT_T';
        const code = 'GT_T_code';
        const tmpQY = QY.EAST;
        const tmpCS = '上海';
        const response = await post(
          'createGTWithGTBA',
          {
            PPId,
            name,
            code,
            QY: tmpQY,
            CS: tmpCS,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt = await GT.findOne({ where: { name } });
        assert.notEqual(gt, null);

        const user = await User.findOne({
          where: { id: gt.dataValues.GTBAUserId },
        });
        assert.notEqual(user, null);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL为不属于自己管理的PP创建GT', async () => {
          const PPId = 2;
          const name = 'GT_T';
          const code = 'GT_T_code';
          const tmpQY = QY.EAST;
          const tmpCS = '上海';
          const response = await post(
            'createGTWithGTBA',
            {
              PPId,
              name,
              code,
              QY: tmpQY,
              CS: tmpCS,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 编辑柜台图 [KFJL]
  describe('/setGTImage', async () => {
    describe('成功', async () => {
      it('KFJL编辑GT图片', async () => {
        const GTId = 1;
        const imageUrl = 'imageUrl_T';
        const response = await post(
          'setGTImage',
          {
            id: GTId,
            imageUrl,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt = await GT.findOne({ where: { id: GTId } });
        assert.equal(gt.dataValues.imageUrl, imageUrl);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL编辑不属于自己管理的PP的GT图片', async () => {
          const GTId = 6;
          const imageUrl = 'imageUrl_T';
          const response = await post(
            'setGTImage',
            {
              id: GTId,
              imageUrl,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 创建 GZ [KFJL]
  describe('/createGZ', async () => {
    describe('成功', async () => {
      it('KFJL创建GZ', async () => {
        const PPId = 1;
        const username = 'GT_T';
        const password = '123456';
        const response = await post(
          'createGZ',
          {
            PPId,
            username,
            password,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await GZ_PP.findAll({ where: { PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL为不属于自己管理的PP创建GZ', async () => {
          const PPId = 2;
          const username = 'GT_T';
          const password = '123456';
          const response = await post(
            'createGZ',
            {
              PPId,
              username,
              password,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 配置 GZ 负责柜台 [KFJL]
  describe('/setGZGTs', async () => {
    describe('成功', async () => {
      it('KFJL为多个GT分配GZ', async () => {
        const GZId = 14;
        const GTIds = [1, 2];
        const response = await post(
          'setGZGTs',
          {
            GZUserId: GZId,
            GTIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt = await GT.findAll({ where: { GZUserId: GZId } });
        const GTIdList = [];
        for (let i = 0; i < gt.length; i++) {
          GTIdList.push(gt[i].dataValues.id);
        }
        for (const item of GTIds) {
          assert.include(GTIdList, item);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL为不属于自己管理的GT分配GZ', async () => {
          const GZId = 15;
          const GTIds = [6];
          const response = await post(
            'setGZGTs',
            {
              GZUserId: GZId,
              GTIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL为GT分配不属于自己管理的PP的GZ', async () => {
          const GZId = 16;
          const GTIds = [1, 2];
          const response = await post(
            'setGZGTs',
            {
              GZUserId: GZId,
              GTIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 新建GYS, GLY
  describe('/createGYSWithGLY', async () => {
    describe('成功', async () => {
      it('KFJ创建GYSGLY', async () => {
        const name = 'GYS_T';
        const username = 'GYSGLY_T';
        const password = '123456';
        const type = GYSType.SC;
        const response = await post(
          'createGYSWithGLY',
          {
            name,
            username,
            password,
            type,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);
        const gys = await GYS.findOne({ where: { name } });
        assert.notEqual(gys, null);

        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await GLY_GYS.findAll({
          where: { GYSId: gys.dataValues.id },
        });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);
      });
    });
    describe.skip('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 新建AZGS, GLY
  describe('/createAZGSWithGLY', async () => {
    describe('成功', async () => {
      it('KFJL创建AZGSGLY和AZGS', async () => {
        const name = 'AZGS_T';
        const username = 'AZGSGLY_T';
        const password = '123456';
        const response = await post(
          'createAZGSWithGLY',
          {
            name,
            username,
            password,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);
        const azgs = await AZGS.findOne({ where: { name } });
        assert.notEqual(azgs, null);

        const user = await User.findOne({ where: { username } });
        assert.notEqual(user, null);

        const r = await GLY_AZGS.findAll({
          where: { AZGSId: azgs.dataValues.id },
        });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);
      });
    });
    describe.skip('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 创建 DW [KFJL]
  describe('DW', async () => {
    describe('成功', async () => {
      it('KFJL新建DW', async () => {
        const name = 'DW_T';
        const GTId = 1;
        const CC = '100*100';
        const CZ = '铜板';

        const response = await post(
          'DW',
          {
            name,
            GTId,
            CC,
            CZ,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const dw = await DW.findOne({ where: { name } });
        assert.notEqual(dw, null);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的GT的DW', async () => {
          const name = 'DW_T';
          const GTId = 6;

          const response = await post(
            'DW',
            {
              name,
              GTId,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe('唯一性校验', async () => {
        it('KFJL创建GT已经存在的DW', async () => {
          const name = 'DW1';
          const GTId = 1;

          const response = await post(
            'DW',
            {
              name,
              GTId,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          // assert.include(response.data.msg, '没有权限');
        });
      });
    });
  });

  // 创建 DP [KFJL]
  describe('DP', async () => {
    describe('成功', async () => {
      it('KFJL创建DP', async () => {
        const name = 'DP_T';
        const PPId = 1;
        const GYSId = 1;

        const response = await post(
          'DP',
          {
            name,
            PPId,
            GYSId,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const dp = await DP.findOne({ where: { name } });
        assert.notEqual(dp, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL新建不属于自己管理的PP的DP', async () => {
          const name = 'DP_T';
          const PPId = 2;
          const GYSId = 1;

          const response = await post(
            'DP',
            {
              name,
              PPId,
              GYSId,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => {
        it('KFJL新建已经存在的DP', async () => {
          const name = 'DP1';
          const PPId = 1;
          const GYSId = 1;

          const response = await post(
            'DP',
            {
              name,
              PPId,
              GYSId,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
    });
  });

  // 配置 DP_DWs [KFJL]
  describe('/setDPDWs', async () => {
    describe('成功', async () => {
      it('KFJL将DP关联1个GT的多个DW', async () => {
        const DPId = 2;
        const DWIds = [1, 2];
        const response = await post(
          'setDPDWs',
          {
            id: DPId,
            DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DWIds) {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        }
      });

      it('KFJL将DP关联多个GT的DW', async () => {
        const DPId = 4;
        const DWIds = [6, 7];
        const response = await post(
          'setDPDWs',
          {
            id: DPId,
            DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DWIds) {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL配置不属于自己管理的PP的DP', async () => {
          const DPId = 5;
          const DWIds = [1];
          const response = await post(
            'setDPDWs',
            {
              id: DPId,
              DWIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL配置不属于自己管理的PP的DW', async () => {
          const DPId = 1;
          const DWIds = [8];
          const response = await post(
            'setDPDWs',
            {
              id: DPId,
              DWIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // KFJL 创建FGTester
  describe('/FGTester', async () => {
    describe('成功', async () => {
      it('KFJL创建FGTester', async () => {
        const name = 'FG_T';
        const PPId = 1;
        const response = await post(
          'FGTester',
          {
            PPId,
            name,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const fgtester = await FGTester.findOne({ where: { name } });
        assert.notEqual(fgtester, null);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL创建其他PP的FGTester', async () => {
          const name = 'FG_T';
          const PPId = 2;
          const response = await post(
            'FGTester',
            {
              PPId,
              name,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => {
        it('KFJL创建已经存在的FGTester', async () => {
          const name = 'FG1';
          const PPId = 1;
          const response = await post(
            'FGTester',
            {
              PPId,
              name,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
    });
  });

  //KFJL 创建WL
  describe('/WL', async () => {
    describe('成功', async () => {
      it('KFJL创建WL', async () => {
        const name = '三级物料';
        const code = '001';
        const level = '3';
        const PPId = 1;
        const GYSId = 1;
        const imageUrl = 'imageUrl';

        const response = await post(
          'WL',
          {
            name,
            code,
            level,
            PPId,
            GYSId,
            imageUrl,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const wl = await WL.findOne({ where: { name } });
        assert.notEqual(wl, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL创建其他PP的WL', async () => {
          const name = '三级物料';
          const code = '001';
          const level = '3';
          const PPId = 2;
          const GYSId = 1;
          const imageUrl = 'imageUrl';

          const response = await post(
            'WL',
            {
              name,
              code,
              level,
              PPId,
              GYSId,
              imageUrl,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 创建 EJZH id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
  describe('/createEJZH', async () => {
    describe('成功', async () => {
      it('KFJL创建不包含WL和FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 3;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [];
        const SJWLs = [];

        const response = await post(
          'createEJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_sjwl.length, 0);
      }); // WL和FGTester均没有

      it('KFJL创建仅包含FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 3;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          },
          {
            id: 2,
            number: 2,
          },
        ];
        const SJWLs = [];

        const response = await post(
          'createEJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_sjwl.length, 0);
      }); // 仅FGTesters

      it('KFJL创建仅包含SJWL的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 3;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTester = [];
        const SJWLs = [
          {
            id: 1,
            number: 2,
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            FGTester,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.notEqual(ejzh_sjwl.length, 0);
      }); // 仅SJWLs

      it('KFJL创建包含FGTester和SJWL的EJZH-1', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 3;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          },
          {
            id: 2,
            number: 2,
          },
        ];
        const SJWLs = [
          {
            id: 1,
            number: 2,
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_fg_tester.length, 2);

        const ejzh_sjwl = await EJZH_SJWL.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_sjwl.length, 1);
      }); // FGTesters&SJWLs

      it('KFJL创建包含FGTester和SJWL的EJZH-2', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 3;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          },
        ];
        const SJWLs = [
          {
            id: 1,
            number: 2,
          },
          {
            id: 2,
            number: 2,
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_fg_tester.length, 1);

        const ejzh_sjwl = await EJZH_SJWL.findAll({
          where: { EJZHId: ejzh.dataValues.id },
        });
        assert.equal(ejzh_sjwl.length, 2);
      }); // FGTesters&SJWLs
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {
        it('KFJL创建EJZH，选择SJWLId', async () => {
          const PPId = 1;
          const name = 'EJZH_T';
          const WLId = 1;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'createEJZH',
            {
              PPId,
              name,
              WLId,
              imageUrl,
              XGTs,
              FGTesters,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不是二级物料');
        });

        it('KFJL创建EJZH，关联EJWL', async () => {
          const PPId = 1;
          const name = 'EJZH_T';
          const WLId = 3;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const SJWLs = [
            {
              id: 3,
              number: 2,
            },
          ];

          const response = await post(
            'createEJZH',
            {
              PPId,
              name,
              WLId,
              imageUrl,
              XGTs,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的PP的EJZH', async () => {
          const PPId = 2;
          const name = 'EJZH_T';
          const WLId = 8;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'createEJZH',
            {
              PPId,
              name,
              WLId,
              imageUrl,
              XGTs,
              FGTesters,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL创建EJZH中EJWL不属于自己管理的PP', async () => {
          const PPId = 1;
          const name = 'EJZH_T';
          const WLId = 8;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'createEJZH',
            {
              PPId,
              name,
              WLId,
              imageUrl,
              XGTs,
              FGTesters,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // KFJL 编辑 EJZH
  describe('/editEJZH', async () => {
    describe('成功', async () => {
      it('KFJL编辑EJZH-将FGTester关联关系清空', async () => {
        const EJZHId = 2;
        const WLId = 3;
        const imageUrl = 'imageUrlEJZH1';
        const XGTs = ['EJZH1Url1'];
        const FGTesters = [];
        const SJWLs = [];

        const response = await post(
          'editEJZH',
          {
            id: EJZHId,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId },
        });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        assert.equal(ejzh_sjwl.length, 0);
      });

      it('KFJL编辑EJZH-修改EJWL&imageUrl&XGTs', async () => {
        const EJZHId = 2;
        const WLId = 4;
        const imageUrl = 'imageUrlEJZH_T1';
        const XGTs = ['EJZH1Url_T1'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          },
        ];
        const SJWLs = [];

        const response = await post(
          'editEJZH',
          {
            id: EJZHId,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { id: EJZHId } });
        assert.equal(ejzh.dataValues.WLId, WLId);
        assert.equal(ejzh.dataValues.imageUrl, imageUrl);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId },
        });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        assert.equal(ejzh_sjwl.length, 0);

        const ejzhxgt = await EJZHXGT.findOne({ where: { EJZHId } });
        assert.equal(ejzhxgt.dataValues.imageUrl, XGTs[0]);
      });

      it('KFJL编辑EJZH-新增一组FGTester&SJWL', async () => {
        const EJZHId = 3;
        const WLId = 3;
        const imageUrl = 'imageUrlEJZH1';
        const XGTs = ['EJZH1Url1'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          },
          {
            id: 2,
            number: 2,
          },
        ];
        const SJWLs = [
          {
            id: 1,
            number: 2,
          },
          {
            id: 2,
            number: 2,
          },
        ];

        const response = await post(
          'editEJZH',
          {
            id: EJZHId,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId },
        });
        const FGTesterIdList = [];
        for (const item of ejzh_fg_tester) {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        }
        assert.equal(FGTesterIdList.length, 2);
        for (const item of FGTesters) {
          assert.include(FGTesterIdList, item.id);
        }

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        const SJWLIdList = [];
        for (const item of ejzh_sjwl) {
          SJWLIdList.push(item.dataValues.WLId);
        }
        assert.equal(SJWLIdList.length, 2);
        for (const item of SJWLs) {
          assert.include(SJWLIdList, item.id);
        }
      });

      it('KFJL编辑EJZH-将原FGTester&SJWL修改成新的', async () => {
        const EJZHId = 3;
        const WLId = 3;
        const imageUrl = 'imageUrlEJZH_T1';
        const XGTs = ['EJZH1Url_T1'];
        const FGTesters = [
          {
            id: 2,
            number: 2,
          },
        ];
        const SJWLs = [
          {
            id: 2,
            number: 2,
          },
        ];

        const response = await post(
          'editEJZH',
          {
            id: EJZHId,
            WLId,
            imageUrl,
            XGTs,
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({
          where: { EJZHId },
        });
        const FGTesterIdList = [];
        for (const item of ejzh_fg_tester) {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        }
        assert.equal(FGTesterIdList.length, 1);
        for (const item of FGTesters) {
          assert.include(FGTesterIdList, item.id);
        }

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        const SJWLIdList = [];
        for (const item of ejzh_sjwl) {
          SJWLIdList.push(item.dataValues.WLId);
        }
        assert.equal(SJWLIdList.length, 1);
        for (const item of SJWLs) {
          assert.include(SJWLIdList, item.id);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL编辑不属于自己管理的EJZH', async () => {
          const EJZHId = 5;
          const WLId = 3;
          const imageUrl = 'imageUrlEJZH1';
          const XGTs = ['EJZH1Url1'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'editEJZH',
            {
              id: EJZHId,
              WLId,
              imageUrl,
              XGTs,
              FGTesters,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL编辑EJZH中的EJWL不属于自己管理的PP', async () => {
          const EJZHId = 1;
          const WLId = 8;
          const imageUrl = 'imageUrlEJZH1';
          const XGTs = ['EJZH1Url1'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'editEJZH',
            {
              id: EJZHId,
              WLId,
              imageUrl,
              XGTs,
              FGTesters,
              SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // KFJL 创建 YJZH
  describe('/createYJZH', async () => {
    describe('成功', async () => {
      it('KFJL创建YJZH-不包含EJZH', async () => {
        const PPId = 1;
        const name = 'YJZH_T';
        const WLId = 5;
        const imageUrl = 'imageUrlYJZH';
        const XGTs = ['YJZH1Url'];
        const EJZHs = [];

        const response = await post(
          'createYJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { name } });
        assert.notEqual(yjzh, null);

        const yjzh_ejzh = await YJZH_EJZH.findAll({
          where: { YJZHId: yjzh.dataValues.id },
        });
        assert.equal(yjzh_ejzh.length, 0);
      }); // 没有EJZH

      it('KFJL创建YJZH-包含多组EJZH', async () => {
        const PPId = 1;
        const name = 'YJZH_T';
        const WLId = 5;
        const imageUrl = 'imageUrlYJZH';
        const XGTs = ['YJZH1Url'];
        const EJZHs = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
            number: 2,
          },
        ];

        const response = await post(
          'createYJZH',
          {
            PPId,
            name,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { name } });
        assert.notEqual(yjzh, null);

        const yjzh_ejzh = await YJZH_EJZH.findAll({
          where: { YJZHId: yjzh.dataValues.id },
        });
        assert.notEqual(yjzh_ejzh, null);
      }); // EJZH1
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {
        it('KFJL创建YJZH，选择SJWLId', async () => {
          const PPId = 1;
          const name = 'YJZH_T';
          const WLId = 1;
          const imageUrl = 'imageUrlYJZH';
          const XGTs = ['YJZH1Url'];
          const EJZHs = [];

          const response = await post(
            'createYJZH',
            {
              PPId,
              name,
              WLId,
              imageUrl,
              XGTs,
              EJZHs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不是一级物料');
        });
      });
      describe.skip('没有权限', async () => { });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // KFJL 编辑 YJZH
  describe('/editYJZH', async () => {
    describe('成功', async () => {
      it('KFJL编辑YJZH-清空EJZH关联关系', async () => {
        const YJZHId = 2;
        const WLId = 5;
        const imageUrl = 'imageUrlYJZH1';
        const XGTs = ['YJZH1Url1'];
        const EJZHs = [];

        const response = await post(
          'editYJZH',
          {
            id: YJZHId,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findOne({ where: { YJZHId } });
        assert.equal(yjzh_ejzh, null);
      });

      it('KFJL编辑YJZH-修改YJWL&imageUrl&XGTs', async () => {
        const YJZHId = 1;
        const WLId = 6;
        const imageUrl = 'imageUrlYJZH_T1';
        const XGTs = ['YJZH1Url_T1'];
        const EJZHs = [
          {
            id: 1,
            number: 2,
          },
        ];

        const response = await post(
          'editYJZH',
          {
            id: YJZHId,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { id: YJZHId } });
        assert.equal(yjzh.dataValues.WLId, WLId);
        assert.equal(yjzh.dataValues.imageUrl, imageUrl);

        const yjzh_ejzh = await YJZH_EJZH.findOne({ where: { YJZHId } });
        assert.notEqual(yjzh_ejzh, null);

        const yjzhxgt = await YJZHXGT.findOne({ where: { YJZHId } });
        assert.equal(yjzhxgt.dataValues.imageUrl, XGTs[0]);
      });

      it('KFJL编辑YJZH-新增EJZH', async () => {
        const YJZHId = 1;
        const WLId = 5;
        const imageUrl = 'imageUrlYJZH2';
        const XGTs = ['YJZH1Url2'];
        const EJZHs = [
          {
            id: 1,
            number: 2,
          },
        ];

        const response = await post(
          'editYJZH',
          {
            id: YJZHId,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId } });

        const EJZHIdList = [];
        for (const item of yjzh_ejzh) {
          EJZHIdList.push(item.dataValues.EJZHId);
        }
        assert.equal(EJZHIdList.length, 1);
        for (const item of EJZHs) {
          assert.include(EJZHIdList, item.id);
        }
      });

      it('KFJL编辑YJZH-替换原EJZH', async () => {
        const YJZHId = 2;
        const WLId = 5;
        const imageUrl = 'imageUrlYJZH_T1';
        const XGTs = ['YJZH1Url_T1'];
        const EJZHs = [
          {
            id: 2,
            number: 2,
          },
        ];

        const response = await post(
          'editYJZH',
          {
            id: YJZHId,
            WLId,
            imageUrl,
            XGTs,
            EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId } });

        const EJZHIdList = [];
        for (const item of yjzh_ejzh) {
          EJZHIdList.push(item.dataValues.EJZHId);
        }
        assert.equal(EJZHIdList.length, 1);
        for (const item of EJZHs) {
          assert.include(EJZHIdList, item.id);
        }
      });
    });
    describe.skip('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 配置YJZH_GTs
  describe('/setYJZHGTs', async () => {
    describe('成功', async () => {
      it('KFJL将YJZH配置到GT', async () => {
        const YJZHId = 1;
        const GTs = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
            number: 2,
          },
        ];

        const response = await post(
          'setYJZHGTs',
          {
            id: YJZHId,
            GTs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt_yjzh = await GT_YJZH.findAll({ where: { YJZHId } });
        const GTIdList = [];
        for (const item of gt_yjzh) {
          GTIdList.push(item.dataValues.GTId);
        }
        assert.equal(GTIdList.length, 2);
        for (const item of GTs) {
          assert.include(GTIdList, item.id);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL将YJZH配置到不属于自己管理的GT', async () => {
          const YJZHId = 1;
          const GTs = [
            {
              id: 6,
              number: 2,
            },
            {
              id: 7,
              number: 2,
            },
          ];

          const response = await post(
            'setYJZHGTs',
            {
              id: YJZHId,
              GTs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL配置不属于自己管理的YJZH', async () => {
          const YJZHId = 4;
          const GTs = [
            {
              id: 1,
              number: 2,
            },
            {
              id: 2,
              number: 2,
            },
          ];

          const response = await post(
            'setYJZHGTs',
            {
              id: YJZHId,
              GTs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // KFJL 生成订单
  describe('/createDD', async () => {
    describe('成功', async () => {
      it('KFJL创建DD', async () => {
        const PPId = 1;
        const name = 'DD_PP1';

        const response = await post(
          'createDD',
          {
            PPId,
            name,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const dd = await DD.findOne({ where: { name } });
        assert.notEqual(dd, null);

        const dd_gt_wl = await DD_GT_WL.findAll({
          where: { DDId: dd.dataValues.id },
        });
        let ddgtwlList = [];
        ddgtwlList = dd_gt_wl.map(item => ({
          GTId: item.dataValues.GTId,
          WLId: item.dataValues.WLId,
          number: item.dataValues.number,
        }));
        const tureddgtwlList = [
          { GTId: 1, WLId: 5, number: 4 },
          { GTId: 1, WLId: 3, number: 8 },
          { GTId: 2, WLId: 5, number: 2 },
        ];
        assert.equal(isArrayEqual(ddgtwlList, tureddgtwlList), true);

        const dddwdp = await DD_DW_DP.findAll({
          where: { DDId: dd.dataValues.id },
        });
        let dddwdpList = [];
        dddwdpList = dddwdp.map(item => ({
          DWId: item.dataValues.DWId,
          DPId: item.dataValues.DPId,
        }));
        const truedddwdpList = [
          { DWId: 1, DPId: 1 },
          { DWId: 2, DPId: 1 },
          { DWId: 3, DPId: 4 },
          { DWId: 4, DPId: 1 },
          { DWId: 5, DPId: 2 },
          { DWId: 6, DPId: 3 },
        ];
        assert.equal(isArrayEqual(dddwdpList, truedddwdpList), true);
      });

      it('KFJL创建DD--GT配置与上次DD一致', async () => { });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的PP的DD', async () => {
          const PPId = 7;
          const name = 'DD_PP1';

          const response = await post(
            'createDD',
            {
              PPId,
              name,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('该品牌已有未审批通过订单', async () => {
          const KFJL2Token = await getToken('KFJL2', '123456');
          const PPId = 2;
          const name = 'DD_PP1';

          const response = await post(
            'createDD',
            {
              PPId,
              name,
            },
            KFJL2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '该品牌还有未审批通过的DD');
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 重新生成DD [KFJL]
  describe('/reCreateDD', async () => {
    describe('成功', async () => {
      it('KFJL重新生成DD', async () => {
        const KFJL2Token = await getToken('KFJL2', '123456');
        const DDId = 1;

        const response = await post(
          'reCreateDD',
          {
            DDId,
          },
          KFJL2Token,
        );
        assert.equal(response.data.code, 1);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe.skip('没有权限', async () => { });
      describe('操作状态不正确', async () => {
        it('KFJL重新生成已经审批通过的DD', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const DDId = 2;

          const response = await post(
            'reCreateDD',
            {
              DDId,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 设置PP_GTFXs [KFJL]
  describe('/setPPGTFXs', async () => {
    describe('成功', async () => {
      it('KFJL将GTFX', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const id = 3;
        const GTIds = [7];

        const response = await post(
          'setPPGTFXs',
          {
            id,
            GTIds,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL设置其他PP的GTFX', async () => {
          const id = 3;
          const GTIds = [7];

          const response = await post(
            'setPPGTFXs',
            {
              id,
              GTIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_GT_WL的AZGS [PPJL]
  describe('/setDDGTWLs0AZGS', async () => {
    describe('成功', async () => {
      it('PPJL配置DD_GT_WL的AZGS', async () => {
        const PPJL2Token = await getToken('PPJL2', '123456');
        const AZGSId = 1;
        const DD_GT_WLIds = [1, 2, 3];

        const response = await post(
          'setDDGTWLs0AZGS',
          {
            DD_GT_WLIds,
            AZGSId,
          },
          PPJL2Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_GT_WLIds) {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.AZGSId, AZGSId);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的DD配置AZGS', async () => {
          const AZGSId = 1;
          const DD_GT_WLIds = [1, 2, 3];

          const response = await post(
            'setDDGTWLs0AZGS',
            {
              DD_GT_WLIds,
              AZGSId,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL为已经审批通过的DD的WL配置AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const AZGSId = 2;
          const DD_GT_WLIds = [4, 5];

          const response = await post(
            'setDDGTWLs0AZGS',
            {
              DD_GT_WLIds,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不能指定安装公司');
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_DW_DP的AZGS[PPJL]
  describe('/setDDDWDPs0AZGS', async () => {
    describe('成功', async () => {
      it('PPJL配置DD_DW_DP的AZGS', async () => {
        const PPJL2Token = await getToken('PPJL2', '123456');
        const AZGSId = 1;
        const DD_DW_DPIds = [1, 2, 3];

        const response = await post(
          'setDDDWDPs0AZGS',
          {
            DD_DW_DPIds,
            AZGSId,
          },
          PPJL2Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_DW_DPIds) {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.AZGSId, AZGSId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的DD配置AZGS', async () => {
          const AZGSId = 1;
          const DD_DW_DPIds = [1, 2, 3];

          const response = await post(
            'setDDDWDPs0AZGS',
            {
              DD_DW_DPIds,
              AZGSId,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL为已经审批通过的DD配置AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const AZGSId = 2;
          const DD_DW_DPIds = [4, 5];

          const response = await post(
            'setDDDWDPs0AZGS',
            {
              DD_DW_DPIds,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不能指定安装公司');
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 审批通过DD [PPJL]
  describe('/approveDD', async () => {
    describe('成功', async () => {
      it('PPJL审批通过DD', async () => {
        const PPJL2Token = await getToken('PPJL2', '123456');
        const id = 1;

        const response = await post(
          'approveDD',
          {
            id,
          },
          PPJL2Token,
        );
        assert.equal(response.data.code, 1);

        const dd = await DD.findOne({ where: { id } });
        assert.equal(dd.dataValues.status, DDStatus.YSP);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL审批非自己管理的PP的DD', async () => {
          const id = 1;

          const response = await post(
            'approveDD',
            {
              id,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL审批审批通过的DD', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const id = 2;

          const response = await post(
            'approveDD',
            {
              id,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不能被审批');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_GT_WL的发货GYS [生产GYSGLY]
  describe('/setDDGTWLs0GYS', async () => {
    describe('成功', async () => {
      it('GYSGLY设置DD_GT_WL的发货GYS', async () => {
        const DD_GT_WLIds = [4, 5];
        const GYSId = 1;

        const response = await post(
          'setDDGTWLs0GYS',
          {
            DD_GT_WLIds,
            GYSId,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_GT_WLIds) {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.GYSId, GYSId);
        }
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GYSGLY设置不属于自己管理的DD_GT_WL的发货GYS', async () => {
          const DD_GT_WLIds = [6];
          const GYSId = 3;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('生产GYS1将DD_GT_WL分配给其他生产GYS2', async () => {
          const DD_GT_WLIds = [4];
          const GYSId = 2;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          console.log(
            '生产GYS1将DD_GT_WL分配给其他生产GYS2',
            response.data.msg,
          );
        });
      });
      describe('操作状态不正确', async () => {
        it('生产GYS1将DD_GT_WL分配给库存不足的中转GYS', async () => {
          const GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const DD_GT_WLIds = [3];
          const GYSId = 3;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          console.log(response.data.msg);
        });

        it('GYSGLY设置还未审批通过的DD的DD_GT_WL的发货GYS', async () => {
          const DD_GT_WLIds = [1, 2];
          const GYSId = 1;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY为已经分配过发货GYS的DD_GT_WL再次分配发货GYS', async () => {
          const GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const DD_GT_WLIds = [7];
          const GYSId = 3;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
        });

        it('GYSGLY设置装箱完成的DD_GT_WL的发货GYS', async () => {
          const DD_GT_WLIds = [20];
          const GYSId = 3;

          const response = await post(
            'setDDGTWLs0GYS',
            {
              DD_GT_WLIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_DW_DP的发货GYS [生产GYSGLY]
  describe('/setDDDWDPs0GYS', async () => {
    describe('成功', async () => {
      it('GYSGLY设置DD_DW_DP的发货GYS', async () => {
        const DD_DW_DPIds = [4, 5];
        const GYSId = 1;

        const response = await post(
          'setDDDWDPs0GYS',
          {
            DD_DW_DPIds,
            GYSId,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_DW_DPIds) {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.GYSId, GYSId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GYSGLY设置不属于自己管理的DD_DW_DP的发货GYS', async () => {
          const DD_DW_DPIds = [6];
          const GYSId = 3;

          const response = await post(
            'setDDDWDPs0GYS',
            {
              DD_DW_DPIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('GYSGLY设置还未审批通过的DD的DD_DW_DP的发货GYS', async () => {
          const DD_DW_DPIds = [1, 2];
          const GYSId = 1;

          const response = await post(
            'setDDDWDPs0GYS',
            {
              DD_DW_DPIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY为已经分配过发货GYS的DD_DW_DP再次分配发货GYS', async () => {
          const DD_DW_DPIds = [8];
          const GYSId = 3;

          const response = await post(
            'setDDDWDPs0GYS',
            {
              DD_DW_DPIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY设置装箱完成的DD_DW_DP的发货GYS', async () => {
          const DD_DW_DPIds = [30];
          const GYSId = 3;

          const response = await post(
            'setDDDWDPs0GYS',
            {
              DD_DW_DPIds,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_GT_WL的AZG [AZGSGLY]
  describe('/setDDGTWLs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY设置DD_GT_WL的AZG', async () => {
        const DD_GT_WLIds = [4, 5];
        const AZGUserId = 36;
        const YJAZDate = '2018-01-01';

        const response = await post(
          'setDDGTWLs0AZG',
          {
            DD_GT_WLIds,
            AZGUserId,
            YJAZDate,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_GT_WLIds) {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.AZGUserId, AZGUserId);
          assert.equal(ddgtwl.dataValues.YJAZDate, new Date(YJAZDate).getTime());
        }
      });

      it('AZGGLY设置装箱完成的DD_GT_WL的AZG', async () => {
        const DD_GT_WLIds = [11];
        const AZGUserId = 36;

        const response = await post(
          'setDDGTWLs0AZG',
          {
            DD_GT_WLIds,
            AZGUserId,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_GT_WLIds) {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.AZGUserId, AZGUserId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('AZGSGLY设置不属于自己管理的DD_GT_WL的AZG', async () => {
          const DD_GT_WLIds = [6];
          const AZGUserId = 36;

          const response = await post(
            'setDDGTWLs0AZG',
            {
              DD_GT_WLIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('AZGSGLY为DD_GT_WL设置不属于自己管理的AZG', async () => {
          const DD_GT_WLIds = [4, 5];
          const AZGUserId = 38;

          const response = await post(
            'setDDGTWLs0AZG',
            {
              DD_GT_WLIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZGSGLY为收货的DD_GT_WL设置AZG', async () => {
          const DD_GT_WLIds = [13];
          const AZGUserId = 37;

          const response = await post(
            'setDDGTWLs0AZG',
            {
              DD_GT_WLIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_DW_DP的AZG [AZGSGLY]
  describe('/setDDDWDPs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY设置DD_DW_DP的AZG', async () => {
        const DD_DW_DPIds = [4, 5];
        const AZGUserId = 36;
        const YJAZDate = '2018-01-01';

        const response = await post(
          'setDDDWDPs0AZG',
          {
            DD_DW_DPIds,
            AZGUserId,
            YJAZDate,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DD_DW_DPIds) {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.AZGUserId, AZGUserId);
          assert.equal(ddgtwl.dataValues.YJAZDate, new Date(YJAZDate).getTime());
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('AZGSGLY设置不属于自己管理的DD_DW_DP的AZG', async () => {
          const DD_DW_DPIds = [6];
          const AZGUserId = 36;

          const response = await post(
            'setDDDWDPs0AZG',
            {
              DD_DW_DPIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('AZGSGLY为DD_DW_DP设置不属于自己管理的AZG', async () => {
          const DD_DW_DPIds = [4, 5];
          const AZGUserId = 38;

          const response = await post(
            'setDDDWDPs0AZG',
            {
              DD_DW_DPIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZGSGLY为收货的DD_DW_DP设置AZG', async () => {
          const DD_DW_DPIds = [16];
          const AZGUserId = 37;

          const response = await post(
            'setDDDWDPs0AZG',
            {
              DD_DW_DPIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量入库WL [ZHY]
  describe('/piLiangRuKuWL', async () => {
    describe('成功', async () => {
      it('ZHY入库WL', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 1,
            uuid: '1_101',
          },
          {
            type: 'WL',
            typeId: 1,
            uuid: '1_102',
          },
        ];

        const response = await post(
          'piLiangRuKuWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.include(wywlczList, WYWLStatus.RK);
        }
      });

      it('ZHY入库从其他GYS转移过来的WL', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
        ];

        const response = await post(
          'piLiangRuKuWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.include(wywlczList, WYWLStatus.RK);
        }
      });

      it('ZHY入库其他GYS生产的WL', async () => {
        const ZHY3Token = await getToken('ZHY3', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
        ];

        const response = await post(
          'piLiangRuKuWL',
          {
            EWMs,
          },
          ZHY3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 2);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 32 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.include(wywlczList, WYWLStatus.RK);
        }
      });
    });

    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => {
        it('ZHY入库已经消库的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 12,
              uuid: '12_X3',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY入库已经装箱的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 14,
              uuid: '14_1',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY入库已经发货的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 17,
              uuid: '17_1',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY入库已经收箱的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 18,
              uuid: '18_1',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY入库已经装箱的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 19,
              uuid: '19_1',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY入库已经装箱的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 21,
              uuid: '21_1',
            },
          ];

          const response = await post(
            'piLiangRuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量出库WL [ZHY]
  describe('/piLiangChuKuWL', async () => {
    describe('成功', async () => {
      it('ZHY出库WL', async () => {
        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_2',
          },
        ];

        const response = await post(
          'piLiangChuKuWL',
          {
            EWMs,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.CK);
          assert.equal(wywl.dataValues.GYSId, 3);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 33 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlcz.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.RK, WYWLStatus.CK]);
        }
      });

      it('ZHY出库其他GYS的库存WL', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_2',
          },
        ];

        const response = await post(
          'piLiangChuKuWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.CK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.deepEqual(wywlczList, [WYWLStatus.CK]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => {
        it('ZHY出库已经消库的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 12,
              uuid: '12_X4',
            },
          ];

          const response = await post(
            'piLiangChuKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量消库WL [ZHY]
  describe('/piLiangXiaoKuWL', async () => {
    describe('成功', async () => {
      it('ZHY消库WL', async () => {
        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_2',
          },
        ];

        const response = await post(
          'piLiangXiaoKuWL',
          {
            EWMs,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.XK);
          assert.equal(wywl.dataValues.GYSId, 3);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 33 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          console.log(wywlczList);
          assert.equal(wywlcz.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.RK, WYWLStatus.XK]);
        }
      });

      it('ZHY消库其他GYS的库存WL', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_1',
          },
          {
            type: 'WL',
            typeId: 8,
            uuid: '8_2',
          },
        ];

        const response = await post(
          'piLiangXiaoKuWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.XK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlcz.length, 1);
          assert.include(wywlczList, WYWLStatus.XK);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => {
        it('ZHY消库已经装箱的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 14,
              uuid: '14_1',
            },
          ];

          const response = await post(
            'piLiangXiaoKuWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 订单批量装箱DDWL [ZHY]
  describe('/piLiangZhuangXiangDDWL', async () => {
    describe('成功', async () => {
      it('ZHY装箱DDWL', async () => {
        const DDId = 3;
        const GTId = 8;
        const WLEWMs = [
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_100',
          },
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_101',
          },
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_102',
          },
        ];
        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX_T',
        };

        const response = await post(
          'piLiangZhuangXiangDDWL',
          {
            DDId,
            GTId,
            WLEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({
          where: { WLId: WLEWMs[0].typeId },
        });
        assert.equal(ddgtwl.dataValues.ZXNumber, 4);
        assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.ZXWC);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);
        assert.equal(kdx.dataValues.GYSId, 1);

        for (const item of WLEWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.KDXId, kdx.dataValues.id);
          assert.equal(wywl.dataValues.status, WYWLStatus.ZX);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlcz.length, 2); // 未入库的物料直接装箱，系统先做入库操作，然后再装箱
          assert.include(wywlczList, WYWLStatus.ZX);
        }
      });

      it('ZHY装箱已经在其他GYS处入库的WL', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const DDId = 3;
        const GTId = 8;
        const WLEWMs = [
          {
            type: 'WL',
            typeId: 15,
            uuid: '15_5',
          },
        ];

        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX_T',
        };

        const response = await post(
          'piLiangZhuangXiangDDWL',
          {
            DDId,
            GTId,
            WLEWMs,
            KDXEWM,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({
          where: { WLId: WLEWMs[0].typeId },
        });
        assert.equal(ddgtwl.dataValues.ZXNumber, 2);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);

        for (const item of WLEWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.KDXId, kdx.dataValues.id);
          assert.equal(wywl.dataValues.status, WYWLStatus.ZX);
          assert.equal(wywl.dataValues.GYSId, 3);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 33 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1); // 已入A库的物料，B直接装箱
          assert.include(wywlczList, WYWLStatus.ZX);
        }
      });

      it('ZHY往已经装过WL的箱子中添加WL', async () => {
        const DDId = 3;
        const GTId = 8;
        const WLEWMs = [
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_100',
          },
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_101',
          },
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_102',
          },
        ];
        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX1',
        };

        const response = await post(
          'piLiangZhuangXiangDDWL',
          {
            DDId,
            GTId,
            WLEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({
          where: { WLId: WLEWMs[0].typeId },
        });
        assert.equal(ddgtwl.dataValues.ZXNumber, 4);
        assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.ZXWC);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);

        for (const item of WLEWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.KDXId, kdx.dataValues.id);
          assert.equal(wywl.dataValues.status, WYWLStatus.ZX);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.RK, WYWLStatus.ZX]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY装箱不属于自己的DD_GT_WL任务的WL', async () => {
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 15,
              uuid: '15_100',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不属于');
        });

        it('ZHY装箱同一DD发往不同GT的WL', async () => {
          const ZHY4Token = await getToken('ZHY4', '123456');
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 15,
              uuid: '15_100',
            },
            {
              type: 'WL',
              typeId: 29,
              uuid: '29_100',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不属于');
        });

        it('ZHY将同一DD中GT1的WL装入GT2的箱子中', async () => {
          const ZHY4Token = await getToken('ZHY4', '123456');
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 29,
              uuid: '29_100',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX20',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          console.log('ZHY将同一DD中GT1的WL装入GT2的箱子中', response.data.msg);
          // assert.include(response.data.msg, '不属于');
        });

        it('ZHY将WL装入装DP的箱子中', async () => {
          const ZHY4Token = await getToken('ZHY4', '123456');
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 29,
              uuid: '29_100',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX9',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          console.log('ZHY将WL装入装DP的箱子中', response.data.msg);
        });
      });

      describe('操作状态不正确', async () => {
        it('ZHY装箱已经装箱的WL', async () => {
          const ZHY4Token = await getToken('ZHY4', '123456');
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 14,
              uuid: '14_1',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY装箱已经装满的DD_GT_WL任务', async () => {
          const ZHY3Token = await getToken('ZHY3', '123456');
          const DDId = 3;
          const GTId = 8;
          const WLEWMs = [
            {
              type: 'WL',
              typeId: 16,
              uuid: '16_100',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDWL',
            {
              DDId,
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '限额');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 订单批量装箱DDDP [ZHY]
  describe('/piLiangZhuangXiangDDDP', async () => {
    describe('成功', async () => {
      it('ZHY装箱DDDP', async () => {
        const DDId = 3;
        const GTId = 8;
        const DPEWMs = [
          {
            type: 'DP',
            typeId: 12,
            uuid: '12_100',
            DWId: 15,
            name: 'DW15',
            CC: '100*100',
            CZ: '铜板',
          },
        ];
        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX_T',
        };

        const response = await post(
          'piLiangZhuangXiangDDDP',
          {
            DDId,
            GTId,
            DPEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const dddwdp = await DD_DW_DP.findOne({
          where: { DPId: DPEWMs[0].DWId },
        });
        assert.equal(dddwdp.dataValues.ZXNumber, 1);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);
        assert.equal(kdx.dataValues.GYSId, 1);

        for (const item of DPEWMs) {
          const wydp = await WYDP.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wydp, null);
          assert.equal(wydp.dataValues.KDXId, kdx.dataValues.id);
          assert.equal(wydp.dataValues.status, WYDPStatus.ZX);
          assert.equal(wydp.dataValues.GYSId, 1);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, UserId: 30 },
          });
          const wydpczList = wydpcz.map(item => item.dataValues.status);
          assert.equal(wydpczList.length, 1);
          assert.deepEqual(wydpczList, [WYDPStatus.ZX]);
        }
      });

      it('ZHY装箱DDDP--EWM中的CZ和CC与DW实际不一致', async () => {
        const DDId = 3;
        const GTId = 8;
        const DPEWMs = [
          {
            type: 'DP',
            typeId: 12,
            uuid: '12_100',
            DWId: 15,
            name: 'DW15',
            CC: '300*300',
            CZ: '铜板_T',
          },
        ];
        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX_T',
        };

        const response = await post(
          'piLiangZhuangXiangDDDP',
          {
            DDId,
            GTId,
            DPEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const dddwdp = await DD_DW_DP.findOne({
          where: { DPId: DPEWMs[0].DWId },
        });
        assert.equal(dddwdp.dataValues.ZXNumber, 1);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);

        for (const item of DPEWMs) {
          const wydp = await WYDP.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wydp, null);
          assert.equal(wydp.dataValues.KDXId, kdx.dataValues.id);
          assert.equal(wydp.dataValues.status, WYDPStatus.ZX);
          assert.equal(wydp.dataValues.GYSId, 1);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, UserId: 30 },
          });
          const wydpczList = wydpcz.map(item => item.dataValues.status);
          assert.equal(wydpczList.length, 1);
          assert.deepEqual(wydpczList, [WYDPStatus.ZX]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY装箱不属于自己的DDDP任务的DP', async () => {
          let ZHY4Token = await getToken('ZHY4', '123456');
          const DDId = 3;
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 12,
              uuid: '12_100',
              DWId: 15,
              name: 'DW15',
              CC: '100*100',
              CZ: '铜板',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDDP',
            {
              DDId,
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '供应商');
        });

        it('ZHY装箱同一DD发往不同GT的DP', async () => {
          const DDId = 3;
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 12,
              uuid: '12_100',
              DWId: 15,
              name: 'DW15',
              CC: '100*100',
              CZ: '铜板',
            },
            {
              type: 'DP',
              typeId: 12,
              uuid: '12_100',
              DWId: 44,
              name: 'DW44',
              CC: '100*100',
              CZ: '铜板',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDDP',
            {
              DDId,
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '柜台');
        });

        it('ZHY将同一DD中GT1的DP装入GT2的箱子中', async () => {
          const DDId = 3;
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 12,
              uuid: '12_100',
              DWId: 44,
              name: 'DW44',
              CC: '100*100',
              CZ: '铜板',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX9',
          };

          const response = await post(
            'piLiangZhuangXiangDDDP',
            {
              DDId,
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '柜台');
        });

        it('ZHY将DP装入装WL的箱子中', async () => {
          const DDId = 3;
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 12,
              uuid: '12_100',
              DWId: 15,
              name: 'DW15',
              CC: '100*100',
              CZ: '铜板',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX1',
          };

          const response = await post(
            'piLiangZhuangXiangDDDP',
            {
              DDId,
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '灯片');
        });
      });
      describe('操作状态不正确', async () => {
        it('ZHY装箱已经装满的DD_DW_DP任务', async () => {
          let ZHY3Token = await getToken('ZHY3', '123456');
          const DDId = 3;
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 14,
              uuid: '14_100',
              DWId: 17,
              name: 'DW17',
              CC: '100*100',
              CZ: '铜板',
            },
          ];
          const KDXEWM = {
            type: 'KDX',
            uuid: 'KDX_T',
          };

          const response = await post(
            'piLiangZhuangXiangDDDP',
            {
              DDId,
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '任务超限');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量装箱BHWL [ZHY]
  describe('/piLiangZhuangXiangBuHuoWL', async () => {
    describe('成功', async () => {
      it('ZHY装箱WLBH', async () => {
        const YJZXTime = '2018-10-10';
        const GTId = 7;
        const WLEWMs = [
          { type: 'WL', typeId: 10, uuid: 'B10_100' },
          { type: 'WL', typeId: 10, uuid: 'B10_101' },
        ];
        const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

        const response = await post(
          'piLiangZhuangXiangBuHuoWL',
          {
            YJZXTime: new Date(YJZXTime).getTime(),
            GTId,
            WLEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);
        assert.equal(kdx.dataValues.GYSId, 1);

        for (const item of WLEWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wywl, null);
          assert.equal(wywl.dataValues.status, WYWLStatus.ZX);
          assert.equal(wywl.dataValues.GYSId, 1);
          assert.equal(wywl.dataValues.KDXId, kdx.dataValues.id);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 30 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.RK, WYWLStatus.ZX]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY装不属于自己的WLBH任务', async () => {
          const YJZXTime = '2018-10-10';
          const GTId = 8;
          const WLEWMs = [{ type: 'WL', typeId: 16, uuid: 'B16_100' }];
          const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

          const response = await post(
            'piLiangZhuangXiangBuHuoWL',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          console.log('ZHY装不属于自己的WLBH任务', response.data.msg);
        });
      });
      describe('操作状态不正确', async () => {
        it('ZHY将WLBH装入DD_GT_WL的箱子中', async () => {
          const YJZXTime = '2018-10-10';
          const GTId = 7;
          const WLEWMs = [{ type: 'WL', typeId: 10, uuid: 'B10_100' }];
          const KDXEWM = { type: 'KDX', uuid: 'KDX1' };

          const response = await post(
            'piLiangZhuangXiangBuHuoWL',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('ZHY装箱已经装满的WLBH任务', async () => {
          const YJZXTime = '2018-01-04';
          const GTId = 7;
          const WLEWMs = [{ type: 'WL', typeId: 10, uuid: 'B10_100' }];
          const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

          const response = await post(
            'piLiangZhuangXiangBuHuoWL',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('ZHY将GT1的WL装入GT2的快递箱中', async () => {
          const YJZXTime = '2018-01-04';
          const GTId = 8;
          const WLEWMs = [{ type: 'WL', typeId: 10, uuid: 'B10_100' }];
          const KDXEWM = { type: 'KDX', uuid: 'KDX25' };

          const response = await post(
            'piLiangZhuangXiangBuHuoWL',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              WLEWMs,
              KDXEWM,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '柜台');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量装箱BHDP [ZHY] 
  describe('/piLiangZhuangXiangBuHuoDP', async () => {
    describe('成功', async () => {
      it('ZHY装箱BHDP', async () => {
        const YJZXTime = '2018-10-10';
        const GTId = 7;
        const DPEWMs = [
          { type: 'DP', typeId: 8, uuid: 'B8_100', DWId: 11, name: 'DW11', CC: '100*100', CZ: '铜板' },
          { type: 'DP', typeId: 8, uuid: 'B8_101', DWId: 11, name: 'DW11', CC: '100*100', CZ: '铜板' },
        ];
        const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

        const response = await post(
          'piLiangZhuangXiangBuHuoDP',
          {
            YJZXTime: new Date(YJZXTime).getTime(),
            GTId,
            DPEWMs,
            KDXEWM,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(KDXEWM) },
        });
        assert.notEqual(kdx, null);

        for (const item of DPEWMs) {
          const wydp = await WYDP.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.notEqual(wydp, null);
          assert.equal(wydp.dataValues.status, WYDPStatus.ZX);
          assert.equal(wydp.dataValues.GYSId, 1);
          assert.equal(wydp.dataValues.KDXId, kdx.dataValues.id);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, UserId: 30 },
          });
          assert.notEqual(wydpcz, null);
          const wydpczList = wydpcz.map(item => item.dataValues.status);
          assert.equal(wydpczList.length, 1);
          assert.deepEqual(wydpczList, [WYDPStatus.ZX]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY装不属于自己的DPBH任务', async () => {
          let ZHY4Token = await getToken('ZHY4', '123456');
          const YJZXTime = '2018-10-10';
          const GTId = 7;
          const DPEWMs = [
            { type: 'DP', typeId: 8, uuid: 'B8_100', DWId: 11, name: 'DW1', CC: '100*100', CZ: '铜板' },
            { type: 'DP', typeId: 8, uuid: 'B8_101', DWId: 11, name: 'DW1', CC: '100*100', CZ: '铜板' },
          ];
          const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

          const response = await post(
            'piLiangZhuangXiangBuHuoDP',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '供应商');
        });
      });
      describe('操作状态不正确', async () => {
        it('ZHY将WLBH装入DD_DW_DP的箱子中', async () => {
          let ZHY3Token = await getToken('ZHY3', '123456');
          const YJZXTime = '2018-10-10';
          const GTId = 8;
          const DPEWMs = [
            { type: 'DP', typeId: 14, uuid: 'B14_100', DWId: 17, name: 'DW3', CC: '200*200', CZ: '铜板' },
            { type: 'DP', typeId: 14, uuid: 'B14_101', DWId: 17, name: 'DW3', CC: '200*200', CZ: '铜板' },
          ];
          const KDXEWM = { type: 'KDX', uuid: 'KDX9' };

          const response = await post(
            'piLiangZhuangXiangBuHuoDP',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          // assert.include(response.data.msg, '');
        });

        it('ZHY装箱已经装满的DPBH任务', async () => {
          let ZHY3Token = await getToken('ZHY3', '123456');
          const YJZXTime = '2018-01-11';
          const GTId = 8;
          const DPEWMs = [
            { type: 'DP', typeId: 14, uuid: 'B14_100', DWId: 17, name: 'DW3', CC: '200*200', CZ: '铜板' },
            { type: 'DP', typeId: 14, uuid: 'B14_101', DWId: 17, name: 'DW3', CC: '200*200', CZ: '铜板' },
          ];
          const KDXEWM = { type: 'KDX', uuid: 'KDX_T' };

          const response = await post(
            'piLiangZhuangXiangBuHuoDP',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '补货需求');
        });

        it('ZHY将GT1的装入GT2的快递箱中', async () => {
          let ZHY3Token = await getToken('ZHY3', '123456');
          const YJZXTime = '2018-01-04';
          const GTId = 8;
          const DPEWMs = [
            {
              type: 'DP',
              typeId: 14,
              uuid: 'B14_100',
              DWId: 17,
              name: 'DW3',
              CC: '200*100',
              CZ: '铜板'
            },
          ];
          const KDXEWM = { type: 'KDX', uuid: 'KDX40' };

          const response = await post(
            'piLiangZhuangXiangBuHuoDP',
            {
              YJZXTime: new Date(YJZXTime).getTime(),
              GTId,
              DPEWMs,
              KDXEWM,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '柜台');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 出箱WL [ZHY]
  describe('/chuXiangWL', async () => {
    describe('成功', async () => {
      it('ZHY出箱WL', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 14,
            uuid: '14_1',
          },
        ];

        const response = await post(
          'chuXiangWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (let item of EWMs) {
          const wywl = await WYWL.findOne({ where: { EWM: JSON.stringify(item) } });
          assert.equal(wywl.dataValues.DDGTWLId, null);
          const ddgtwl = await DD_GT_WL.findOne({ where: { WLId: wywl.dataValues.WLId } });
          assert.equal(ddgtwl.dataValues.ZXNumber, 0);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, status: WYWLStatus.RK },
          });
          assert.notEqual(wywlcz, null);
          for (const item of wywlcz) {
            assert.equal(item.dataValues.UserId, 30);
          }
        }
      });

      it('ZHY出箱WL--原DDGTWL装箱完成', async () => {
        let ZHY3Token = await getToken('ZHY3', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 16,
            uuid: '16_1',
          },
        ];

        const response = await post(
          'chuXiangWL',
          {
            EWMs,
          },
          ZHY3Token,
        );
        assert.equal(response.data.code, 1);

        for (let item of EWMs) {
          const wywl = await WYWL.findOne({ where: { EWM: JSON.stringify(item) } });
          assert.equal(wywl.dataValues.DDGTWLId, null);
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: 10 } });
          assert.equal(ddgtwl.dataValues.ZXNumber, 3);
          assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.YFPFHGYS);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 2);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, status: WYWLStatus.RK },
          });
          assert.notEqual(wywlcz, null);
          for (const item of wywlcz) {
            assert.equal(item.dataValues.UserId, 32);
          }
        }
      });

      it('ZHY出箱WL--原BHWL装箱完成', async () => {
        const EWMs = [
          {
            type: 'WL',
            typeId: 14,
            uuid: 'B14_2',
          },
        ];

        const response = await post(
          'chuXiangWL',
          {
            EWMs,
          },
          ZHYToken,
        );
        assert.equal(response.data.code, 1);

        for (let item of EWMs) {
          const wywl = await WYWL.findOne({ where: { EWM: JSON.stringify(item) } });
          assert.equal(wywl.dataValues.WLBHId, null);
          const wlbh = await WLBH.findOne({ where: { id: 10 } });
          assert.equal(wlbh.dataValues.ZXNumber, 0);
          assert.equal(wlbh.dataValues.status, DD_GT_WLStatus.YFPFHGYS);
          assert.equal(wywl.dataValues.status, WYWLStatus.RK);
          assert.equal(wywl.dataValues.GYSId, 1);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, status: WYWLStatus.RK },
          });
          assert.notEqual(wywlcz, null);
          for (const item of wywlcz) {
            assert.equal(item.dataValues.UserId, 30);
          }
        }
      });
    });

    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY出箱不属于自己DD_GT_WL的任务的WL', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 15,
              uuid: '15_1',
            },
          ];

          const response = await post(
            'chuXiangWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不在当前用户所属');
        });

        it('ZHY出箱WL和DP', async () => {
          const ZHY3Token = await getToken('ZHY3', '123456');
          const EWMs = [
            {
              type: 'WL',
              typeId: 17,
              uuid: '17_1',
            },
            {
              type: 'DP',
              typeId: 16,
              uuid: '16_1',
              DWId: 19,
              name: 'DW5',
              CZ: '200*100',
              CC: '铜板',
            },
          ];

          const response = await post(
            'chuXiangWL',
            {
              EWMs,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          console.log('ZHY出箱WL和DP', response.data.msg);
          assert.include(response.data.msg, 'type');
        });
      });
      describe('操作状态不正确', async () => {
        it('ZHY出箱已经发货的WL', async () => {
          const ZHY3Token = await getToken('ZHY3', '123456');
          const EWMs = [
            {
              type: 'WL',
              typeId: 17,
              uuid: '17_1',
            },
          ];

          const response = await post(
            'chuXiangWL',
            {
              EWMs,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('ZHY出箱入库的WL', async () => {
          const ZHY4Token = await getToken('ZHY4', '123456');
          const EWMs = [
            {
              type: 'WL',
              typeId: 15,
              uuid: '15_2',
            },
          ];

          const response = await post(
            'chuXiangWL',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 出箱DP [ZHY] 
  describe('/chuXiangDP', async () => {
    describe('成功', async () => {
      it('ZHY出箱DP', async () => {
        let ZHY3Token = await getToken('ZHY3', '123456');
        const EWMs = [
          {
            "type": "DP",
            "typeId": 16,
            "uuid": "16_1",
            "DWId": 19,
            "name": "DW5",
            "CZ": "200*100",
            "CC": "铜板"
          },
        ];

        const response = await post(
          'chuXiangDP',
          {
            EWMs,
          },
          ZHY3Token,
        );
        assert.equal(response.data.code, 1);

        for (let item of EWMs) {
          const wydp = await WYDP.findOne({ where: { EWM: JSON.stringify(item) } });
          assert.equal(wydp, null);
          const dddwdp = await DD_DW_DP.findOne({ where: { DWId: item.DWId } });
          assert.equal(dddwdp.dataValues.ZXNumber, 0);
          assert.equal(dddwdp.dataValues.status, DD_DW_DPStatus.YFPFHGYS);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY出箱WL和DP', async () => {
          const ZHY3Token = await getToken('ZHY3', '123456');
          const EWMs = [
            {
              type: 'WL',
              typeId: 17,
              uuid: '17_1',
            },
            {
              type: 'DP',
              typeId: 16,
              uuid: '16_1',
              DWId: 19,
              name: 'DW5',
              CZ: '200*100',
              CC: '铜板',
            },
          ];

          const response = await post(
            'chuXiangDP',
            {
              EWMs,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, 'type');
        });
      });
      describe('操作状态不正确', async () => {
        it('ZHY出箱已经发货的DP', async () => {
          let ZHY3Token = await getToken('ZHY3', '123456');
          const EWMs = [
            {
              "type": "DP",
              "typeId": 17,
              "uuid": "17_1",
              "DWId": 20,
              "name": "DW6",
              "CZ": "200*100",
              "CC": "铜板"
            },
          ];

          const response = await post(
            'chuXiangDP',
            {
              EWMs,
            },
            ZHY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 关联快递 [ZHY]
  describe('/guanLianKuaiDi', async () => {
    describe('成功', async () => {
      it('ZHY关联快递', async () => {
        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX1',
          },
          {
            type: 'KDX',
            uuid: 'KDX9',
          },
        ];
        const KDDCode = 'KDD_T';

        const response = await post(
          'guanLianKuaiDi',
          {
            EWMs,
            KDDCode,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdd = await KDD.findOne({ where: { code: KDDCode } });
        assert.notEqual(kdd, null);

        for (let item of EWMs) {
          if (item == EWMs[0]) {
            const kdx = await KDX.findOne({
              where: { EWM: JSON.stringify(item) },
            });
            assert.equal(kdx.dataValues.status, KDXStatus.FH);
            assert.equal(kdx.dataValues.GYSId, 2);

            const wywl = await WYWL.findAll({
              where: { KDXId: kdx.dataValues.id },
            });
            const wywlList = wywl.map(item => ({
              id: item.dataValues.id,
              status: item.dataValues.status,
            }));

            for (const item of wywlList) {
              assert.equal(item.status, WYWLStatus.FH);

              const wywlcz = await WYWLCZ.findAll({
                where: { WYWLId: item.id, status: WYWLStatus.FH },
              });
              assert.notEqual(wywlcz, null);
              assert.equal(wywlcz.length, 1);
              assert.equal(wywlcz[0].dataValues.UserId, 33);
            }
          } else {
            const kdx = await KDX.findOne({
              where: { EWM: JSON.stringify(item) },
            });
            assert.equal(kdx.dataValues.status, KDXStatus.FH);
            assert.equal(kdx.dataValues.GYSId, 2);

            const wydp = await WYDP.findAll({
              where: { KDXId: kdx.dataValues.id },
            });
            const wydpList = wydp.map(item => ({
              id: item.dataValues.id,
              status: item.dataValues.status,
            }));

            for (const item of wydpList) {
              assert.equal(item.status, WYDPStatus.FH);

              const wydpcz = await WYDPCZ.findAll({
                where: { WYDPId: item.id, status: WYDPStatus.FH },
              });
              assert.notEqual(wydpcz, null);
              assert.equal(wydpcz.length, 1);
              assert.equal(wydpcz[0].dataValues.UserId, 33);
            }
          }
        }
      });

      it('ZHY往已经关联过快递箱的KDD中添加箱子', async () => {
        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX1',
          },
        ];
        const KDDCode = 'KDD27';

        const response = await post(
          'guanLianKuaiDi',
          {
            EWMs,
            KDDCode,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdd = await KDD.findOne({ where: { code: KDDCode } });
        assert.notEqual(kdd, null);

        for (const item of EWMs) {
          const kdx = await KDX.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(kdx.dataValues.status, KDXStatus.FH);

          const wywl = await WYWL.findAll({
            where: { KDXId: kdx.dataValues.id },
          });
          const wywlList = wywl.map(item => ({
            id: item.dataValues.id,
            status: item.dataValues.status,
          }));

          for (const item of wywlList) {
            assert.equal(item.status, WYWLStatus.FH);

            const wywlcz = await WYWLCZ.findAll({
              where: { WYWLId: item.id, status: WYWLStatus.FH },
            });
            assert.notEqual(wywlcz, null);
            assert.equal(wywlcz.length, 1);
            assert.equal(wywlcz[0].dataValues.UserId, 33);
          }
        }
      });

      it('ZHY关联快递--箱子中包含丢失的WL', async () => {
        const DDId = 3;
        const GTId = 8;
        const WYWLPayloads = [
          {
            id: 14,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrl',
          },
        ];

        let test = await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          AZGToken,
        );

        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX1',
          },
        ];
        const KDDCode = 'KDD_T';

        const response = await post(
          'guanLianKuaiDi',
          {
            EWMs,
            KDDCode,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdd = await KDD.findOne({ where: { code: KDDCode } });
        assert.notEqual(kdd, null);

        const wywlcz = await WYWLCZ.findOne({
          where: { WYWLId: WYWLPayloads[0].id },
        });
        assert.notEqual(wywlcz, null);
        assert.equal(wywlcz.dataValues.status, WYWLStatus.ZX);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY关联不属于自己的DD_GT_WL任务的KDX', async () => {
          let ZHY4Token = await getToken('ZHY4', '123456');
          const EWMs = [
            {
              type: 'KDX',
              uuid: 'KDX1',
            },
          ];
          const KDDCode = 'KDD_T';

          const response = await post(
            'guanLianKuaiDi',
            {
              EWMs,
              KDDCode,
            },
            ZHY4Token,
          );
          assert.equal(response.data.code, 1);
        });
        // QATODO:目前不校验快递权限
      });
      describe('操作状态不正确', async () => {
        it('ZHY将属于不同柜台的WL关联快递', async () => {
          const EWMs = [
            {
              type: 'KDX',
              uuid: 'KDX22',
            },
            {
              type: 'KDX',
              uuid: 'KDX25',
            },
          ];
          const KDDCode = 'KDD_T';

          const response = await post(
            'guanLianKuaiDi',
            {
              EWMs,
              KDDCode,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('ZHY将已经关联过快递的箱子，再次关联', async () => {
          const EWMs = [
            {
              type: 'KDX',
              uuid: 'KDX23',
            },
          ];
          const KDDCode = 'KDD_T';

          const response = await post(
            'guanLianKuaiDi',
            {
              EWMs,
              KDDCode,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 解除关联快递 [ZHY]
  describe('/jieChuGuanLianKuaiDi', async () => {
    describe('成功', async () => {
      it('ZHY解除快递关联', async () => {
        const ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX3',
          },
        ];

        const response = await post(
          'jieChuGuanLianKuaiDi',
          {
            EWMs,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdx = await KDX.findOne({
          where: { EWM: JSON.stringify(EWMs[0]) },
        });
        assert.equal(kdx.dataValues.KDDId, null);
        assert.equal(kdx.dataValues.status, KDXStatus.ZX);

        const wywl = await WYWL.findAll({
          where: { KDXId: kdx.dataValues.id },
        });
        const wywlList = wywl.map(item => ({
          EWM: item.dataValues.EWM,
          status: item.dataValues.status,
        }));
        for (const item of wywlList) {
          assert.equal(item.status, WYWLStatus.ZX);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('ZHY解除不属于自己DD_GT_WL任务的快递关联', async () => {
          const EWMs = [
            {
              type: 'KDX',
              uuid: 'KDX3',
            },
          ];

          const response = await post(
            'jieChuGuanLianKuaiDi',
            {
              EWMs,
            },
            ZHYToken,
          );
          assert.equal(response.data.code, 1);
        });
        // QATODO:目前不检查权限
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 收箱 [GTBA]
  describe('/shouXiang', async () => {
    describe('成功', async () => {
      it('GTBA收箱', async () => {
        const GTBA8Token = await getToken('GTBA8', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX3',
          },
        ];

        const response = await post(
          'shouXiang',
          {
            EWMs,
          },
          GTBA8Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const kdx = await KDX.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(kdx.dataValues.status, KDXStatus.SX);

          const wywl = await WYWL.findAll({
            where: { KDXId: kdx.dataValues.id },
          });
          const wywlList = wywl.map(item => ({
            id: item.dataValues.id,
            status: item.dataValues.status,
          }));
          for (const item of wywlList) {
            assert.equal(item.status, WYWLStatus.SX);

            const wywlcz = await WYWLCZ.findAll({
              where: { WYWLId: item.id, status: WYWLStatus.SX },
            });
            assert.notEqual(wywlcz, null);
            assert.equal(wywlcz.length, 1);
            assert.equal(wywlcz[0].dataValues.UserId, 24);
          }
        }
      });

      it('GTBA收箱--箱子中包含丢失的货物', async () => {
        const AZG2Token = await getToken('AZG2', '123456');
        const DDId = 3;
        const GTId = 8;
        const WYWLPayloads = [
          {
            id: 20,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrl',
          },
        ];

        await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          AZG2Token,
        );

        const GTBA8Token = await getToken('GTBA8', '123456');
        const EWMs = [
          {
            type: 'KDX',
            uuid: 'KDX3',
          },
        ];

        const response = await post(
          'shouXiang',
          {
            EWMs,
          },
          GTBA8Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const kdx = await KDX.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(kdx.dataValues.status, KDXStatus.SX);

          const wywl = await WYWL.findAll({
            where: { KDXId: kdx.dataValues.id },
          });
          const wywlList = wywl.map(item => ({
            id: item.dataValues.id,
            status: item.dataValues.status,
          }));

          for (const item of wywlList) {
            if (item.id == WYWLPayloads[0].id) {
              assert.equal(item.status, WYWLStatus.FK);
            } else {
              assert.equal(item.status, WYWLStatus.SX);

              const wywlcz = await WYWLCZ.findAll({
                where: { WYWLId: item.id, status: WYWLStatus.SX },
              });
              assert.notEqual(wywlcz, null);
              assert.equal(wywlcz.length, 1);
              assert.equal(wywlcz[0].dataValues.UserId, 24);
            }
          }
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA收箱其他GT的箱子', async () => {
          const EWMs = [
            {
              type: 'KDX',
              uuid: 'KDX26',
            },
          ];

          const response = await post(
            'shouXiang',
            {
              EWMs,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 收货WL [GTBA, AZG]
  describe('/shouHuoWL', async () => {
    describe('成功', async () => {
      it('GTBA收货WL', async () => {
        const GTBA10Token = await getToken('GTBA10', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 27,
            uuid: '27_1',
          },
        ];

        const response = await post(
          'shouHuoWL',
          {
            EWMs,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(wywl.dataValues.status, WYWLStatus.SH);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, status: WYWLStatus.SH },
          });
          assert.notEqual(wywlcz, null);
          assert.equal(wywlcz.length, 1);
          assert.equal(wywlcz[0].dataValues.UserId, 26);
        }
      });

      it('AZG收货WL', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 18,
            uuid: '18_1',
          },
          {
            type: 'WL',
            typeId: 18,
            uuid: '18_2',
          },
        ];

        const response = await post(
          'shouHuoWL',
          {
            EWMs,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wywl = await WYWL.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(wywl.dataValues.status, WYWLStatus.SH);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 38 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.include(wywlczList, WYWLStatus.SH);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA收货不属于自己的任务', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 26,
              uuid: '26_1',
            },
          ];

          const response = await post(
            'shouHuoWL',
            {
              EWMs,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG收货不属于自己的任务', async () => {
          const EWMs = [
            {
              type: 'WL',
              typeId: 20,
              uuid: '20_1',
            },
          ];

          const response = await post(
            'shouHuoWL',
            {
              EWMs,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG收货属于发货状态的WL', async () => {
          const AZG2Token = await getToken('AZG2', '123456');
          const EWMs = [
            {
              type: 'WL',
              typeId: 17,
              uuid: '17_1',
            },
          ];

          const response = await post(
            'shouHuoWL',
            {
              EWMs,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 收货DP [GTBA, AZG] 
  describe('/shouHuoDP', async () => {
    describe('成功', async () => {
      it('GTBA收货DP', async () => {
        const GTBA10Token = await getToken('GTBA10', '123456');
        const EWMs = [
          {
            "type": "DP",
            "typeId": 34,
            "uuid": "34_1",
            "DWId": 37,
            "name": "DW3",
            "CZ": "200*100",
            "CC": "铜板"
          },
        ];

        const response = await post(
          'shouHuoDP',
          {
            EWMs,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wydp = await WYDP.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(wydp.dataValues.status, WYDPStatus.SH);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, status: WYDPStatus.SH },
          });
          assert.notEqual(wydpcz, null);
          assert.equal(wydpcz.length, 1);
          assert.equal(wydpcz[0].dataValues.UserId, 26);
        }
      });

      it('AZG收货DP', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const EWMs = [
          {
            "type": "DP",
            "typeId": 19,
            "uuid": "19_1",
            "DWId": 22,
            "name": "DW8",
            "CZ": "200*100",
            "CC": "铜板"
          },
        ];

        const response = await post(
          'shouHuoDP',
          {
            EWMs,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of EWMs) {
          const wydp = await WYDP.findOne({
            where: { EWM: JSON.stringify(item) },
          });
          assert.equal(wydp.dataValues.status, WYDPStatus.SH);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, UserId: 38 },
          });
          assert.notEqual(wydpcz, null);
          const wydpczList = wydpcz.map(item => item.dataValues.status);
          assert.equal(wydpczList.length, 1);
          assert.include(wydpczList, WYDPStatus.SH);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA收货不属于自己的任务', async () => {
          const EWMs = [
            {
              "type": "DP",
              "typeId": 34,
              "uuid": "34_1",
              "DWId": 37,
              "name": "DW3",
              "CZ": "200*100",
              "CC": "铜板"
            },
          ];

          const response = await post(
            'shouHuoDP',
            {
              EWMs,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG收货不属于自己的任务', async () => {
          const EWMs = [
            {
              "type": "DP",
              "typeId": 19,
              "uuid": "19_1",
              "DWId": 22,
              "name": "DW8",
              "CZ": "200*100",
              "CC": "铜板"
            },
          ];

          const response = await post(
            'shouHuoDP',
            {
              EWMs,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG收货属于发货状态的DP', async () => {
          const AZG3Token = await getToken('AZG3', '123456');
          const EWMs = [
            {
              "type": "DP",
              "typeId": 17,
              "uuid": "17_1",
              "DWId": 20,
              "name": "DW6",
              "CZ": "200*100",
              "CC": "铜板"
            },
          ];

          const response = await post(
            'shouHuoDP',
            {
              EWMs,
            },
            AZG3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 安装反馈DDWL状态 [GTBA, AZG]
  describe('/anZhuangFanKuiDDWLZhuangTai', async () => {
    describe('成功', async () => {
      it('GTBA反馈DDWL的AZFKType', async () => {
        const GTBA10Token = await getToken('GTBA10', '123456');
        const WYWLPayloads = [
          {
            id: 50,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrlWL50'
          },
        ];
        const DDId = 5;
        const GTId = 10;

        const response = await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, status: WYWLStatus.FK },
          });
          assert.notEqual(wywlcz, null);
          assert.equal(wywlcz.length, 1);
          assert.equal(wywlcz[0].dataValues.UserId, 26);
        }
      });

      it('AZG反馈DDWL的AZFKType', async () => {
        const WYWLPayloads = [
          {
            id: 32,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrlWL19',
          },
          {
            id: 33,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrlWL19',
          },
        ];
        const DDId = 3;
        const GTId = 8;

        const response = await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          AZGToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 36 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.SH, WYWLStatus.FK]);
        }
      });

      it('AZG反馈未收到货的WL的AZFKType', async () => {
        const WYWLPayloads = [
          {
            id: 16,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrlWL16',
          },
        ];
        const DDId = 3;
        const GTId = 8;

        const response = await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          AZGToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 36 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 1);
          assert.include(wywlczList, WYWLStatus.FK);
        }
      });

      it('AZG反馈所有属于他的WL任务的AZFKType', async () => {
        let AZG3Token = await getToken('AZG3', '123456');
        const WYWLPayloads = [
          {
            id: 44,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrlWL23',
          },
          {
            id: 45,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrlWL24',
          },
          {
            id: 46,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrlWL25',
          },
        ];
        const DDId = 4;
        const GTId = 9;

        const response = await post(
          'anZhuangFanKuiDDWLZhuangTai',
          {
            DDId,
            GTId,
            WYWLPayloads,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const ddgtwl = await DD_GT_WL.findOne({ where: { id: wywl.dataValues.DDGTWLId } });
          assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.KPQJT);

          const wywlcz = await WYWLCZ.findAll({
            where: { WYWLId: wywl.dataValues.id, UserId: 38 },
          });
          assert.notEqual(wywlcz, null);
          const wywlczList = wywlcz.map(item => item.dataValues.status);
          assert.equal(wywlczList.length, 2);
          assert.deepEqual(wywlczList, [WYWLStatus.SH, WYWLStatus.FK]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的DDWL的AZFKType', async () => {
          const WYWLPayloads = [
            {
              id: 50,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrlWL27',
            },
          ];
          const DDId = 5;
          const GTId = 10;

          const response = await post(
            'anZhuangFanKuiDDWLZhuangTai',
            {
              DDId,
              GTId,
              WYWLPayloads,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG反馈不属于自己的DDWL的AZFKType', async () => {
          let AZG2Token = await getToken('AZG2', '123456');
          const WYWLPayloads = [
            {
              id: 32,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrlWL19',
            },
            {
              id: 33,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrlWL19',
            },
          ];
          const DDId = 3;
          const GTId = 8;

          const response = await post(
            'anZhuangFanKuiDDWLZhuangTai',
            {
              DDId,
              GTId,
              WYWLPayloads,
            },
            AZG2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG将发货状态的WL反馈为安装成功', async () => {
          const WYWLPayloads = [
            {
              id: 16,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrlWL16',
            },
          ];
          const DDId = 3;
          const GTId = 8;

          const response = await post(
            'anZhuangFanKuiDDWLZhuangTai',
            {
              DDId,
              GTId,
              WYWLPayloads,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 安装反馈DDDP状态 [GTBA, AZG]
  describe('/anZhuangFanKuiDDDPZhuangTai', async () => {
    describe('成功', async () => {
      it('GTBA反馈DDDP的AZFKType', async () => {
        let GTBA10Token = await getToken('GTBA10', '123456');
        const DDId = 3;
        const GTId = 8;
        const WYDPPayloads = [
          {
            id: 26,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiDDDPZhuangTai',
          {
            DDId,
            GTId,
            WYDPPayloads,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, status: WYDPStatus.FK },
          });
          assert.notEqual(wydpcz, null);
          assert.equal(wydpcz.length, 1);
          assert.equal(wydpcz[0].dataValues.UserId, 26);
        }
      });

      it('AZG反馈DDDP的AZFKType', async () => {
        const DDId = 3;
        const GTId = 8;
        const WYDPPayloads = [
          {
            id: 11,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiDDDPZhuangTai',
          {
            DDId,
            GTId,
            WYDPPayloads,
          },
          AZGToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, status: WYDPStatus.FK },
          });
          assert.notEqual(wydpcz, null);
          assert.equal(wydpcz.length, 1);
          assert.equal(wydpcz[0].dataValues.UserId, 36);
        }
      });

      it('AZG反馈所有属于他的DP任务的AZFKType', async () => {
        let AZG3Token = await getToken('AZG3', '123456');
        const WYDPPayloads = [
          {
            id: 20,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
          {
            id: 21,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
          {
            id: 22,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];
        const DDId = 4;
        const GTId = 9;

        const response = await post(
          'anZhuangFanKuiDDDPZhuangTai',
          {
            DDId,
            GTId,
            WYDPPayloads,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const dddwdp = await DD_DW_DP.findOne({ where: { id: wydp.dataValues.DDDWDPId } });
          assert.equal(dddwdp.dataValues.status, DD_DW_DPStatus.KPQJT);

          const wydpcz = await WYDPCZ.findAll({
            where: { WYDPId: wydp.dataValues.id, UserId: 38 },
          });
          assert.notEqual(wydpcz, null);
          const wydpczList = wydpcz.map(item => item.dataValues.status);
          assert.equal(wydpczList.length, 2);
          assert.deepEqual(wydpczList, [WYDPStatus.SH, WYDPStatus.FK]);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的DDDP的AZFKType', async () => {
          const DDId = 3;
          const GTId = 8;
          const WYDPPayloads = [
            {
              id: 26,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiDDDPZhuangTai',
            {
              DDId,
              GTId,
              WYDPPayloads,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG反馈不属于自己的DDDP的AZFKType', async () => {
          let AZG2Token = await getToken('AZG2', '123456');
          const DDId = 3;
          const GTId = 8;
          const WYDPPayloads = [
            {
              id: 11,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiDDDPZhuangTai',
            {
              DDId,
              GTId,
              WYDPPayloads,
            },
            AZG2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG将装箱状态的DP反馈为安装成功', async () => {
          let AZG3Token = await getToken('AZG3', '123456');
          const DDId = 3;
          const GTId = 8;
          const WYDPPayloads = [
            {
              id: 7,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiDDDPZhuangTai',
            {
              DDId,
              GTId,
              WYDPPayloads,
            },
            AZG3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 装反馈全景WL图片 [GTBA, AZG]
  describe('/anZhuangFanKuiQuanJingWLTuPian', async () => {
    describe('成功', async () => {
      it('GTBA反馈WL安装反馈图', async () => {
        const GTBA9Token = await getToken('GTBA9', '123456');
        const DDId = 4;
        const GTId = 9;
        const imageUrls = ['imageUrl_FK28', 'imageUrl_FK28'];

        const response = await post(
          'anZhuangFanKuiQuanJingWLTuPian',
          {
            DDId,
            GTId,
            imageUrls,
          },
          GTBA9Token,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({ where: { id: 28 } });
        assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.WC);

        for (let item of imageUrls) {
          const wlqjfkt = await WLQJFKT.findOne({ where: { imageUrl: item } });
          assert.equal(wlqjfkt.dataValues.UserId, 25);
        }
      });

      it('AZG反馈WL安装反馈图', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const DDId = 5;
        const GTId = 10;
        const imageUrls = ['imageUrl_FK27', 'imageUrl_FK28'];

        const response = await post(
          'anZhuangFanKuiQuanJingWLTuPian',
          {
            DDId,
            GTId,
            imageUrls,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({ where: { id: 27 } });
        assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.WC);

        for (let item of imageUrls) {
          const wlqjfkt = await WLQJFKT.findOne({ where: { imageUrl: item } });
          assert.equal(wlqjfkt.dataValues.UserId, 38);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的任务的柜台全景图', async () => {
          const DDId = 4;
          const GTId = 9;
          const imageUrls = ['imageUrl_FK28', 'imageUrl_FK28'];

          const response = await post(
            'anZhuangFanKuiQuanJingWLTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG反馈不属于自己的任务的柜台全景图', async () => {
          const DDId = 5;
          const GTId = 10;
          const imageUrls = ['imageUrl_FK27', 'imageUrl_FK27'];

          const response = await post(
            'anZhuangFanKuiQuanJingWLTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有任务');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG在未完成状态反馈前，反馈柜台全景图', async () => {
          const DDId = 3;
          const GTId = 8;
          const imageUrls = ['imageUrl_FK27', 'imageUrl_FK27'];

          const response = await post(
            'anZhuangFanKuiQuanJingWLTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有任务');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 安装反馈全景DP图片 [GTBA, AZG] 
  // izzTodo: 场景第一次分配给AZG的任务已经全部反馈完成，在还未反馈全景图时又分配了任务给该AZG
  describe('/anZhuangFanKuiQuanJingDPTuPian', async () => {
    describe('成功', async () => {
      it('GTBA反馈DP安装反馈图', async () => {
        const GTBA9Token = await getToken('GTBA9', '123456');
        const DDId = 4;
        const GTId = 9;
        const imageUrls = ['imageUrl_FK28', 'imageUrl_FK28'];

        const response = await post(
          'anZhuangFanKuiQuanJingDPTuPian',
          {
            DDId,
            GTId,
            imageUrls,
          },
          GTBA9Token,
        );
        assert.equal(response.data.code, 1);

        let dddwdpList = [42, 43, 44];
        for (let item of dddwdpList) {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.status, DD_DW_DPStatus.WC);
        }

        for (let item of imageUrls) {
          const dpqjfkt = await DPQJFKT.findOne({ where: { imageUrl: item } });
          assert.equal(dpqjfkt.dataValues.UserId, 25);
        }
      });

      it('AZG反馈DP安装反馈图', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const DDId = 5;
        const GTId = 10;
        const imageUrls = ['imageUrl_FK27', 'imageUrl_FK28'];

        const response = await post(
          'anZhuangFanKuiQuanJingDPTuPian',
          {
            DDId,
            GTId,
            imageUrls,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        let dddwdpList = [39, 40, 41];
        for (let item of dddwdpList) {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.status, DD_DW_DPStatus.WC);
        }

        for (let item of imageUrls) {
          const dpqjfkt = await DPQJFKT.findOne({ where: { imageUrl: item } });
          assert.equal(dpqjfkt.dataValues.UserId, 38);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的任务的DDGTWL柜台全景图', async () => {
          const DDId = 4;
          const GTId = 9;
          const imageUrls = ['imageUrl_FK28', 'imageUrl_FK28'];

          const response = await post(
            'anZhuangFanKuiQuanJingDPTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('AZG反馈不属于自己的任务的DDGTWL柜台全景图', async () => {
          const DDId = 5;
          const GTId = 10;
          const imageUrls = ['imageUrl_FK27', 'imageUrl_FK27'];

          const response = await post(
            'anZhuangFanKuiQuanJingWLTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有任务');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG在未完成状态反馈前，反馈DDGTWL柜台全景图', async () => {
          const AZG3Token = await getToken('AZG3', '123456');
          const DDId = 3;
          const GTId = 8;
          const imageUrls = ['imageUrl_FK', 'imageUrl_FK1'];

          const response = await post(
            'anZhuangFanKuiQuanJingWLTuPian',
            {
              DDId,
              GTId,
              imageUrls,
            },
            AZG3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有任务');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 申请上市WLBH [GZ, GTBA, AZG]
  describe('/shenQingShangShiWLBH', async () => {
    describe('成功', async () => {
      it('GTBA申请上市WLBH', async () => {
        const GTBA10Token = await getToken('GTBA10', '123456');
        const DDId = 5;
        const GTId = 10;
        const WLId = 26;
        const imageUrl = 'imageUrl26';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingShangShiWLBH',
          {
            DDId,
            GTId,
            WLId,
            imageUrl,
            note,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { WLId } });
        assert.notEqual(wlbh, null);
      });

      it('AZG申请上市WLBH', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const DDId = 3;
        const GTId = 8;
        const WLId = 22;
        const imageUrl = 'imageUrlWL22';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingShangShiWLBH',
          {
            DDId,
            GTId,
            WLId,
            imageUrl,
            note,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { WLId } });
        assert.notEqual(wlbh, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA申请其他GT的上市WLBH', async () => {
          const DDId = 5;
          const GTId = 10;
          const WLId = 26;
          const imageUrl = 'imageUrl26';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingShangShiWLBH',
            {
              DDId,
              GTId,
              WLId,
              imageUrl,
              note,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG申请不属于自己的任务的上市WLBH', async () => {
          const DDId = 3;
          const GTId = 8;
          const WLId = 22;
          const imageUrl = 'imageUrlWL22';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingShangShiWLBH',
            {
              DDId,
              GTId,
              WLId,
              imageUrl,
              note,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 申请上市DPBH [GZ, GTBA, AZG]
  describe('/shenQingShangShiDPBH', async () => {
    describe('成功', async () => {
      it('GTBA申请上市DPBH', async () => {
        const GTBA10Token = await getToken('GTBA10', '123456');
        const DDId = 5;
        const DWId = 35;
        const DPId = 32;
        const imageUrl = 'imageUrlDP32';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingShangShiDPBH',
          {
            DDId,
            DWId,
            DPId,
            imageUrl,
            note,
          },
          GTBA10Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { DPId } });
        assert.notEqual(dpbh, null);
      });

      it('AZG申请上市DPBH', async () => {
        const AZG3Token = await getToken('AZG3', '123456');
        const DDId = 3;
        const DWId = 31;
        const DPId = 28;
        const imageUrl = 'imageUrlDP28';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingShangShiDPBH',
          {
            DDId,
            DWId,
            DPId,
            imageUrl,
            note,
          },
          AZG3Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { DPId } });
        assert.notEqual(dpbh, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA申请其他GT的上市DPBH', async () => {
          const DDId = 5;
          const DWId = 35;
          const DPId = 32;
          const imageUrl = 'imageUrlDP32';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingShangShiDPBH',
            {
              DDId,
              DWId,
              DPId,
              imageUrl,
              note,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG申请不属于自己的任务的上市WLBH', async () => {
          const DDId = 3;
          const DWId = 31;
          const DPId = 28;
          const imageUrl = 'imageUrlDP28';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingShangShiDPBH',
            {
              DDId,
              DWId,
              DPId,
              imageUrl,
              note,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 申请日常WLBH [GZ, GTBA]
  describe('/shenQingRiChangWLBH', async () => {
    describe('成功', async () => {
      it('GTBA申请日常WLBH', async () => {
        const GTBA8Token = await getToken('GTBA8', '123456');
        const GTId = 8;
        const WLId = 16;
        const imageUrl = 'imageUrlWL16';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingRiChangWLBH',
          {
            GTId,
            WLId,
            imageUrl,
            note,
          },
          GTBA8Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { WLId } });
        assert.notEqual(wlbh, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA申请其他GT的日常WLBH', async () => {
          const GTId = 8;
          const WLId = 16;
          const imageUrl = 'imageUrlWL16';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingRiChangWLBH',
            {
              GTId,
              WLId,
              imageUrl,
              note,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG申请日常WLBH', async () => {
          const GTId = 7;
          const WLId = 10;
          const imageUrl = 'imageUrlWL10';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingRiChangWLBH',
            {
              GTId,
              WLId,
              imageUrl,
              note,
            },
            AZGToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 申请日常DPBH [GZ, GTBA]
  describe('/shenQingRiChangDPBH', async () => {
    describe('成功', async () => {
      it('GTBA申请日常DPBH', async () => {
        const GTBA8Token = await getToken('GTBA8', '123456');
        const DWId = 15;
        const DPId = 12;
        const imageUrl = 'imageUrlDP12';
        const note = '货物损坏，申请补货';

        const response = await post(
          'shenQingRiChangDPBH',
          {
            DWId,
            DPId,
            imageUrl,
            note,
          },
          GTBA8Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { DPId } });
        assert.notEqual(dpbh, null);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA申请其他GT的日常DPBH', async () => {
          const DWId = 15;
          const DPId = 12;
          const imageUrl = 'imageUrlDP12';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingRiChangDPBH',
            {
              DWId,
              DPId,
              imageUrl,
              note,
            },
            GTBAToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG申请日常DPBH', async () => {
          const AZG3Token = await getToken('AZG3', '123456');
          const DWId = 31;
          const DPId = 28;
          const imageUrl = 'imageUrlDP28';
          const note = '货物损坏，申请补货';

          const response = await post(
            'shenQingRiChangDPBH',
            {
              DWId,
              DPId,
              imageUrl,
              note,
            },
            AZG3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量审批通过WLBH [KFJL]
  describe('/piLiangShenPiTongGuoWLBHa', async () => {
    describe('成功', async () => {
      it('KFJL批量审批通过WLBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const ids = [4];

        const response = await post(
          'piLiangShenPiTongGuoWLBHa',
          {
            ids,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.status, WLBHStatus.KFJLSPTG);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL批量审批通其他PP的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const ids = [28];

          const response = await post(
            'piLiangShenPiTongGuoWLBHa',
            {
              ids,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('KFJL批量审批通过状态为驳回的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const ids = [27];

          const response = await post(
            'piLiangShenPiTongGuoWLBHa',
            {
              ids,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('KFJL批量审批通过状态为客服经理审批通过的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const ids = [26];

          const response = await post(
            'piLiangShenPiTongGuoWLBHa',
            {
              ids,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('KFJL批量审批通过状态为通过的WLBH', async () => {
          const KFJL4Token = await getToken('KFJL4', '123456');
          const ids = [32];

          const response = await post(
            'piLiangShenPiTongGuoWLBHa',
            {
              ids,
            },
            KFJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量审批通过DPBH [KFJL]
  describe('/piLiangShenPiTongGuoDPBHa', async () => {
    describe('成功', async () => {
      it('KFJL批量审批通过DPBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const ids = [4];

        const response = await post(
          'piLiangShenPiTongGuoDPBHa',
          {
            ids,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const dpbh = await DPBH.findOne({ where: { id: item } });
          assert.equal(dpbh.dataValues.status, DPBHStatus.KFJLSPTG);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL批量审批通其他PP的DPBH', async () => {
          const ids = [4];

          const response = await post(
            'piLiangShenPiTongGuoDPBHa',
            {
              ids,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('KFJL批量审批通过状态为驳回的DPBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const ids = [27];

          const response = await post(
            'piLiangShenPiTongGuoDPBHa',
            {
              ids,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('KFJL批量审批通过状态为客服经理审批通过的DPBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const ids = [26];

          const response = await post(
            'piLiangShenPiTongGuoDPBHa',
            {
              ids,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('KFJL批量审批通过状态为通过的DPBH', async () => {
          const KFJL4Token = await getToken('KFJL4', '123456');
          const ids = [32];

          const response = await post(
            'piLiangShenPiTongGuoDPBHa',
            {
              ids,
            },
            KFJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批通过WLBH [KFJL]
  describe('/danDuShenPiTongGuoWLBHa', async () => {
    describe('成功', async () => {
      it('KFJL单独审批通过WLBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const id = 4;
        const KFJLNote = '情况属实';

        const response = await post(
          'danDuShenPiTongGuoWLBHa',
          {
            id,
            KFJLNote,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { id } });
        assert.equal(wlbh.dataValues.status, WLBHStatus.KFJLSPTG);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独审批通其他PP的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const id = 28;
          const KFJLNote = '情况属实';

          const response = await post(
            'danDuShenPiTongGuoWLBHa',
            {
              id,
              KFJLNote,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('KFJL单独审批通过状态为驳回的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const id = 27;
          const KFJLNote = '情况属实';

          const response = await post(
            'danDuShenPiTongGuoWLBHa',
            {
              id,
              KFJLNote,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批通过DPBH [KFJL]
  describe('/danDuShenPiTongGuoDPBHa', async () => {
    describe('成功', async () => {
      it('KFJL单独审批通过DPBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const id = 4;
        const KFJLNote = '情况属实';

        const response = await post(
          'danDuShenPiTongGuoDPBHa',
          {
            id,
            KFJLNote,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.KFJLSPTG);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独审批通其他PP的DPBH', async () => { });
      });
      describe('操作状态不正确', async () => {
        it('KFJL单独审批通过状态为驳回的DPBH', async () => { });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批驳回WLBH [KFJL]
  describe('/danDuShenPiBoHuiWLBHa', async () => {
    describe('成功', async () => {
      it('KFJL单独审批驳回WLBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const id = 4;
        const KFJLNote = '情况不属实';

        const response = await post(
          'danDuShenPiBoHuiWLBHa',
          {
            id,
            KFJLNote,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { id } });
        assert.equal(wlbh.dataValues.status, WLBHStatus.BH);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独驳回其他PP的WLBH', async () => {
          const KFJL3Token = await getToken('KFJL3', '123456');
          const id = 28;
          const KFJLNote = '情况不属实';

          const response = await post(
            'danDuShenPiBoHuiWLBHa',
            {
              id,
              KFJLNote,
            },
            KFJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批驳回DPBH [KFJL]
  describe('/danDuShenPiBoHuiDPBHa', async () => {
    describe('成功', async () => {
      it('KFJL单独审批驳回DPBH', async () => {
        const KFJL3Token = await getToken('KFJL3', '123456');
        const id = 4;
        const KFJLNote = '情况不属实';

        const response = await post(
          'danDuShenPiBoHuiDPBHa',
          {
            id,
            KFJLNote,
          },
          KFJL3Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.BH);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独驳回其他PP的DPBH', async () => {
          const id = 4;
          const KFJLNote = '情况不属实';

          const response = await post(
            'danDuShenPiBoHuiDPBHa',
            {
              id,
              KFJLNote,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 为WLBH分配AZGS [PPJL]
  describe('/setWLBH0AZGS', async () => {
    describe('成功', async () => {
      it('PPJL为WLBH分配AZGS', async () => {
        const PPJL3Token = await getToken('PPJL3', '123456');
        const ids = [5];
        const AZGSId = 1;

        const response = await post(
          'setWLBH0AZGS',
          {
            ids,
            AZGSId,
          },
          PPJL3Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.AZGSId, AZGSId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为其他PP的WLBH分配AZGS', async () => {
          const ids = [5];
          const AZGSId = 1;

          const response = await post(
            'setWLBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL为初始状态的WLBH分配AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [4];
          const AZGSId = 1;

          const response = await post(
            'setWLBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL为驳回状态的WLBH分配AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [6];
          const AZGSId = 1;

          const response = await post(
            'setWLBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL为通过状态的WLBH分配AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [8];
          const AZGSId = 1;

          const response = await post(
            'setWLBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 为DPBH分配AZGS [PPJL]
  describe('/setDPBH0AZGS', async () => {
    describe('成功', async () => {
      it('PPJL为DPBH分配AZGS', async () => {
        const PPJL3Token = await getToken('PPJL3', '123456');
        const ids = [5];
        const AZGSId = 1;

        const response = await post(
          'setDPBH0AZGS',
          {
            ids,
            AZGSId,
          },
          PPJL3Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id: ids[0] } });
        assert.equal(dpbh.dataValues.AZGSId, AZGSId);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为其他PP的DPBH分配AZGS', async () => {
          const ids = [5];
          const AZGSId = 1;

          const response = await post(
            'setDPBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL为初始状态的DPBH分配AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [25];
          const AZGSId = 1;

          const response = await post(
            'setDPBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL为驳回状态的DPBH分配AZGS', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [27];
          const AZGSId = 1;

          const response = await post(
            'setDPBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL为通过状态的DPBH分配AZGS', async () => {
          const PPJL4Token = await getToken('PPJL4', '123456');
          const ids = [32];
          const AZGSId = 1;

          const response = await post(
            'setDPBH0AZGS',
            {
              ids,
              AZGSId,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量审批通过WLBH [PPJL]
  describe('/piLiangShenPiTongGuoWLBHb', async () => {
    describe('成功', async () => {
      it('PPJL批量审批通过WLBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const ids = [7];

        const response = await post(
          'piLiangShenPiTongGuoWLBHb',
          {
            ids,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.status, WLBHStatus.TG);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL批量审批通其他PP的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [28];

          const response = await post(
            'piLiangShenPiTongGuoWLBHb',
            {
              ids,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL批量审批通过状态为驳回的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [27];

          const response = await post(
            'piLiangShenPiTongGuoWLBHb',
            {
              ids,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL批量审批通过状态为初始的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const ids = [25];

          const response = await post(
            'piLiangShenPiTongGuoWLBHb',
            {
              ids,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL批量审批通过状态为通过的WLBH', async () => {
          const PPJL4Token = await getToken('PPJL4', '123456');
          const ids = [32];

          const response = await post(
            'piLiangShenPiTongGuoWLBHb',
            {
              ids,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量审批通过DPBH [PPJL]
  describe('/piLiangShenPiTongGuoDPBHb', async () => {
    describe('成功', async () => {
      it('PPJL批量审批通过DPBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const ids = [7];

        const response = await post(
          'piLiangShenPiTongGuoDPBHb',
          {
            ids,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id: ids[0] } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.TG);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL批量审批通其他PP的DPBH', async () => {
          const ids = [7];

          const response = await post(
            'piLiangShenPiTongGuoDPBHb',
            {
              ids,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL批量审批通过状态为驳回的DPBH', async () => {
          const PPJL4Token = await getToken('PPJL4', '123456');
          const ids = [30];

          const response = await post(
            'piLiangShenPiTongGuoDPBHb',
            {
              ids,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL批量审批通过状态为初始的DPBH', async () => {
          const PPJL4Token = await getToken('PPJL4', '123456');
          const ids = [28];

          const response = await post(
            'piLiangShenPiTongGuoDPBHb',
            {
              ids,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('PPJL批量审批通过状态为通过的DPBH', async () => {
          const PPJL4Token = await getToken('PPJL4', '123456');
          const ids = [32];

          const response = await post(
            'piLiangShenPiTongGuoDPBHb',
            {
              ids,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批通过WLBH [PPJL]
  describe('/danDuShenPiTongGuoWLBHb', async () => {
    describe('成功', async () => {
      it('PPJL单独审批通过WLBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const id = 7;
        const PPJLNote = '通过';

        const response = await post(
          'danDuShenPiTongGuoWLBHb',
          {
            id,
            PPJLNote,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { id } });
        assert.equal(wlbh.dataValues.status, WLBHStatus.TG);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL单独审批通其他PP的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const id = 28;
          const KFJLNote = '情况属实';

          const response = await post(
            'danDuShenPiTongGuoWLBHa',
            {
              id,
              KFJLNote,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL单独审批通过状态为驳回的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const id = 27;
          const PPJLNote = '情况属实';

          const response = await post(
            'danDuShenPiTongGuoWLBHb',
            {
              id,
              PPJLNote,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批通过DPBH [PPJL]
  describe('/danDuShenPiTongGuoDPBHb', async () => {
    describe('成功', async () => {
      it('PPJL单独审批通过DPBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const id = 7;
        const PPJLNote = '通过';

        const response = await post(
          'danDuShenPiTongGuoDPBHb',
          {
            id,
            PPJLNote,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.TG);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL单独审批通其他PP的DPBH', async () => {
          const id = 7;
          const PPJLNote = '通过';

          const response = await post(
            'danDuShenPiTongGuoDPBHb',
            {
              id,
              PPJLNote,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('PPJL单独审批通过状态为驳回的DPBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const id = 6;
          const PPJLNote = '通过';

          const response = await post(
            'danDuShenPiTongGuoDPBHb',
            {
              id,
              PPJLNote,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批驳回WLBH [PPJL]
  describe('/danDuShenPiBoHuiWLBHb', async () => {
    describe('成功', async () => {
      it('PPJL单独审批驳回WLBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const id = 7;
        const PPJLNote = '驳回';

        const response = await post(
          'danDuShenPiBoHuiWLBHb',
          {
            id,
            PPJLNote,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { id } });
        assert.equal(wlbh.dataValues.status, WLBHStatus.BH);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独驳回其他PP的WLBH', async () => {
          const PPJL3Token = await getToken('PPJL3', '123456');
          const id = 28;
          const KFJLNote = '情况不属实';

          const response = await post(
            'danDuShenPiBoHuiWLBHa',
            {
              id,
              KFJLNote,
            },
            PPJL3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 单独审批驳回DPBH [PPJL]
  describe('/danDuShenPiBoHuiDPBHb', async () => {
    describe('成功', async () => {
      it('PPJL单独审批驳回DPBH', async () => {
        const PPJL4Token = await getToken('PPJL4', '123456');
        const id = 7;
        const PPJLNote = '驳回';

        const response = await post(
          'danDuShenPiBoHuiDPBHb',
          {
            id,
            PPJLNote,
          },
          PPJL4Token,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.BH);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL单独驳回其他PP的DPBH', async () => {
          const id = 7;
          const PPJLNote = '驳回';

          const response = await post(
            'danDuShenPiBoHuiDPBHb',
            {
              id,
              PPJLNote,
            },
            PPJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // setWLBHYJZXTime [生产GYSGLY]
  describe('/setWLBHs0YJZXTime', async () => {
    describe('成功', async () => {
      it('生产GYSGLY设置WLBH的YJZXTime', async () => {
        const ids = [8, 9, 33];
        const YJZXTime = '2018-10-10';

        const response = await post(
          'setWLBHs0YJZXTime',
          {
            ids,
            YJZXTime,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.YJZXTime.getTime(), new Date(YJZXTime).getTime());
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('生产GYSGLY设置不属于自己任务的WLBH的YJZXTime', async () => {
          const GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const ids = [8, 9, 33];
          const YJZXTime = '2018-10-10';

          const response = await post(
            'setWLBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('中转GYSGLY设置WLBH的YJZXTime', async () => {
          const GYSGLY3Token = await getToken('GYSGLY3', '123456');
          const ids = [35, 36];
          const YJZXTime = '2018-02-02';

          const response = await post(
            'setWLBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('生产GYSGLY设置已经装箱的WLBH的YJZXTime', async () => {
          const ids = [37, 38];
          const YJZXTime = '2018-02-02';

          const response = await post(
            'setWLBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // setDPBHYJZXTime [生产GYSGLY]
  describe('/setDPBHs0YJZXTime', async () => {
    describe('成功', async () => {
      it('生产GYSGLY设置DPBH的YJZXTime', async () => {
        const ids = [8, 9, 33];
        const YJZXTime = '2018-10-10';

        const response = await post(
          'setDPBHs0YJZXTime',
          {
            ids,
            YJZXTime,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of ids) {
          const dpbh = await DPBH.findOne({ where: { id: item } });
          assert.equal(dpbh.dataValues.YJZXTime.getTime(), new Date(YJZXTime).getTime());
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('生产GYSGLY设置不属于自己任务的DPBH的YJZXTime', async () => {
          let GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const ids = [8, 9, 33];
          const YJZXTime = '2018-10-10';

          const response = await post(
            'setDPBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('中转GYSGLY设置DPBH的YJZXTime', async () => {
          const GYSGLY3Token = await getToken('GYSGLY3', '123456');
          const ids = [35, 36];
          const YJZXTime = '2018-02-02';

          const response = await post(
            'setDPBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLY3Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('生产GYSGLY设置已经装箱的DPBH的YJZXTime', async () => {
          const ids = [37, 38];
          const YJZXTime = '2018-02-02';

          const response = await post(
            'setDPBHs0YJZXTime',
            {
              ids,
              YJZXTime,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 为WLBH分配发货GYS [生产GYSGLY]
  describe('/fenPeiWLBHFaHuoGYS', async () => {
    describe('成功', async () => {
      it('生产GYSGLY分配WLBH的发货GYS', async () => {
        const ids = [8];
        const GYSId = 3;

        const response = await post(
          'fenPeiWLBHFaHuoGYS',
          {
            ids,
            GYSId,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        const wlbh = await WLBH.findOne({ where: { id: ids[0] } });
        assert.equal(wlbh.dataValues.GYSId, GYSId);
        assert.equal(wlbh.dataValues.status, WLBHStatus.YFPFHGYS);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('生产GYSGLY为不属于自己的WLBH分配发货GYS', async () => {
          const GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const ids = [8];
          const GYSId = 3;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('生产GYS1将WLBH分配给其他生产GYS2', async () => {
          const ids = [8];
          const GYSId = 2;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('生产GYS1将WLBH分配给库存不足的中转GYS', async () => {
          const ids = [8, 72];
          const GYSId = 3;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '库存');
        });

        it('GYSGLY设置还未审批通过的的WLBH的发货GYS', async () => {
          const ids = [1];
          const GYSId = 1;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY为已经分配过发货GYS的WLBH再次分配发货GYS', async () => {
          const ids = [9];
          const GYSId = 3;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY设置装箱完成的WLBH的发货GYS', async () => {
          const ids = [10];
          const GYSId = 3;

          const response = await post(
            'fenPeiWLBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 为DPBH分配发货GYS [生产GYSGLY]
  describe('/fenPeiDPBHFaHuoGYS', async () => {
    describe('成功', async () => {
      it('生产GYSGLY分配DPBH的发货GYS', async () => {
        const ids = [8];
        const GYSId = 3;

        const response = await post(
          'fenPeiDPBHFaHuoGYS',
          {
            ids,
            GYSId,
          },
          GYSGLYToken,
        );
        assert.equal(response.data.code, 1);

        const dpbh = await DPBH.findOne({ where: { id: ids[0] } });
        assert.equal(dpbh.dataValues.status, DPBHStatus.YFPFHGYS);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('生产GYSGLY为不属于自己的DPBH分配发货GYS', async () => {
          let GYSGLY2Token = await getToken('GYSGLY2', '123456');
          const ids = [8];
          const GYSId = 3;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('生产GYS1将DPBH分配给其他生产GYS2', async () => {
          const ids = [8];
          const GYSId = 2;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('生产GYS1将DPBH分配给库存不足的中转GYS', async () => {
          const ids = [8, 72];
          const GYSId = 3;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '库存');
        });

        it('GYSGLY设置还未审批通过的的DPBH的发货GYS', async () => {
          const ids = [1];
          const GYSId = 1;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY为已经分配过发货GYS的DPBH再次分配发货GYS', async () => {
          const ids = [9];
          const GYSId = 3;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });

        it('GYSGLY设置装箱完成的DPBH的发货GYS', async () => {
          const ids = [10];
          const GYSId = 3;

          const response = await post(
            'fenPeiDPBHFaHuoGYS',
            {
              ids,
              GYSId,
            },
            GYSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 分配WLBH的AZG [AZGSGLY]
  describe('/setWLBHs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY分配审批通过的WLBH的AZG', async () => {
        const WLBHIds = [8, 32];
        const AZGUserId = 36;
        const YJAZDate = '2018-01-01';

        const response = await post(
          'setWLBHs0AZG',
          {
            WLBHIds,
            AZGUserId,
            YJAZDate,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of WLBHIds) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.AZGUserId, AZGUserId);
          assert.equal(ddgtwl.dataValues.YJAZDate, new Date(YJAZDate).getTime());
        }
      });

      it('AZGSGLY分配已分配发货供应商的WLBH的AZG', async () => {
        const WLBHIds = [9];
        const AZGUserId = 37;

        const response = await post(
          'setWLBHs0AZG',
          {
            WLBHIds,
            AZGUserId,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of WLBHIds) {
          const wlbh = await WLBH.findOne({ where: { id: item } });
          assert.equal(wlbh.dataValues.AZGUserId, AZGUserId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('AZGSGLY设置不属于自己管理的WLBH的AZG', async () => {
          const AZGSGLY2Token = await getToken('AZGSGLY2', '123456');
          const WLBHIds = [8];
          const AZGUserId = 36;

          const response = await post(
            'setWLBHs0AZG',
            {
              WLBHIds,
              AZGUserId,
            },
            AZGSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('AZGSGLY为WLBH设置不属于自己管理的AZG', async () => {
          const WLBHIds = [8];
          const AZGUserId = 38;

          const response = await post(
            'setWLBHs0AZG',
            {
              WLBHIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZGSGLY为收货的WLBH设置AZG', async () => {
          const WLBHIds = [46];
          const AZGUserId = 37;

          const response = await post(
            'setWLBHs0AZG',
            {
              WLBHIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 分配DPBH的AZG [AZGSGLY]
  describe('/setDPBHs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY分配DPBH的AZG', async () => {
        const DPBHIds = [8, 32];
        const AZGUserId = 36;
        const YJAZDate = '2018-01-01'

        const response = await post(
          'setDPBHs0AZG',
          {
            DPBHIds,
            AZGUserId,
            YJAZDate,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DPBHIds) {
          const dpbh = await DPBH.findOne({ where: { id: item } });
          assert.equal(dpbh.dataValues.AZGUserId, AZGUserId);
          assert.equal(ddgtwl.dataValues.YJAZDate, new Date(YJAZDate).getTime());
        }
      });

      it('AZGSGLY分配已分配发货供应商的DPBH的AZG', async () => {
        const DPBHIds = [9];
        const AZGUserId = 37;

        const response = await post(
          'setDPBHs0AZG',
          {
            DPBHIds,
            AZGUserId,
          },
          AZGSGLYToken,
        );
        assert.equal(response.data.code, 1);

        for (const item of DPBHIds) {
          const dpbh = await DPBH.findOne({ where: { id: item } });
          assert.equal(dpbh.dataValues.AZGUserId, AZGUserId);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('AZGSGLY设置不属于自己管理的DPBH的AZG', async () => {
          const AZGSGLY2Token = await getToken('AZGSGLY2', '123456');
          const DPBHIds = [8];
          const AZGUserId = 36;

          const response = await post(
            'setDPBHs0AZG',
            {
              DPBHIds,
              AZGUserId,
            },
            AZGSGLY2Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('AZGSGLY为DPBH设置不属于自己管理的AZG', async () => {
          const DPBHIds = [8];
          const AZGUserId = 38;

          const response = await post(
            'setDPBHs0AZG',
            {
              DPBHIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZGSGLY为收货的DPBH设置AZG', async () => {
          const DPBHIds = [46];
          const AZGUserId = 37;

          const response = await post(
            'setDPBHs0AZG',
            {
              DPBHIds,
              AZGUserId,
            },
            AZGSGLYToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 安装反馈BHWL状态 [GTBA, AZG]
  describe('/anZhuangFanKuiBHWLZhuangTai', async () => {
    describe('成功', async () => {
      it('GTBA反馈BHWL的AZFKType', async () => {
        let GTBA7Token = await getToken('GTBA7', '123456');
        const WYWLPayloads = [
          {
            id: 63,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHWLZhuangTai',
          {
            WYWLPayloads,
          },
          GTBA7Token
        );
        assert.equal(response.data.code, 1);

        for (let item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wlbh = await WLBH.findOne({ where: { id: wywl.dataValues.WLBHId } });
          assert.equal(wlbh.dataValues.status, WLBHStatus.WC);
        }
      });

      it('AZG反馈BHWL的AZFKType', async () => {
        const WYWLPayloads = [
          {
            id: 73,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHWLZhuangTai',
          {
            WYWLPayloads,
          },
          AZGToken
        );
        assert.equal(response.data.code, 1);

        for (let item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wlbh = await WLBH.findOne({ where: { id: wywl.dataValues.WLBHId } });
          assert.equal(wlbh.dataValues.status, WLBHStatus.WC);
        }
      });

      it('AZG反馈未收到货的BHWL的AZFKType', async () => {
        let AZG3Token = await getToken('AZG3', '123456');
        const WYWLPayloads = [
          {
            id: 56,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHWLZhuangTai',
          {
            WYWLPayloads,
          },
          AZG3Token
        );
        assert.equal(response.data.code, 1);

        for (let item of WYWLPayloads) {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, WYWLStatus.FK);

          const wlbh = await WLBH.findOne({ where: { id: wywl.dataValues.WLBHId } });
          assert.equal(wlbh.dataValues.status, WLBHStatus.WC);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的BHWL的AZFKType', async () => {
          const WYWLPayloads = [
            {
              id: 63,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHWLZhuangTai',
            {
              WYWLPayloads,
            },
            GTBAToken
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG反馈不属于自己的BHWL的AZFKType', async () => {
          let AZG2Token = await getToken('AZG2', '123456');
          const WYWLPayloads = [
            {
              id: 73,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHWLZhuangTai',
            {
              WYWLPayloads,
            },
            AZG2Token
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG将发货状态的BHWL反馈为安装成功', async () => {
          let AZG3Token = await getToken('AZG3', '123456');
          const WYWLPayloads = [
            {
              id: 56,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHWLZhuangTai',
            {
              WYWLPayloads,
            },
            AZG3Token
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 安装反馈BHDP状态 [GTBA, AZG]
  describe('/anZhuangFanKuiBHDPZhuangTai', async () => {
    describe('成功', async () => {
      it('GTBA反馈BHDP的AZFKType', async () => {
        let GTBA7Token = await getToken('GTBA7', '123456');
        const WYDPPayloads = [
          {
            id: 42,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHDPZhuangTai',
          {
            WYDPPayloads,
          },
          GTBA7Token
        );
        assert.equal(response.data.code, 1);

        for (let item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const dpbh = await DPBH.findOne({ where: { id: wydp.dataValues.DPBHId } });
          assert.equal(dpbh.dataValues.status, DPBHStatus.WC);
        }
      });

      it('AZG反馈BHDP的AZFKType', async () => {
        const WYDPPayloads = [
          {
            id: 64,
            AZFKType: AZFKType.AZCG,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHDPZhuangTai',
          {
            WYDPPayloads,
          },
          AZGToken
        );
        assert.equal(response.data.code, 1);

        for (let item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const dpbh = await DPBH.findOne({ where: { id: wydp.dataValues.DPBHId } });
          assert.equal(dpbh.dataValues.status, DPBHStatus.WC);
        }
      });

      it('AZG反馈未收到货的BHDP的AZFKType', async () => {
        let AZG2Token = await getToken('AZG2', '123456');
        const WYDPPayloads = [
          {
            id: 56,
            AZFKType: AZFKType.DS,
            imageUrl: 'imageUrl',
          },
        ];

        const response = await post(
          'anZhuangFanKuiBHDPZhuangTai',
          {
            WYDPPayloads,
          },
          AZG2Token
        );
        assert.equal(response.data.code, 1);

        for (let item of WYDPPayloads) {
          const wydp = await WYDP.findOne({ where: { id: item.id } });
          assert.equal(wydp.dataValues.status, WYDPStatus.FK);

          const dpbh = await DPBH.findOne({ where: { id: wydp.dataValues.DPBHId } });
          assert.equal(dpbh.dataValues.status, DPBHStatus.WC);
        }
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('GTBA反馈不属于自己的BHDP的AZFKType', async () => {
          const WYDPPayloads = [
            {
              id: 63,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHDPZhuangTai',
            {
              WYDPPayloads,
            },
            GTBAToken
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });

        it('AZG反馈不属于自己的BHDP的AZFKType', async () => {
          let AZG2Token = await getToken('AZG2', '123456');
          const WYDPPayloads = [
            {
              id: 73,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHDPZhuangTai',
            {
              WYDPPayloads,
            },
            AZG2Token
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
      describe('操作状态不正确', async () => {
        it('AZG将发货状态的BHDP反馈为安装成功', async () => {
          let AZG2Token = await getToken('AZG2', '123456');
          const WYDPPayloads = [
            {
              id: 56,
              AZFKType: AZFKType.AZCG,
              imageUrl: 'imageUrl',
            },
          ];

          const response = await post(
            'anZhuangFanKuiBHDPZhuangTai',
            {
              WYDPPayloads,
            },
            AZG2Token
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '状态');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  describe('特殊案例', async () => {
    it('AZG反馈完成当前他负责的所有DD_GT_WL任务后，又分配了一个任务给该AZG，做全景图FK', async () => {
      let AZGSGLY2Token = await getToken('AZGSGLY2', '123456');
      const DD_GT_WLIds = [30];
      const AZGUserId = 38;

      await post(
        'setDDGTWLs0AZG',
        {
          DD_GT_WLIds,
          AZGUserId,
        },
        AZGSGLY2Token,
      );

      const AZG3Token = await getToken('AZG3', '123456');
      const DDId = 5;
      const GTId = 10;
      const imageUrls = ['imageUrl_FK27', 'imageUrl_FK28'];

      const response = await post(
        'anZhuangFanKuiQuanJingWLTuPian',
        {
          DDId,
          GTId,
          imageUrls,
        },
        AZG3Token,
      );
      assert.equal(response.data.code, 1);

      const ddgtwl = await DD_GT_WL.findOne({ where: { id: 27 } });
      assert.equal(ddgtwl.dataValues.status, DD_GT_WLStatus.WC);

      for (let item of imageUrls) {
        const wlqjfkt = await WLQJFKT.findOne({ where: { imageUrl: item } });
        assert.equal(wlqjfkt.dataValues.UserId, 38);
      }
    });

    it('AZG反馈完成当前他负责的所有DD_DW_DP任务后，又分配了一个任务给该AZG，做全景图FK', async () => {
      let AZGSGLY2Token = await getToken('AZGSGLY2', '123456');
      const DD_DW_DPIds = [45];
      const AZGUserId = 38;

      await post(
        'setDDDWDPs0AZG',
        {
          DD_DW_DPIds,
          AZGUserId,
        },
        AZGSGLY2Token,
      );

      const AZG3Token = await getToken('AZG3', '123456');
      const DDId = 5;
      const GTId = 10;
      const imageUrls = ['imageUrl_FK27', 'imageUrl_FK28'];

      const response = await post(
        'anZhuangFanKuiQuanJingDPTuPian',
        {
          DDId,
          GTId,
          imageUrls,
        },
        AZG3Token,
      );
      assert.equal(response.data.code, 1);

      let dddwdpList = [39, 40, 41];
      for (let item of dddwdpList) {
        const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
        assert.equal(dddwdp.dataValues.status, DD_DW_DPStatus.WC);
      }

      for (let item of imageUrls) {
        const dpqjfkt = await DPQJFKT.findOne({ where: { imageUrl: item } });
        assert.equal(dpqjfkt.dataValues.UserId, 38);
      }
    });
  });

  describe.only('标准restful', async () => {
    // 新建AZG [AZGSGLY]
    describe('createAZG', async () => {
      describe('成功', async () => {
        it('AZGSGLY创建AZG', async () => {
          const username = 'AZG_T';
          const password = '123456';

          let response = await post(
            'createAZG',
            {
              username,
              password,
            },
            AZGSGLYToken
          );
          assert.equal(response.data.code, 1);

          let user = await User.findOne({ where: { username } });
          assert.notEqual(user, null);
          let azg_azgs = await AZG_AZGS.findOne({ where: { UserId: user.dataValues.id } });
          assert.notEqual(azg_azgs, null);
        });
      });
      describe('失败', async () => {
        describe('数据不合法', async () => { });
        describe('没有权限', async () => { });
        describe('操作状态不正确', async () => { });
        describe('唯一性校验', async () => { });
      });
    });
    //新增非标准restful

    describe('UserTable', async () => {
      it('admin获取User列表', async () => {
        const curPage = 0;
        const JSList = [JS.ADMIN, JS.PPJL, JS.KFJL, JS.GZ, JS.GTBA, JS.GYSGLY, JS.AZGSGLY];
        const trueUserList =
          [
            'admin',
            'PPJL1',
            'PPJL2',
            'PPJL3',
            'PPJL4',
            'PPJL5',
            'PPJL6',
            'KFJL1',
            'KFJL2',
            'KFJL3',
            'KFJL4',
            'KFJL5',
            'KFJL6',
            'GZ1',
            'GZ2',
            'GZ3',
            'GZ_T',
            'GTBA1',
            'GTBA2',
            'GTBA3',
            'GTBA4',
            'GTBA5',
            'GTBA6',
            'GTBA7',
            'GTBA8',
            'GTBA9',
            'GTBA10',
            'GTBA11',
            'GYSGLY1',
            'GYSGLY2',
            'GYSGLY3',
            'AZGSGLY1',
            'AZGSGLY2',
            'ZHY1',
            'ZHY2',
            'ZHY3',
            'ZHY4',
            'AZG1',
            'AZG2',
            'AZG3',
          ];

        let response = await get(
          'User',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
        let getJSList = [];
        let getUserList = [];
        getJSList = response.data.data.list.map(item => (item.JS));
        assert.includeMembers(getJSList, JSList);
        getUserList = response.data.data.list.map(item => (item.username));
        assert.sameDeepMembers(getUserList, trueUserList);
      });

      it('PPJL获取User列表', async () => {
        const curPage = 0;
        const JSList = [JS.PPJL, JS.KFJL, JS.GZ, JS.GTBA, JS.GYSGLY, JS.AZGSGLY];
        const trueUserList =
          [
            'PPJL1',
            'KFJL1',
            'GZ1',
            'GZ2',
            'GZ_T',
            'GTBA1',
            'GTBA2',
            'GTBA3',
            'GTBA4',
            'GTBA5',
            'GYSGLY1',
            'GYSGLY2',
            'GYSGLY3',
            'AZGSGLY1',
            'AZGSGLY2',
          ];

        let response = await get(
          'User',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
        let getJSList = [];
        let getUserList = [];
        getJSList = response.data.data.list.map(item => (item.JS));
        assert.includeMembers(getJSList, JSList);
        getUserList = response.data.data.list.map(item => (item.username));
        assert.sameDeepMembers(getUserList, trueUserList);
      });

      it('KFJL获取User列表', async () => {
        const curPage = 0;
        const JSList = [JS.PPJL, JS.KFJL, JS.GZ, JS.GTBA, JS.GYSGLY, JS.AZGSGLY];
        const trueUserList =
          [
            'PPJL1',
            'KFJL1',
            'GZ1',
            'GZ2',
            'GZ_T',
            'GTBA1',
            'GTBA2',
            'GTBA3',
            'GTBA4',
            'GTBA5',
            'GYSGLY1',
            'GYSGLY2',
            'GYSGLY3',
            'AZGSGLY1',
            'AZGSGLY2'
          ];

        let response = await get(
          'User',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
        let getJSList = [];
        let getUserList = [];
        getJSList = response.data.data.list.map(item => (item.JS));
        assert.includeMembers(getJSList, JSList);
        getUserList = response.data.data.list.map(item => (item.username));
        assert.sameDeepMembers(getUserList, trueUserList);
      });

      it('GYSGLY获取User列表', async () => {
        const curPage = 0;
        const JSList = [JS.GYSGLY, JS.ZHY];
        const trueUserList =
          [
            'GYSGLY1',
            'ZHY1',
            'ZHY2',
          ];

        let response = await get(
          'User',
          {
            curPage,
          },
          GYSGLYToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
        let getJSList = [];
        let getUserList = [];
        getJSList = response.data.data.list.map(item => (item.JS));
        assert.includeMembers(getJSList, JSList);
        getUserList = response.data.data.list.map(item => (item.username));
        assert.sameDeepMembers(getUserList, trueUserList);
      });

      it('AZGSGLY获取User列表', async () => {
        const curPage = 0;
        const JSList = [JS.AZG, JS.AZGSGLY];
        const trueUserList =
          [
            'AZGSGLY1',
            'AZG1',
            'AZG2',
          ];

        let response = await get(
          'User',
          {
            curPage,
          },
          AZGSGLYToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
        let getJSList = [];
        let getUserList = [];
        getJSList = response.data.data.list.map(item => (item.JS));
        assert.includeMembers(getJSList, JSList);
        getUserList = response.data.data.list.map(item => (item.username));
        assert.sameDeepMembers(getUserList, trueUserList);
      });

      it('admin获取单个User', async () => {
        const curPage = 0;

        let response = await get(
          'User/1',
          {
            curPage
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('admin模糊搜索User', async () => {
        const curPage = 0;
        const keyword = 'admin';

        let response = await get(
          'User',
          {
            curPage,
            keyword,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('GYSTable', async () => {
      it('KFJL获取GYS列表', async () => {
        const curPage = 0;

        let response = await get(
          'GYS',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取GYS列表', async () => {
        const curPage = 0;

        let response = await get(
          'GYS',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取GYS列表', async () => {
        const curPage = 0;

        let response = await get(
          'GYS',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('GYSGLY获取GYS列表', async () => {
        const curPage = 0;

        let response = await get(
          'GYS',
          {
            curPage,
          },
          GYSGLYToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('ZHY获取GYS列表', async () => {
        const curPage = 0;

        let response = await get(
          'GYS',
          {
            curPage,
          },
          ZHYToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个GYS', async () => {
        const curPage = 0;

        let response = await get(
          'GYS/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索GYS', async () => {
        const curPage = 0;
        const keyword = 'GYS';

        let response = await get(
          'GYS',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('AZGSTable', async () => {
      it('KFJL获取AZGS列表', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取AZGS列表', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取AZGS列表', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('AZGSGLY获取AZGS列表', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS',
          {
            curPage,
          },
          AZGSGLYToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('AZG获取AZGS列表', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS',
          {
            curPage,
          },
          AZGToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个AZGS', async () => {
        const curPage = 0;

        let response = await get(
          'AZGS/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索AZGS', async () => {
        const curPage = 0;
        const keyword = 'AZGS';

        let response = await get(
          'AZGS',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('DPTable', async () => {
      it('KFJL修改DP', async () => {
        const name = 'DP1';
        const PPId = 1;
        const imageUrl = 'imageUrl_T';

        let response = await put(
          'DP/1',
          {
            name,
            PPId,
            imageUrl,
          },
          KFJLToken
        );
        console.log('izzlog', response.data)
        assert.equal(response.data.code, 1);

        let dp = await DP.findOne({ where: { id: 1 } });
        assert.equal(dp.dataValues.imageUrl, imageUrl);
      });

      it('KFJL获取DP列表', async () => {
        const curPage = 0;

        let response = await get(
          'DP',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取DP列表', async () => {
        const curPage = 0;

        let response = await get(
          'DP',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取DP列表', async () => {
        const curPage = 0;

        let response = await get(
          'DP',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个DP', async () => {
        const curPage = 0;

        let response = await get(
          'DP/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索DP', async () => {
        const curPage = 0;
        const keyword = 'DP';

        let response = await get(
          'DP',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      describe('失败', async () => {
        it('KFJL修改其他PP的DP', async () => {
          const name = 'DP5';
          const PPId = 1;
          const imageUrl = 'imageUrl_T';

          let response = await put(
            'DP/5',
            {
              name,
              PPId,
              imageUrl,
            },
            KFJLToken
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
    });

    describe('DWTable', async () => {
      it('KFJL修改DW', async () => {
        const CC = '10000';

        let response = await put(
          'DW/1',
          {
            CC,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);

        let dw = await DW.findOne({ where: { id: 1 } });
        assert.equal(dw.dataValues.CC, CC);
      });

      it('KFJL获取DW列表', async () => {
        const curPage = 0;

        let response = await get(
          'DW',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取DW列表', async () => {
        const curPage = 0;

        let response = await get(
          'DW',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取DW列表', async () => {
        const curPage = 0;

        let response = await get(
          'DW',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个DW', async () => {
        const curPage = 0;

        let response = await get(
          'DW/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索DW', async () => {
        const curPage = 0;
        const keyword = 'DW';

        let response = await get(
          'DW',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      describe('失败', async () => {
        it('KFJL修改其他PP的DW', async () => {
          const CC = '10000';

          let response = await put(
            'DW/4',
            {
              CC,
            },
            KFJLToken
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
    });

    describe('PPTable', async () => {
      it('admin获取PP列表', async () => {
        const curPage = 0;

        let response = await get(
          'PP',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取PP列表', async () => {
        const curPage = 0;

        let response = await get(
          'PP',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取PP列表', async () => {
        const curPage = 0;

        let response = await get(
          'PP',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('GTBA获取PP列表', async () => {
        const curPage = 0;

        let response = await get(
          'PP',
          {
            curPage,
          },
          GTBAToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('GZ获取PP列表', async () => {
        const curPage = 0;

        let response = await get(
          'PP',
          {
            curPage,
          },
          GZToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取单个PP', async () => {
        const curPage = 0;

        let response = await get(
          'PP/1',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('admin模糊搜索PP', async () => {
        const curPage = 0;
        const keyword = 'PP';

        let response = await get(
          'PP',
          {
            curPage,
            keyword,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('WLTable', async () => {
      it('KFJL修改WL', async () => {
        const imageUrl = 'imageUrl10000';

        let response = await put(
          'DW/1',
          {
            imageUrl,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);

        let wl = await WL.findOne({ where: { id: 1 } });
        assert.equal(wl.dataValues.imageUrl, imageUrl);
      });

      it('KFJL获取WL列表', async () => {
        const curPage = 0;

        let response = await get(
          'WL',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取WL列表', async () => {
        const curPage = 0;

        let response = await get(
          'WL',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取WL列表', async () => {
        const curPage = 0;

        let response = await get(
          'WL',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取WL列表', async () => {
        const curPage = 0;

        let response = await get(
          'WL',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个WL', async () => {
        const curPage = 0;

        let response = await get(
          'WL/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索WL', async () => {
        const curPage = 0;
        const keyword = 'WL';

        let response = await get(
          'WL',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      describe('失败', async () => {
        it('KFJL修改其他PP的WL', async () => {
          const imageUrl = 'imageUrl10000';

          let response = await put(
            'DW/7',
            {
              imageUrl,
            },
            KFJLToken
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
    });

    describe('FGTesterTable', async () => {
      it('KFJL获取FGTester列表', async () => {
        const curPage = 0;

        let response = await get(
          'FGTester',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取FGTester列表', async () => {
        const curPage = 0;

        let response = await get(
          'FGTester',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取FGTester列表', async () => {
        const curPage = 0;

        let response = await get(
          'FGTester',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个FGTester', async () => {
        const curPage = 0;

        let response = await get(
          'FGTester/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索FGTester', async () => {
        const curPage = 0;
        const keyword = 'FGTester';

        let response = await get(
          'FGTester',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('DDTable', async () => {
      it('KFJL获取DD列表', async () => {
        const curPage = 0;

        let response = await get(
          'DD',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取DD列表', async () => {
        const curPage = 0;

        let response = await get(
          'DD',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取DD列表', async () => {
        const curPage = 0;

        let response = await get(
          'DD',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个DD', async () => {
        let KFJL2Token = await getToken('KFJL2', '123456');
        const curPage = 0;

        let response = await get(
          'DD/1',
          {
            curPage,
          },
          KFJL2Token
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索DD', async () => {
        const curPage = 0;
        const keyword = 'DD';

        let response = await get(
          'DD',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('EJZHTable', async () => {
      it('KFJL获取EJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'EJZH',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取EJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'EJZH',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取EJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'EJZH',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个EJZH', async () => {
        const curPage = 0;

        let response = await get(
          'EJZH/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索EJZH', async () => {
        const curPage = 0;
        const keyword = 'EJZH';

        let response = await get(
          'EJZH',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });

    describe('GTTable', async () => {
      it('KFJL修改GT信息', async () => {
        const tempQY = QY.EAST;

        let response = await put(
          'GT/1',
          {
            QY: tempQY,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);

        let gt = await GT.findOne({ where: { id: 1 } });
        assert.equal(gt.dataValues.QY, tempQY);
      });

      it('admin修改GT信息', async () => {
        const tempQY = QY.EAST;

        let response = await put(
          'GT/1',
          {
            QY: tempQY,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);

        let gt = await GT.findOne({ where: { id: 1 } });
        assert.equal(gt.dataValues.QY, tempQY);
      });

      it('KFJL获取GT列表', async () => {
        const curPage = 0;

        let response = await get(
          'GT',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取GT列表', async () => {
        const curPage = 0;

        let response = await get(
          'GT',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('GTBA获取GT列表', async () => {
        const curPage = 0;

        let response = await get(
          'GT',
          {
            curPage,
          },
          GTBAToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('GZ获取GT列表', async () => {
        const curPage = 0;

        let response = await get(
          'GT',
          {
            curPage,
          },
          GZToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取GT列表', async () => {
        const curPage = 0;

        let response = await get(
          'GT',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个GT', async () => {
        const curPage = 0;

        let response = await get(
          'GT/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索GT', async () => {
        const curPage = 0;
        const keyword = 'GT';

        let response = await get(
          'GT',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      describe('失败', async () => {
        it('KFJL修改其他PP的GT信息', async () => {
          const tempQY = QY.EAST;

          let response = await put(
            'GT/7',
            {
              QY: tempQY,
            },
            KFJLToken
          );
          console.log(response.data)
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '权限');
        });
      });
    });

    describe('YJZHTable', async () => {
      it('KFJL获取YJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'YJZH',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('admin获取YJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'YJZH',
          {
            curPage,
          },
          adminToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('PPJL获取YJZH列表', async () => {
        const curPage = 0;

        let response = await get(
          'YJZH',
          {
            curPage,
          },
          PPJLToken
        );
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });

      it('KFJL获取单个YJZH', async () => {
        const curPage = 0;

        let response = await get(
          'YJZH/1',
          {
            curPage,
          },
          KFJLToken
        );
        assert.equal(response.data.code, 1);
        assert.equal(response.data.data.id, 1);
      });

      it('KFJL模糊搜索YJZH', async () => {
        const curPage = 0;
        const keyword = 'YJZH';

        let response = await get(
          'YJZH',
          {
            curPage,
            keyword,
          },
          KFJLToken
        );
        console.log(response.data)
        assert.equal(response.data.code, 1);
        assert.notEqual(response.data.data.length, 0);
      });
    });
  });
});
