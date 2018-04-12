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
  PPJL_PP,
  KFJL_PP,
  GZ_PP,
  GLY_AZGS,
  EJZH_FGTester,
  EJZH_SJWL,
  YJZH_EJZH,
  QY,
  GYSType,
  GLY_GYS,
  GT_YJZH,
} from '../models/Model';

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
        Authorization: `bearer ${token}`
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
      Authorization: `bearer ${token}`
    },
  });

  return r;
};

const get = async (path, params, token) => {
  const r = await axios.get(`${api}/${path}`, {
    params,
    headers: {
      Authorization: `bearer ${token}`
    },
  });

  return r;
};

const getUserIdList = (r) => {
  let userIdList = [];
  for (let i = 0; i < r.length; i++) {
    userIdList.push(r[i].dataValues.UserId);
  }

  return userIdList;
}

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

describe('SPRT测试案例', () => {
  beforeEach(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'tcltcl',
    });

    await con.connect();
    await con.query('DROP DATABASE cltp');
    await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    // // Drop all tables
    // await sequelize.drop();
    // await sequelize.sync({ force: true });
    // await User.create({
    //   id: '1',
    //   JS: '系统管理员',
    //   username: 'admin',
    //   password: '$2a$08$L0.LfGHcX4CsXP1H5DBmlustuUNWoFGhwVUcxLjHDkfWAO6M0MCxq',
    //   createdAt: '2018-04-07 20:11:04.108',
    //   updatedAt: '2018-04-07 20:11:04.108'
    // });

    const data = await readFile(`${__dirname}/../tools/initDataScript_izz.sql`);

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
  //   describe('成功案例', async () => {
  //   });
  //   describe('失败案例', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // 新建PPJL [ADMIN]
  describe('/createPPJL', async () => {
    describe('成功', async () => {
      it('admin为品牌创建PPJL', async () => {
        const PPId = 3;
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
        const user = await User.findOne({ where: { username: username } });
        assert.notEqual(user, null);

        const r = await PPJL_PP.findAll({ where: { PPId: PPId } });
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

        const user = await User.findOne({ where: { username: username } });
        assert.notEqual(user, null);

        const r = await PPJL_PP.findAll({ where: { PPId: PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);

        const user1 = await User.findOne({ where: { username: 'PPJL1' } });
        console.log('userList', userList);
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
            PPId: 3,
            username: 'PPJL_T',
            password: '123456',
          },
          adminToken,
        );
        tempPPJLToken = await getToken('PPJL_T', '123456');

        const PPId = 3;
        const username = 'KFJL_T';
        const password = '123456';

        const response = await post(
          'createKFJL',
          {
            PPId: PPId,
            username: username,
            password: password,
          },
          tempPPJLToken,
        );
        assert.equal(response.data.code, 1);
        const user = await User.findOne({ where: { username: username } });
        assert.notEqual(user, null);

        const r = await KFJL_PP.findAll({ where: { PPId: PPId } });
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
            PPId: PPId,
            username: username,
            password: password,
          },
          PPJLToken,
        );
        assert.equal(response.data.code, 1);
        const user = await User.findOne({ where: { username: username } });
        assert.notEqual(user, null);

        const r = await KFJL_PP.findAll({ where: { PPId: PPId } });
        const userList = await getUserIdList(r);
        assert.include(userList, user.dataValues.id);

        const user1 = await User.findOne({ where: { username: 'KFJL1' } });
        assert.notInclude(userList, user1.dataValues.id);
      });//PP1的KFJL_T变成KFJL1
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('PPJL为不属于自己管理的PP创建PPJL', async () => {
          const PPId = 3;
          const username = 'KFJL_T1';
          const password = '123456';

          const response = await post(
            'createKFJL',
            {
              PPId: PPId,
              username: username,
              password: password,
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
  describe('/createGT_GTBA', async () => {
    describe('成功', async () => {
      it('KFJL创建GT', async () => {
        const PPId = 1;
        const name = 'GT_T';
        const code = 'GT_T_code';
        const tmpQY = QY.EAST;
        const tmpCS = '上海';
        const response = await post(
          'createGT_GTBA',
          {
            PPId: PPId,
            name: name,
            code: code,
            QY: tmpQY,
            CS: tmpCS,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);
        

        const gt = await GT.findOne({ where: { name: name } });
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
            'createGT_GTBA',
            {
              PPId: PPId,
              name: name,
              code: code,
              QY: tmpQY,
              CS: tmpCS,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 编辑柜台图 [KFJL]
  describe('/setGT_IMAGE', async () => {
    describe('成功', async () => {
      it('KFJL编辑GT图片', async () => {
        const GTId = 1;
        const imageUrl = 'imageUrl_T'
        const response = await post(
          'setGT_IMAGE',
          {
            id: GTId,
            imageUrl: imageUrl,
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
          const imageUrl = 'imageUrl_T'
          const response = await post(
            'setGT_IMAGE',
            {
              id: GTId,
              imageUrl: imageUrl,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
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
            PPId: PPId,
            username: username,
            password: password,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const user = await User.findOne({ where: { username: username } });
        assert.notEqual(user, null);

        const r = await GZ_PP.findAll({ where: { PPId: PPId } });
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
              PPId: PPId,
              username: username,
              password: password,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 配置 GZ 负责柜台 [KFJL]
  describe('/setGZ_GTs', async () => {
    describe('成功', async () => {
      it('KFJL为多个GT分配GZ', async () => {
        const GZId = 10;
        const GTIds = [9, 10];
        const response = await post(
          'setGZ_GTs',
          {
            GZUserId: GZId,
            GTIds: GTIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt = await GT.findAll({ where: { GZUserId: GZId } });
        let GTIdList = [];
        for (let i = 0; i < gt.length; i++) {
          GTIdList.push(gt[i].dataValues.id);
        }
        GTIds.forEach(item => {
          assert.include(GTIdList, item);
        });
      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL为不属于自己管理的GT分配GZ', async () => {
          const GZId = 12;
          const GTIds = [13, 14];
          const response = await post(
            'setGZ_GTs',
            {
              GZUserId: GZId,
              GTIds: GTIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('KFJL为GT分配不属于自己管理的PP的GZ', async () => {
          const GZId = 10;
          const GTIds = [13, 14];
          const response = await post(
            'setGZ_GTs',
            {
              GZUserId: GZId,
              GTIds: GTIds,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 新建GYS, GLY
  describe('/createGYSAndGLY', async () => {
    describe('成功', async () => {
      it('KFJ创建GYSGLY', async () => {
        const name = 'GYS_T';
        const username = 'GYSGLY_T';
        const password = '123456';
        const type = GYSType.SC;
        const response = await post(
          'createGYSAndGLY',
          {
            name: name,
            username: username,
            password: password,
            type: type,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);
        const gys = await GYS.findOne({ where: { name: name } });
        assert.notEqual(gys, null);

        const user = await User.findOne({ where: { username: username } });
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
  describe('/createAZGSAndGLY', async () => {
    describe('成功', async () => {
      it('KFJL创建AZGSGLY和AZGS', async () => {
        const name = 'AZGS_T';
        const username = 'AZGSGLY_T';
        const password = '123456';
        const response = await post(
          'createAZGSAndGLY',
          {
            name: name,
            username: username,
            password: password,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);
        const azgs = await AZGS.findOne({ where: { name: name } });
        assert.notEqual(azgs, null);

        const user = await User.findOne({ where: { username: username } });
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

  // 配置 DP_DWs [KFJL]
  describe('/setDP_DWs', async () => {
    describe('成功', async () => {
      it('KFJL将DP关联1个GT的多个DW', async () => {
        const DPId = 7;
        const DWIds = [13, 14];
        const response = await post(
          'setDP_DWs',
          {
            id: DPId,
            DWIds: DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(async (item) => {
          const dw = await DW.findOne({ where: { id: item } });
          assert.equal(dw.dataValues.DPId, DPId);
        });
      });

      it('KFJL将DP关联多个GT的DW', async () => {
        const DPId = 8;
        const DWIds = [15, 16];
        const response = await post(
          'setDP_DWs',
          {
            id: DPId,
            DWIds: DWIds,
          },
          KFJLToken,
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
          'setDP_DWs',
          {
            id: DPId,
            DWIds: DWIds,
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
    describe.skip('失败', async () => {
      describe('数据不合法', async () => {
      });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 创建 FG, Tester, FGTester
  describe('/createFG_Tester_FGTester', async () => {
    describe('成功', async () => {
      it('KFJL创建系统中均不存在的FG、Tester组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG_T',
          note: 'note_T',
          Testers: ['Tester_T1', 'Tester_T2'],
        };

        const response = await post(
          'createFG_Tester_FGTester',
          {
            PPId: PPId,
            FG: FGPayload,
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
      });//前置条件：FG_T,Tester1&Tester2数据库中不存在

      it('KFJL创建FG已经存在，Tester均不存在的组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG1',
          note: 'note_T',
          Testers: ['Tester_T1', 'Tester_T2'],
        };
        const response = await post(
          'createFG_Tester_FGTester',
          {
            PPId: PPId,
            FG: FGPayload,
          },
          KFJLToken,
        );
        console.log(response);
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

      });//前置条件：FG_T存在，Tester1&Tester2数据库中不存在

      it('KFJL创建FG不存在，Tester存在的组合', async () => {
        const PPId = 1;
        const FGPayload = {
          name: 'FG_T',
          note: 'note_T',
          Testers: ['Tester1', 'Tester2'],
        };

        const response = await post(
          'createFG_Tester_FGTester',
          {
            PPId: PPId,
            FG: FGPayload,
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
      });//前置条件：FG_T不存在，Tester1&Tester2数据库中存在
    });
    describe.skip('失败', async () => {
      describe('数据不合法', async () => {
      });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => {
      });
    });
  });

  // KFJL 创建 EJZH id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
  describe('/createEJZH', async () => {
    describe('成功', async () => {
      it('KFJL创建不包含WL和FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [];
        const SJWLs = [];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 0);
      });//WL和FGTester均没有
      it('KFJL创建仅包含FGTester的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
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
          }
        ];
        const SJWLs = [];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 0);
      });//仅FGTesters
      it('KFJL创建仅包含SJWL的EJZH', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [];
        const SJWLs = [
          {
            id: 1,
            number: 2
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.notEqual(ejzh_sjwl.length, 0);
      });//仅SJWLs
      it('KFJL创建包含FGTester和SJWL的EJZH-1', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
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
          }
        ];
        const SJWLs = [
          {
            id: 1,
            number: 2
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 2);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 1);
      });//FGTesters&SJWLs

      it('KFJL创建包含FGTester和SJWL的EJZH-2', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 1,
            number: 2,
          }
        ];
        const SJWLs = [
          {
            id: 2,
            number: 2
          },
          {
            id: 3,
            number: 2
          },
        ];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 1);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 2);
      });//FGTesters&SJWLs

      it('KFJL创建EJZH-WL&FG没有与任何组合有关联', async () => {
        const PPId = 1;
        const name = 'EJZH_T';
        const WLId = 38;
        const imageUrl = 'imageUrl_T';
        const XGTs = ['XGT_T1', 'XGT_T2'];
        const FGTesters = [
          {
            id: 9,
            number: 2,
          }
        ];
        const SJWLs = [
          {
            id: 33,
            number: 2
          }
        ];

        const response = await post(
          'createEJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(ejzh, null);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_fg_tester.length, 1);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: ejzh.dataValues.id } });
        assert.equal(ejzh_sjwl.length, 1);
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {
        it('KFJL创建EJZH，选择SJWLId', async () => {
          const PPId = 1;
          const name = 'EJZH_T';
          const WLId = 33;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [];

          const response = await post(
            'createEJZH',
            {
              PPId: PPId,
              name: name,
              WLId: WLId,
              imageUrl: imageUrl,
              XGTs: XGTs,
              FGTesters: FGTesters,
              SJWLs: SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });

        it('KFJL创建EJZH，关联EJWL', async () => {
          const PPId = 1;
          const name = 'EJZH_T';
          const WLId = 38;
          const imageUrl = 'imageUrl_T';
          const XGTs = ['XGT_T1', 'XGT_T2'];
          const FGTesters = [];
          const SJWLs = [
            {
              id: 38,
              number: 2
            },
          ];

          const response = await post(
            'createEJZH',
            {
              PPId: PPId,
              name: name,
              WLId: WLId,
              imageUrl: imageUrl,
              XGTs: XGTs,
              FGTesters: FGTesters,
              SJWLs: SJWLs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);
        });
      });
      describe.skip('没有权限', async () => { });
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: EJZHId } });
        assert.equal(ejzh_fg_tester.length, 0);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: EJZHId } });
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh = await EJZH.findOne({ where: { id: EJZHId } });
        assert.equal(ejzh.dataValues.WLId, WLId);
        assert.equal(ejzh.dataValues.imageUrl, imageUrl);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: EJZHId } });
        assert.notEqual(ejzh_fg_tester, null);

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: EJZHId } });
        assert.equal(ejzh_sjwl.length, 0);

        const ejzhxgt = await EJZHXGT.findOne({ where: { EJZHId: EJZHId } });
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: EJZHId } });
        let FGTesterIdList = [];
        ejzh_fg_tester.forEach(item => {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        });
        assert.equal(FGTesterIdList.length, 3);
        FGTesters.forEach(item => {
          assert.include(FGTesterIdList, item.id);
        });

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: EJZHId } });
        let SJWLIdList = [];
        ejzh_sjwl.forEach(item => {
          SJWLIdList.push(item.dataValues.WLId);
        });
        assert.equal(SJWLIdList.length, 2);
        SJWLs.forEach(item => {
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            FGTesters: FGTesters,
            SJWLs: SJWLs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const ejzh_fg_tester = await EJZH_FGTester.findAll({ where: { EJZHId: EJZHId } });
        let FGTesterIdList = [];
        ejzh_fg_tester.forEach(item => {
          FGTesterIdList.push(item.dataValues.FGTesterId);
        });
        assert.equal(FGTesterIdList.length, 1);
        FGTesters.forEach(item => {
          assert.include(FGTesterIdList, item.id);
        });

        const ejzh_sjwl = await EJZH_SJWL.findAll({ where: { EJZHId: EJZHId } });
        let SJWLIdList = [];
        ejzh_sjwl.forEach(item => {
          SJWLIdList.push(item.dataValues.WLId);
        });
        assert.equal(SJWLIdList.length, 1);
        SJWLs.forEach(item => {
          assert.include(SJWLIdList, item.id);
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

  // KFJL 创建 YJZH
  describe('/createYJZH', async () => {
    describe('成功', async () => {
      it('KFJL创建YJZH-不包含EJZH', async () => {
        const PPId = 1;
        const name = 'YJZH_T';
        const WLId = 43;
        const imageUrl = 'imageUrlYJZH';
        const XGTs = ['YJZH1Url'];
        const EJZHs = [];

        const response = await post(
          'createYJZH',
          {
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(yjzh, null);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: yjzh.dataValues.id } });
        assert.equal(yjzh_ejzh.length, 0);
      });//没有EJZH

      it('KFJL创建YJZH-包含多组EJZH', async () => {
        const PPId = 1;
        const name = 'YJZH_T';
        const WLId = 43;
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
            PPId: PPId,
            name: name,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { WLId: WLId } });
        assert.notEqual(yjzh, null);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: yjzh.dataValues.id } });
        assert.notEqual(yjzh_ejzh, null);
      }); //EJZH1
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {
        it('KFJL创建YJZH，选择SJWLId', async () => {
          const PPId = 1;
          const name = 'YJZH_T';
          const WLId = 33;
          const imageUrl = 'imageUrlYJZH';
          const XGTs = ['YJZH1Url'];
          const EJZHs = [];

          const response = await post(
            'createYJZH',
            {
              PPId: PPId,
              name: name,
              WLId: WLId,
              imageUrl: imageUrl,
              XGTs: XGTs,
              EJZHs: EJZHs,
            },
            KFJLToken,
          );
          assert.equal(response.data.code, -1);

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

        console.log('1---->',YJZHId);

        const response = await post(
          'editYJZH',
          {
            id: YJZHId,
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findOne({ where: { YJZHId: YJZHId } });
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh = await YJZH.findOne({ where: { id: YJZHId } });
        assert.equal(yjzh.dataValues.WLId, WLId);
        assert.equal(yjzh.dataValues.imageUrl, imageUrl);

        const yjzh_ejzh = await YJZH_EJZH.findOne({ where: { YJZHId: YJZHId } });
        assert.notEqual(yjzh_ejzh, null);

        const yjzhxgt = await YJZHXGT.findOne({ where: { YJZHId: YJZHId } });
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: YJZHId } });
        
        let EJZHIdList = [];
        yjzh_ejzh.forEach(item => {
          EJZHIdList.push(item.dataValues.EJZHId);
        });
        assert.equal(EJZHIdList.length, 3);
        EJZHs.forEach(item => {
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
            WLId: WLId,
            imageUrl: imageUrl,
            XGTs: XGTs,
            EJZHs: EJZHs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const yjzh_ejzh = await YJZH_EJZH.findAll({ where: { YJZHId: YJZHId } });
        
        let EJZHIdList = [];
        yjzh_ejzh.forEach(item => {
          EJZHIdList.push(item.dataValues.EJZHId);
        });
        assert.equal(EJZHIdList.length, 1);
        EJZHs.forEach(item => {
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
  describe('/setYJZH_GTs', async () => {
    describe('成功', async () => {
      it('KFJL将YJZH配置到GT', async () => {
        const YJZHId = 1;
        const GTs = [
          {
            id: 2,
            number: 2
          },
          {
            id: 3,
            number: 2
          },
        ];

        const response = await post(
          'setYJZH_GTs',
          {
            id: YJZHId,
            GTs: GTs,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        const gt_yjzh = await GT_YJZH.findAll({ where: { YJZHId: YJZHId } });
        let GTIdList = [];
        gt_yjzh.forEach(item => {
          GTIdList.push(item.dataValues.GTId);
        });
        assert.equal(GTIdList.length, 2);
        GTs.forEach(item => {
          assert.include(GTIdList, item.id);
        });
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // // KFJL 生成订单
  // describe('/createDD', async () => {
  //   describe('成功', async () => {
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });
});

