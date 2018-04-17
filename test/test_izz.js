import { assert } from 'chai';
import Sequelize from 'sequelize';
import mysql from 'mysql2';
import axios from 'axios';
import debug from 'debug';
import fs from 'fs';
import _ from 'lodash';

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
} from '../models/Model';

const isArrayEqual = function (x, y) {
  return _(x).differenceWith(y, _.isEqual).isEmpty();
};

const readFile = (path, opts = 'utf8') =>
  new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });

const getToken = async (username, password) => {
  const r = await axios.post(`${baseUrl}/auth/signin`, {
    username,
    password,
  });
  return r.data.token;
};

const post = async (path, body, token) => {
  try {
    const r = await axios.post(`${api}/${path}`, body, {
      headers: {
        Authorization: `bearer ${token}`,
      },
    });

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

  return r;
};

const get = async (path, params, token) => {
  const r = await axios.get(`${api}/${path}`, {
    params,
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  return r;
};

const getUserIdList = (r) => {
  const userIdList = [];
  for (let i = 0; i < r.length; i++) {
    userIdList.push(r[i].dataValues.UserId);
  }

  return userIdList;
};

const replaceAll = (str, target, replacement) => str.replace(new RegExp(target, 'g'), replacement);

process.env.NODE_ENV = 'test';
const server = require('../app');

const ppLog = debug('ppLog');
const baseUrl = 'http://localhost:3001';
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

describe('SPRT测试', () => {
  beforeEach(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'tcltcl',
    });

    await con.connect();
    await con.query('DROP DATABASE IF EXISTS cltp');
    await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    const data = await readFile(`${__dirname}/../tools_izz/initDataScript_izz.sql`);

    const scriptArr = data.split(';');

    await sequelize.sync({ force: true });

    for (let i = 0; i < scriptArr.length; i++) {
      if (scriptArr[i].trim().length > 0) {
        const r = await sequelize.query(scriptArr[i], null, { raw: true, type: 'INSERT' });
      }
    }

    // 创建View
    const viewSql = await readFile(`${__dirname}/../tools/dbViewScript.sql`, 'utf8');
    await sequelize.query(viewSql, {
      type: sequelize.QueryTypes.SELECT,
    });
    // end 创建View

    // 创建Procedure
    const procedureSql = await readFile(`${__dirname}/../tools/dbProcedureScript.sql`);
    const procedureSql1 = replaceAll(procedureSql, '_DDStatus\\.DSP_', DDStatus.DSP);
    const procedureSql2 = replaceAll(procedureSql1, '__DDStatus\\.YSP_', DDStatus.YSP);
    await sequelize.query(procedureSql2, {
      type: sequelize.QueryTypes.SELECT,
    });
    // end 创建创建Procedure

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

  describe('test', async () => {
    it('small test', async () => {
      assert.equal(1, 1);
    });
  });

  // 格式说明
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
      });// PP1的KFJL_T变成KFJL1
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

        const user = await User.findOne({ where: { id: gt.dataValues.GTBAUserId } });
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
          const GTId = 5;
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
        const GZId = 15;
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
        GTIds.forEach((item) => {
          assert.include(GTIdList, item);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL为不属于自己管理的GT分配GZ', async () => {
          const GZId = 42;
          const GTIds = [10, 11];
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
          const GZId = 15;
          const GTIds = [10, 11];
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

        const r = await GLY_GYS.findAll({ where: { GYSId: gys.dataValues.id } });
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

        const r = await GLY_AZGS.findAll({ where: { AZGSId: azgs.dataValues.id } });
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
    describe.skip('成功', async () => {
      it('KFJL新建DW', async () => {
        const name = 'DW_T';
        const GTId = 1;

        const response = await post(
          'DW',
          {
            name,
            GTId,
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
          const GTId = 5;

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
    describe.skip('成功', async () => {
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
      describe.skip('数据不合法', async () => { });
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
      describe.skip('操作状态不正确', async () => { });
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
        const KFJL2Token = await getToken('KFJL2', '123456');
        const DPId = 4;
        const DWIds = [7, 8];
        const response = await post(
          'setDPDWs',
          {
            id: DPId,
            DWIds,
          },
          KFJL2Token,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(async (item) => {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        });
      });

      it('KFJL将DP关联多个GT的DW', async () => {
        await post(
          'createPPJL',
          {
            PPId: 7,
            username: 'PPJL7',
            password: '123456',
          },
          adminToken,
        );
        const PPJL7Token = await getToken('PPJL7', '123456');
        await post(
          'createKFJL',
          {
            PPId: 7,
            username: 'KFJL7',
            password: '123456',
          },
          PPJL7Token,
        );
        const KFJL7Token = await getToken('KFJL7', '123456');
        const DPId = 14;
        const DWIds = [18, 19];
        const response = await post(
          'setDPDWs',
          {
            id: DPId,
            DWIds,
          },
          KFJL7Token,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(async (item) => {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        });
      });

      it('KFJL将GT的DW由DP1修改成DP2', async () => {
        const DPId = 2;
        const DWIds = [1];
        const response = await post(
          'setDPDWs',
          {
            id: DPId,
            DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(async (item) => {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => {
      });
      describe('没有权限', async () => {
        it('KFJL配置不属于自己管理的PP的DP', async () => {
          const DPId = 4;
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
          const DWIds = [7];
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

  // KFJL 创建 FG, Tester, FGTester
  describe('/createFGAndTesterAndFGTester', async () => {
    describe('成功', async () => {
      it('KFJL创建系统中均不存在的FG、Tester组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG_T',
          note: 'note_T',
          Testers: ['Tester_T1', 'Tester_T2'],
        };

        const response = await post(
          'createFGAndTesterAndFGTester',
          {
            PPId,
            FGPayload,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const fg = await FG.findOne({ where: { name: 'FG_T' } });
        assert.notEqual(fg, null);

        FGPayload.Testers.forEach(async (item) => {
          const tester = await Tester.findOne({ where: { name: item } });
          assert.notEqual(tester, null);
        });

        const r = await FG_Tester.findAll({ where: { PPId: 1 } });
        r.forEach(async (item) => {
          assert.include(item.dataValues, FGPayload);
        });
      });// 前置条件：FG_T,Tester1&Tester2数据库中不存在

      it('KFJL创建FG已经存在，Tester均不存在的组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG1',
          note: 'note_T',
          Testers: ['Tester_T1', 'Tester_T2'],
        };
        const response = await post(
          'createFGAndTesterAndFGTester',
          {
            PPId,
            FGPayload,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const fg = await FG.findOne({ where: { name: 'FG1' } });
        assert.notEqual(fg, null);

        FGPayload.Testers.forEach(async (item) => {
          const tester = await Tester.findOne({ where: { name: item } });
          assert.notEqual(tester, null);
        });

        const r = await FG_Tester.findAll({ where: { PPId: 1 } });
        r.forEach(async (item) => {
          assert.include(item.dataValues, FGPayload);
        });
      });// 前置条件：FG_T存在，Tester1&Tester2数据库中不存在

      it('KFJL创建FG不存在，Tester存在的组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG_T',
          note: 'note_T',
          Testers: ['Tester1', 'Tester2'],
        };

        const response = await post(
          'createFGAndTesterAndFGTester',
          {
            PPId,
            FGPayload,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const fg = await FG.findOne({ where: { name: 'FG_T' } });
        assert.notEqual(fg, null);

        FGPayload.Testers.forEach(async (item) => {
          const tester = await Tester.findOne({ where: { name: item } });
          assert.notEqual(tester, null);
        });

        const r = await FG_Tester.findAll({ where: { PPId: 1 } });
        r.forEach(async (item) => {
          assert.include(item.dataValues, FGPayload);
        });
      });// 前置条件：FG_T不存在，Tester1&Tester2数据库中存在
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => {
      });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的PP的FGTester', async () => {
          const PPId = 2;
          const FGPayload = {
            name: 'FG_T',
            note: 'note_T',
            Testers: ['Tester_T1', 'Tester_T2'],
          };

          const response = await post(
            'createFGAndTesterAndFGTester',
            {
              PPId,
              FGPayload,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => {
      });
    });
  });

  // KFJL 创建 EJZH id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
  describe('/createEJZH', async () => {
    describe('成功', async () => {
      it('KFJL创建不包含WL和FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 5;
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 0);
      });// WL和FGTester均没有

      it('KFJL创建仅包含FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 5;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 0);
      });// 仅FGTesters

      it('KFJL创建仅包含SJWL的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 5;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [];
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.notEqual(ejzh_sjwl.length, 0);
      });// 仅SJWLs

      it('KFJL创建包含FGTester和SJWL的EJZH-1', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 5;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 2);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 1);
      });// FGTesters&SJWLs

      it('KFJL创建包含FGTester和SJWL的EJZH-2', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 5;
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
            id: 2,
            number: 2,
          },
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
            FGTesters,
            SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { name } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 1);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 2);
      });// FGTesters&SJWLs
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
          const WLId = 5;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [
            {
              id: 5,
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
          assert.equal(response.data.code, -1);
        });
      });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的PP的EJZH', async () => {
          const PPId = 2;
          const name = 'EJZH_T';
          const WLId = 18;
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
          const WLId = 18;
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
        const EJZHId = 1;
        const WLId = 5;
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        assert.equal(ejzh_sjwl.length, 0);
      });

      it('KFJL编辑EJZH-修改EJWL&imageUrl&XGTs', async () => {
        const EJZHId = 1;
        const WLId = 6;
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId } });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        assert.equal(ejzh_sjwl.length, 0);

        const ejzhxgt = await EJZHXGT.findOne({ where: { EJZHId } });
        assert.equal(ejzhxgt.dataValues.imageUrl, XGTs[0]);
      });

      it('KFJL编辑EJZH-新增一组FGTester&SJWL', async () => {
        const EJZHId = 2;
        const WLId = 6;
        const imageUrl = 'imageUrlEJZH1';
        const XGTs = ['EJZH1Url1'];
        const FGTesters = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
            number: 2,
          },
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId } });
        const FGTesterIdList = [];
        ejzh_fg_tester.forEach((item) => {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        });
        assert.equal(FGTesterIdList.length, 3);
        FGTesters.forEach((item) => {
          assert.include(FGTesterIdList, item.id);
        });

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        const SJWLIdList = [];
        ejzh_sjwl.forEach((item) => {
          SJWLIdList.push(item.dataValues.WLId);
        });
        assert.equal(SJWLIdList.length, 2);
        SJWLs.forEach((item) => {
          assert.include(SJWLIdList, item.id);
        });
      });

      it('KFJL编辑EJZH-将原FGTester&SJWL修改成新的', async () => {
        const EJZHId = 2;
        const WLId = 6;
        const imageUrl = 'imageUrlEJZH_T1';
        const XGTs = ['EJZH1Url_T1'];
        const FGTesters = [
          {
            id: 1,
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

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId } });
        const FGTesterIdList = [];
        ejzh_fg_tester.forEach((item) => {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        });
        assert.equal(FGTesterIdList.length, 1);
        FGTesters.forEach((item) => {
          assert.include(FGTesterIdList, item.id);
        });

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId } });
        const SJWLIdList = [];
        ejzh_sjwl.forEach((item) => {
          SJWLIdList.push(item.dataValues.WLId);
        });
        assert.equal(SJWLIdList.length, 1);
        SJWLs.forEach((item) => {
          assert.include(SJWLIdList, item.id);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => {

      });
      describe('没有权限', async () => {
        it('KFJL编辑不属于自己管理的EJZH', async () => {
          const EJZHId = 7;
          const WLId = 5;
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
          const WLId = 18;
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
        const WLId = 11;
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

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: yjzh.dataValues.id } });
        assert.equal(yjzh_ejzh.length, 0);
      });// 没有EJZH

      it('KFJL创建YJZH-包含多组EJZH', async () => {
        const PPId = 1;
        const name = 'YJZH_T';
        const WLId = 11;
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

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: yjzh.dataValues.id } });
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
        const YJZHId = 1;
        const WLId = 11;
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
        const WLId = 12;
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
        const WLId = 12;
        const imageUrl = 'imageUrlYJZH2';
        const XGTs = ['YJZH1Url2'];
        const EJZHs = [
          {
            id: 2,
            number: 2,
          },
          {
            id: 3,
            number: 2,
          },
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
        yjzh_ejzh.forEach((item) => {
          EJZHIdList.push(item.dataValues.EJZHId);
        });
        assert.equal(EJZHIdList.length, 3);
        EJZHs.forEach((item) => {
          assert.include(EJZHIdList, item.id);
        });
      });

      it('KFJL编辑YJZH-替换原EJZH', async () => {
        const YJZHId = 1;
        const WLId = 12;
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

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId } });

        const EJZHIdList = [];
        yjzh_ejzh.forEach((item) => {
          EJZHIdList.push(item.dataValues.EJZHId);
        });
        assert.equal(EJZHIdList.length, 1);
        EJZHs.forEach((item) => {
          assert.include(EJZHIdList, item.id);
        });
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
        gt_yjzh.forEach((item) => {
          GTIdList.push(item.dataValues.GTId);
        });
        assert.equal(GTIdList.length, 2);
        GTs.forEach((item) => {
          assert.include(GTIdList, item.id);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL将YJZH配置到不属于自己管理的GT', async () => {
          const YJZHId = 1;
          const GTs = [
            {
              id: 5,
              number: 2,
            },
            {
              id: 6,
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

          console.log('pairCoding_izz_test');
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '没有权限');
        });

        it('KFJL配置不属于自己管理的YJZH', async () => {
          const YJZHId = 7;
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

        const dd_gt_wl = await DD_GT_WL.findAll({ where: { DDId: dd.dataValues.id } });
        let ddgtwlList = [];
        ddgtwlList = dd_gt_wl.map(item => ({
          GTId: item.dataValues.GTId,
          WLId: item.dataValues.WLId,
          number: item.dataValues.number,
        }));
        const tureddgtwlList = [
          { GTId: 1, WLId: 11, number: 2 },
          { GTId: 1, WLId: 5, number: 4 },
          { GTId: 2, WLId: 12, number: 2 },
          { GTId: 2, WLId: 13, number: 2 },
          { GTId: 2, WLId: 5, number: 4 },
          { GTId: 2, WLId: 6, number: 4 },
          { GTId: 2, WLId: 7, number: 4 },
          { GTId: 2, WLId: 1, number: 8 },
          { GTId: 2, WLId: 2, number: 8 },
          { GTId: 2, WLId: 3, number: 8 },
          { GTId: 3, WLId: 11, number: 2 },
          { GTId: 3, WLId: 5, number: 4 },
          { GTId: 4, WLId: 14, number: 2 },
          { GTId: 4, WLId: 15, number: 2 },
          { GTId: 4, WLId: 16, number: 2 },
          { GTId: 4, WLId: 8, number: 4 },
          { GTId: 4, WLId: 10, number: 4 },
          { GTId: 4, WLId: 1, number: 8 },
        ];
        assert.equal(isArrayEqual(ddgtwlList, tureddgtwlList), true);

        const dddwdp = await DD_DW_DP.findAll({ where: { DDId: dd.dataValues.id } });
        let dddwdpList = [];
        dddwdpList = dddwdp.map(item => ({
          DWId: item.dataValues.DWId,
          DPId: item.dataValues.DPId,
        }));
        const truedddwdpList = [
          { DWId: 1, DPId: 1 },
          { DWId: 2, DPId: 2 },
          { DWId: 3, DPId: 2 },
          { DWId: 4, DPId: 1 },
          { DWId: 5, DPId: 2 },
          { DWId: 6, DPId: 3 },
        ];
        assert.equal(isArrayEqual(dddwdpList, truedddwdpList), true);
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL创建不属于自己管理的PP的DD', async () => {
          const PPId = 4;
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
          // assert.include(response.data.msg, '订单相关操作正在进行中');
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
        // 订单内数据有效；
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe.skip('没有权限', async () => { });
      describe('操作状态不正确', async () => {
        it('KFJL重新生成已经审批通过的DD', async () => {
          const KFJL4Token = await getToken('KFJL4', '123456');
          const DDId = 3;

          const response = await post(
            'reCreateDD',
            {
              DDId,
            },
            KFJL4Token,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 设置DD_GTFXs [KFJL]
  describe.skip('/setDDGTFXs', async () => {
    describe('成功', async () => {
      it('客服经理成功翻新柜台', async () => {
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {

      });
      describe('没有权限', async () => {
        it('非客服经理登入', async () => {

        });
        it('该柜台非客服经理所属品牌下柜台', async () => {

        });
      });
      describe('操作状态不正确', async () => {
        it('当前品牌有正在进行的订单', async () => {

        });
      });
      describe('唯一性校验', async () => {

      });
    });
  });

  // 批量设置DD_GT_WL的AZGS [PPJL]
  describe('/setDDGTWLs0AZGS', async () => {
    describe('成功', async () => {
      it('PPJL配置DD_GT_WL的AZGS', async () => {
        const PPJL2Token = await getToken('PPJL2', '123456');
        const AZGSId = 5;
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

        DD_GT_WLIds.forEach(async (item) => {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.AZGSId, AZGSId);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的DD配置AZGS', async () => {
          const AZGSId = 5;
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
          const PPJL4Token = await getToken('PPJL4', '123456');
          const AZGSId = 5;
          const DD_GT_WLIds = [7, 8, 9];

          const response = await post(
            'setDDGTWLs0AZGS',
            {
              DD_GT_WLIds,
              AZGSId,
            },
            PPJL4Token,
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
        const AZGSId = 5;
        const DD_DW_DPIds = [1, 2];

        const response = await post(
          'setDDDWDPs0AZGS',
          {
            DD_DW_DPIds,
            AZGSId,
          },
          PPJL2Token,
        );
        assert.equal(response.data.code, 1);

        DD_DW_DPIds.forEach(async (item) => {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.AZGSId, AZGSId);
        });
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的DD配置AZGS', async () => {
          const AZGSId = 5;
          const DD_DW_DPIds = [1, 2];

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
          const PPJL4Token = await getToken('PPJL4', '123456');
          const AZGSId = 5;
          const DD_DW_DPIds = [5, 6];

          const response = await post(
            'setDDDWDPs0AZGS',
            {
              DD_DW_DPIds,
              AZGSId,
            },
            PPJL4Token,
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
          const PPJL4Token = await getToken('PPJL4', '123456');
          const id = 3;

          const response = await post(
            'approveDD',
            {
              id,
            },
            PPJL4Token,
          );
          assert.equal(response.data.code, -1);
          assert.include(response.data.msg, '不能被审批');
        });
      });
      describe('唯一性校验', async () => { });
    });
  });

  // 批量设置DD_GT_WL的发货GYS [GYSGLY]
  describe('/setDDGTWLs0GYS', async () => {
    describe('成功', async () => {
      it('GYSGLY设置DD_GT_WL的发货GYS', async () => {
        let GYSGLY6Token = await getToken('GYSGLY6', '123456');
        const DD_GT_WLIds = [7, 8];
        const GYSId = 5;

        const response = await post(
          'setDDGTWLs0GYS',
          {
            DD_GT_WLIds,
            GYSId,
          },
          GYSGLY6Token,
        );
        assert.equal(response.data.code, 1);

        DD_GT_WLIds.forEach(async (item) => {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtw.dataValues.GYSId, GYSId);
        });
      });

      it('GYSGLY设置还未审批通过的DD的DD_GT_WL', async () => {

      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => { });
    //   describe('没有权限', async () => {
    //     it('GYSGLY设置不属于自己管理的DD_GT_WL的发货GYS', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => { });
    //   describe('唯一性校验', async () => { });
    // });
  });

  // 批量设置DD_DW_DP的发货GYS [GYSGLY]
  describe('/setDDDWDPs0GYS', async () => {
    describe('成功', async () => {
      it('GYSGLY设置DD_DW_DP的发货GYS', async () => {
        let GYSGLY6Token = await getToken('GYSGLY6', '123456');
        const DD_DW_DPIds = [5, 6];
        const GYSId = 5;

        const response = await post(
          'setDDDWDPs0GYS',
          {
            DD_DW_DPIds,
            GYSId,
          },
          GYSGLY6Token,
        );
        assert.equal(response.data.code, 1);

        DD_DW_DPIds.forEach(async (item) => {
          const dddwdp = await findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.GYSId, GYSId);
        });
      });

      it('GYSGLY设置还未审批通过的DD的DD_DW_DP的发货GYS', async () => {

      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => { });
    //   describe('没有权限', async () => {
    //     it('GYSGLY设置不属于自己管理的DD_DW_DP的发货GYS', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => { });
    //   describe('唯一性校验', async () => { });
    // });
  });

  // 批量设置DD_GT_WL的AZG [AZGSGLY]
  describe('/setDDGTWLs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY设置DD_GT_WL的AZG', async () => {
        let AZGSGLY5Token = await getToken('AZGSGLY5', '123456');
        const DD_GT_WLIds = [7, 8];
        const AZGUserId = 39;

        const response = await post(
          'setDDGTWLs0AZG',
          {
            DD_GT_WLIds,
            AZGUserId,
          },
          AZGSGLY5Token,
        );
        assert.equal(response.data.code, 1);

        DD_GT_WLIds.forEach(async (item) => {
          const ddgtwl = await DD_GT_WL.findOne({ where: { id: item } });
          assert.equal(ddgtwl.dataValues.AZGUserId, AZGUserId);
        });
      });

      it('AZGSGLY设置还未审批通过的DD的DD_GT_WL的AZG', async () => {

      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => { });
    //   describe('没有权限', async () => {
    //     it('AZGSGLY设置不属于自己管理的DD_GT_WL的AZG', async () => {

    //     });
    //     it('AZGSGLY为DD_GT_WL设置不属于自己管理的AZG', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => { });
    //   describe('唯一性校验', async () => { });
    // });
  });

  // 批量设置DD_DW_DP的AZG [AZGSGLY]
  describe('/setDDDWDPs0AZG', async () => {
    describe('成功', async () => {
      it('AZGSGLY设置DD_DW_DP的AZG', async () => {
        let AZGSGLY5Token = await getToken('AZGSGLY5', '123456');
        const DD_DW_DPIds = [5, 6];
        const AZGUserId = 39;

        const response = await post(
          'setDDDWDPs0AZG',
          {
            DD_DW_DPIds,
            AZGUserId,
          },
          AZGSGLY5Token,
        );
        assert.equal(response.data.code, 1);

        DD_DW_DPIds.forEach(async (item) => {
          const dddwdp = await DD_DW_DP.findOne({ where: { id: item } });
          assert.equal(dddwdp.dataValues.AZGUserId, AZGUserId);
        });
      });

      it('GYSGLY设置还未审批通过的DD的DD_DW_DP的AZG', async () => {

      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => { });
    //   describe('没有权限', async () => {
    //     it('AZGSGLY设置不属于自己管理的DD_DW_DP的AZG', async () => {

    //     });

    //     it('AZGSGLY为DD_DW_DP设置不属于自己管理的AZG', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('当前品牌订单状态非已审批', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 批量入库 [ZHY]
  describe('/piLiangRuKu', async () => {
    describe('成功', async () => {
      it('ZHY入库WL', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const EWMs = [
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_6',
          },
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_7',
          },
        ];

        const response = await post(
          'piLiangRuKu',
          {
            EWMs,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        EWMs.forEach(async (item) => {
          const wywl = await WYWL.findOne({ where: { EWM: item.uuid } });
          assert.notEqual(wywl, null);

          const wywlcz = await WYWLCZ.findAll({ where: { WYWLId: wywl.dataValues.id } });
          assert.equal(wywlcz.length, 1);
          assert.include(wywlcz, '入库');
        });
      });
    });

    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非装货员登入', async () => {

    //     });
    //     it('二维码信息非物料/灯片', async () => {

    //     });
    //     it('二维码中物料/灯片不属于装货员所属的供应商/中转供应商', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('二维码状态为已入库之后的状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 装箱 [ZHY]
  describe('/zhuangXiang', async () => {
    describe('成功', async () => {
      it('ZHY装箱WL', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const DDId = 3;
        const GTId = 7;
        const HWEWMs = [
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_6',
          },
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_7',
          },
        ];
        const KDXEWM = {
          type: 'KDX',
          uuid: 'KDX_T',
        };

        const response = await post(
          'zhuangXiang',
          {
            DDId,
            GTId,
            HWEWMs,
            KDXEWM,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({ where: { WLId: HWEWMs[0].typeId } });
        assert.equal(ddgtwl.dataValues.ZXNumber, 5);

        HWEWMs.forEach(async (item) => {
          const wywl = await WYWL.findOne({ where: { EWM: item.uuid } });
          assert.notEqual(wywl, null);

          const wywlcz = await WYWLCZ.findAll({ where: { WYWLId: wywl.dataValues.id } });
          assert.equal(wywlcz.length, 1);
          assert.include(wywlcz, '装箱');
        });

        const kdx = await KDX.findOne({ where: { EWM: KDXEWM.uuid } });
        console.log('izzlog---->',kdx);
        assert.notEqual(kdx, null);
        assert.equal(ddgtwl.dataValues.KDXId, kdx.dataValues.id);
        //箱子如果不存在，要新建箱子；
        //装箱成功后物料待装箱数量相应减少；
        //装箱后货物状态更改为装箱；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非装货员登入', async () => {

    //     });
    //     it('货物二维码信息非物料/灯片', async () => {

    //     });
    //     it('货物二维码组信息非同属于物料/灯片', async () => {

    //     });
    //     it('货物二维码组物料/灯片不属于同一个装货员所属的供应商/中转供应商', async () => {

    //     });
    //     it('货物二维码信息非同属于同一个订单_柜台', async () => {

    //     });
    //     it('货物已装箱后箱内未增加唯一二维码记录，箱中对应物料应装数未减少', async () => {

    //     });
    //     it('如快递箱已存在，快递箱二维码信息非快递箱', async () => {

    //     });
    //     it('快递箱未存在且无法新建', async () => {

    //     });
    //     it('如快递箱已存在，快递箱所属柜台非当前柜台', async () => {

    //     });
    //   });

    //   describe('操作状态不正确', async () => {
    //     it('未装箱前，货物二维码状态为已入库之后的状态', async () => {

    //     });
    //     it('未装箱前，已有快递箱状态非装箱状态', async () => {

    //     });
    //     it('货物装箱数量超出该柜台应装数量', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 出箱 [ZHY]
  describe('/chuXiang', async () => {
    describe('成功', async () => {
      it.only('ZHY出箱货物', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const HWEWMs = [
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_3',
          },
          {
            type: 'WL',
            typeId: 23,
            uuid: 'WL23_4',
          },
          {
            type: 'DP',
            typeId: 8,
            uuid: 'DP9',
          },
        ];

        const response = await post(
          'chuXiang',
          {
            HWEWMs,
          },
          ZHY4Token,
        );
        console.log('izz--->',response.data);
        assert.equal(response.data.code, 1);

        const ddgtwl = await DD_GT_WL.findOne({ where: { WLId: HWEWMs[0].typeId } });
        assert.equal(ddgtwl.dataValues.ZXNumber, 1);
        assert.equal(ddgtwl.dataValues.KDXId, null);

        for (let i = 0; i < 2; i++) {
          const wywl = await WYWL.findOne({ where: { EWM: HWEWMs[i].uuid } });
          assert.notEqual(wywl, null);

          const wywlcz = await WYWLCZ.findAll({ where: { WYWLId: wywl.dataValues.id } });
          assert.equal(wywlcz.length, 2);
          assert.include(wywlcz, '入库');
        };

        const wydp = await WYDP.findOne({ where: { EWM: HWEWMs[2].uuid } });
        assert.notEqual(wywl, null);

        const wydpcz = await WYDPCZ.findAll({ where: { WYDPId: wydp.dataValues.id } });
        assert.equal(wydpcz.length, 2);
        assert.include(wydpcz, '入库');

        const dddwdp = await DD_DW_DP.findOne({ where: { id: wydp.dataValues.DDDWDPId } });
        assert.equal(dddwdp.dataValues.ZXNumber, 0);
        assert.equal(dddwdp.dataValues.KDXId, null);
        //出箱货物需为同一个装货员，但无需为同一个柜台；
        //出箱后货物待装箱数量增加；
        //出箱后货物状态更改为待入库状态；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非装货员登入', async () => {

    //     });
    //     it('货物二维码信息非物料/灯片', async () => {

    //     });
    //     it('货物二维码组物料/灯片不属于同一个装货员所属的供应商/中转供应商', async () => {

    //     });
    //     it('出箱后箱内该货物唯一二维码记录未从箱中清除，货物应装数量未相应增加', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未出箱前，货物二维码状态非装箱状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 关联快递 [ZHY]
  describe('/guanLianKuaiDi', async () => {
    describe('成功', async () => {
      it('ZHY关联快递', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const KDXEWMs = [
          {
            type: 'KDX',
            uuid: 'KDX1',
          },
        ];
        const KDDCode = 'KDD_T';

        const response = await post(
          'guanLianKuaiDi',
          {
            KDXEWMs,
            KDDCode,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdd = await KDD.findOne({ where: { name: KKDCode } });
        assert.notEqual(kdd, null);

        const kdx = await KDX.findOne({ where: { EWM: KDXEWMs[0].uuid } });
        assert.equal(kdx.dataValues.status, '发货');

        const wywl = await WYWL.findAll({ where: { KDXId: kdx.dataValues.id } });
        let wywlList = wywl.map(item => ({
          EWM: item.dataValues.EWM,
          status: item.dataValues.status,
        }));
        let truewywlList = [
          { EWM: WL23_3, status: 装箱 },
          { EWM: WL23_4, status: 装箱 },
          { EWM: WL23_5, status: 装箱 },
          { EWM: WL24_1, status: 装箱 },
          { EWM: WL24_2, status: 装箱 },
        ];
        assert.equal(isArrayEqual(wywlList, truewywlList), true);
        //快递箱成功关联后，快递箱状态转为发货状态；
        //快递箱成功关联后，箱中物料/灯片状态更改为发货状态
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非装货员登入', async () => {

    //     });
    //     it('快递箱二维码信息非快递箱', async () => {

    //     });
    //     it('快递箱二维码不属于同一个柜台', async () => {

    //     });
    //     it('快递单未存在且无法新建', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未关联快递前，快递箱二维码状态非装箱状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 解除关联快递 [ZHY]
  describe('/jieChuGuanLianKuaiDi', async () => {
    describe('成功', async () => {
      it('ZHY解除快递关联', async () => {
        let ZHY4Token = await getToken('ZHY4', '123456');
        const KDXEWMs = [
          {
            type: 'KDX',
            uuid: 'KDX2',
          },
        ];

        const response = await post(
          'jieChuGuanLianKuaiDi',
          {
            KDXEWMs,
          },
          ZHY4Token,
        );
        assert.equal(response.data.code, 1);

        const kdx = await KDX.findOne({ where: { EWM: KDXEWMs[0].uuid } });
        assert.equal(kdx.dataValues.KDDId, null);
        assert.equal(kdx.dataValues.status, '装箱');

        const wywl = await WYWL.findAll({ where: { KDXId: kdx.dataValues.id } });
        let wywlList = wywl.map(item => ({
          EWM: item.dataValues.EWM,
          status: item.dataValues.status,
        }));
        wywlList.forEach(item => {
          assert.equal(item.status, '装箱');
        });

        const wydp = await WYDP.findAll({ where: { KDXId: kdx.dataValues.id } });
        let wydpList = wydp.map(item => ({
          EWM: item.dataValues.EWM,
          status: item.dataValues.status,
        }));
        wydpList.forEach(item => {
          assert.equal(item.status, '装箱');
        });
        //解除关联后，快递箱状态更改为装箱状态；
        //解除关联后，箱中货物状态更改为装箱状态；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非装货员登入', async () => {

    //     });
    //     it('快递箱二维码信息非快递箱', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未解除关联快递前，快递箱二维码状态非发货状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 收箱 [GTBA]
  describe('/shouXiang', async () => {
    describe('成功', async () => {
      it('GTBA收箱', async () => {
        let GTBA8Token = await getToken('GTBA8', '123456');
        const KDXEWMs = [
          {
            type: 'KDX',
            uuid: 'KDX3',
          },
        ];

        const response = await post(
          'shouXiang',
          {
            KDXEWMs,
          },
          GTBA8Token,
        );
        assert.equal(response.data.code, 1);

        const kdx = await KDX.findOne({ where: { EWM: KDXEWMs[0].uuid } });
        assert.equal(kdx.dataValues.status, '收箱');

        const wywl = await WYWL.findAll({ where: { KDXId: kdx.dataValues.id } });
        let wywlList = wywl.map(item => ({
          EWM: item.dataValues.EWM,
          status: item.dataValues.status,
        }));
        wywlList.forEach(item => {
          assert.equal(item.status, '收箱');
        });
        //收箱后，快递箱及箱内货物状态更改为收箱状态；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非柜台BA登入', async () => {

    //     });
    //     it('快递箱二维码信息非快递箱', async () => {

    //     });
    //     it('快递箱所属柜台非该柜台BA对应的柜台', async () => {

    //     });
    //     it('快递箱内货物对应柜台非该柜台BA对应的柜台', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未收箱前，快递箱二维码状态非发货状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 收货 [GTBA, AZG]
  describe('/shouHuo', async () => {
    describe('成功', async () => {
      it('AZG收货', async () => {
        let AZG6Token = await getToken('AZG6', '123456');
        const HWEWMs = [
          {
            type: 'WL',
            typeId: 27,
            uuid: 'WL27_1',
          },
          {
            type: 'WL',
            typeId: 27,
            uuid: 'WL27_2',
          },
        ];

        const response = await post(
          'shouHuo',
          {
            HWEWMs,
          },
          AZG6Token,
        );
        assert.equal(response.data.code, 1);

        HWEWMs.forEach(async (item) => {
          const wywl = await WYWL.findOne({ where: { EWM: item.uuid } });
          assert.equal(wywl.dataValues.status, '收货');
        });
        //收货后，货物状态更改为收货状态；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非柜台BA/安装工登入', async () => {

    //     });
    //     it('货物二维码信息非货物', async () => {

    //     });
    //     it('货物二维码所属柜台BA/安装工非该柜台BA/安装工', async () => {

    //     });
    //     it('货物二维码属于该安装工，并不属于该柜台', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('若货物未被修改描述，未收货前，货物二维码状态非收箱状态', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 安装反馈状态 [GTBA, AZG]
  describe('/anZhuangFanKuiZhuangTai', async () => {
    describe('成功', async () => {
      it('AZG反馈AZFKType', async () => {
        let AZG6Token = await getToken('AZG6', '123456');
        let GTBA8Token = await getToken('GTBA8', '123456');
        const KDXEWMs = [
          {
            type: 'KDX',
            uuid: 'KDX3',
          },
        ];

        let HWEWMs = [];
        for (let i = 12; i < 24; i++) {
          const wywl = await WYWL.findOne({ where: { id: i } });
          HWEWMs.push({
            type: 'WL',
            typeId: wywl.dataValues.WLId,
            uuid: wywl.dataValues.EWM,
          });
        };
        await post(
          'shouXiang',
          {
            KDXEWMs,
          },
          GTBA8Token,
        );
        await post(
          'shouHuo',
          {
            HWEWMs,
          },
          AZG6Token,
        );

        let HWPayloads = [];
        for (let i = 13; i < 26; i++) {
          HWPayloads.push({
            id: i,
            AZFK: AZFKType.AZCG,
          })
        }
        const DDId = 4;
        const GTId = 8;
        const ewmType = EWMType.WL;

        const response = await post(
          'anZhuangFanKuiZhuangTai',
          {
            DDId,
            GTId,
            EWMType: ewmType,
            HWPayloads,
          },
          AZG6Token,
        );
        assert.equal(response.data.code, 1);

        HWPayloads.forEach(async (item) => {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, '反馈');
        });
        //反馈状态后，货物状态更改为反馈状态；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非柜台BA/安装工登入', async () => {

    //     });
    //     it('货物二维码所属柜台BA/安装工非该柜台BA/安装工', async () => {

    //     });
    //     it('货物二维码所属订单_柜台任务未全部展现', async () => {

    //     });
    //     it('订单_柜台任务展现范围超过该安装工/BA的任务范围', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未反馈前，已收货货物二维码状态非收货状态', async () => {

    //     });
    //     it('未反馈前，未收货货物二维码状态非装箱/发货状态', async () => {

    //     });
    //     it('反馈时，所有货物二维码安装描述未全部反馈', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // 安装反馈图片 [GTBA, AZG]
  describe('/anZhuangWLFanKuiTuPian', async () => {
    describe('成功', async () => {
      it('AZG反馈安装反馈图', async () => {
        let AZG6Token = await getToken('AZG6', '123456');
        const DDId = 6;
        const GTId = 10;
        const ewmType = EWMType.WL;
        const HWPayloads = [
          {
            id: 40,
            imageUrl: 'imageUrl_FK40'
          },
          {
            id: 41,
            imageUrl: 'imageUrl_FK41'
          },
        ];

        const response = await post(
          'anZhuangFanKuiZhuangTai',
          {
            DDId,
            GTId,
            EWMType: ewmType,
            HWPayloads,
          },
          AZG6Token,
        );
        assert.equal(response.data.code, 1);

        HWPayloads.forEach(async (item) => {
          const wywl = await WYWL.findOne({ where: { id: item.id } });
          assert.equal(wywl.dataValues.status, '反馈图');
        });
        //反馈图片后，货物状态更改为反馈图状态；
        //反馈图片后，该BA/安装工的该订单_柜台全景反馈图重置为最新的全景反馈图；
      });
    });
    // describe('失败', async () => {
    //   describe('数据不合法', async () => {

    //   });
    //   describe('没有权限', async () => {
    //     it('非柜台BA/安装工登入', async () => {

    //     });
    //     it('该订单_柜台所有属于该柜台BA/安装工的任务未全部展现', async () => {

    //     });
    //     it('订单_柜台任务展现范围超过该安装工/BA的任务范围', async () => {

    //     });

    //     it('该订单_柜台属于该柜台BA/安装工的全景反馈图未重置', async () => {

    //     });
    //   });
    //   describe('操作状态不正确', async () => {
    //     it('未反馈前，货物二维码状态非反馈状态', async () => {

    //     });
    //     it('反馈时，该订单_柜台所有属于该柜台BA/安装工的任务的反馈图未全部上传', async () => {

    //     });
    //   });
    //   describe('唯一性校验', async () => {

    //   });
    // });
  });

  // describe('/shenQingRiChangWLBuHuo', async () => {
  //   describe('成功', async () => {
  //     it('柜台BA、柜长申请日常补货成功', async () => {
  //       //申请成功后，生成补货记录；
  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => {

  //     });
  //     describe('没有权限', async () => {
  //       it('非柜台BA/柜长登入', async () => {

  //       });
  //       it('该柜台非操作者权限范围内柜台', async () => {

  //       });

  //       it('该物料ID在该柜台不存在', async () => {

  //       });
  //     });
  //     describe('操作状态不正确', async () => {

  //     });
  //     describe('唯一性校验', async () => {

  //     });
  //   });
  // });
  // describe('/shenQingShangShiWLBuHuo', async () => {
  //   describe('成功', async () => {
  //     it('柜台BA、安装工、柜长申请上市补货成功', async () => {
  //       //申请成功后，生成补货记录；
  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => {

  //     });
  //     describe('没有权限', async () => {
  //       it('非柜台BA/柜长/安装工登入', async () => {

  //       });

  //       it('该柜台非操作者权限范围内柜台', async () => {

  //       });
  //       it('如果是安装工补货，该物料不属于该安装工安装', async () => {

  //       });

  //       it('该物料ID在该柜台不存在', async () => {

  //       });
  //     });
  //     describe('操作状态不正确', async () => {

  //     });
  //     describe('唯一性校验', async () => {

  //     });
  //   });
  // });
});
