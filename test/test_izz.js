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
    KFJLToken = await getToken('KFJL1', '1');
    GZToken = await getToken('GZ1', '1');
    GTBAToken = await getToken('GTBA1', '1');
    GYSGLYToken = await getToken('GYSGLY1', '1');
    AZGSGLYToken = await getToken('AZGSGLY1', '1');
    ZHYToken = await getToken('ZHY1', '1');
    AZGToken = await getToken('AZG1', '1');

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
          const GTId = 4;
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

        const r = await GLY_AZGS.findAll({ where: { GYSId: azgs.dataValues.id } });
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
            id: DPIds,
            DWIds: DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(item => {
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
            id: DPIds,
            DWIds: DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(item => {
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
            id: DPIds,
            DWIds: DWIds,
          },
          KFJLToken,
        );
        assert.equal(response.data.code, 1);

        DWIds.forEach(item => {
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
      it('KFJL1 创建 FG1 Tester1 & Tester2', async () => {

      });//前置条件：Tester1&Tester2数据库中不存在

      it('KFJL1 创建 FG1 Tester2 & Tester3', async () => {

      });//前置条件：Tester2数据中存在&Tester3数据库不中存在

      it('KFJL1 创建 FG2 Tester2 & Tester3', async () => {

      });//前置条件：Tester2&Tester3数据库中存在
    });
    describe('失败', async () => {
      describe('数据不合法', async () => {
      });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // // KFJL 创建 EJZH id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
  // describe('/createEJZH', async () => {
  //   describe('成功', async () => {
  //     it('KFJL1 创建 EJZH1 ', async () => {
  //       //没有物料
  //     });
  //     it('KFJL1 创建 EJZH2 ', async () => {
  //       //仅FGTesters
  //     });
  //     it('KFJL1 创建 EJZH3 ', async () => {
  //       //仅SJWLs
  //     });
  //     it('KFJL1 创建 EJZH4 ', async () => {
  //       //FGTesters&SJWLs
  //     });
  //     it('KFJL1 创建 EJZH5 ', async () => {
  //       //与EJZH4相同
  //     });
  //     it('KFJL1 创建 EJZH6 ', async () => {
  //       //与EJZH4不同的FGTesters&SJWLs
  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // // KFJL 编辑 EJZH
  // describe('/editEJZH', async () => {
  //   describe('成功', async () => {
  //     it('KFJL1 编辑 EJZH1 XGT1&XGT2', async () => {

  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // // KFJL 创建 YJZH
  // describe('/createYJZH', async () => {
  //   describe('成功', async () => {
  //     it('KFJL1 创建 YJZH1 ', async () => {
  //       //没有EJZH
  //     });
  //     it('KFJL1 创建 YJZH2 ', async () => {
  //       //EJZH1
  //     });
  //     it('KFJL1 创建 YJZH3 ', async () => {
  //       //EJZH1
  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // // KFJL 编辑 YJZH
  // describe('/editYJZH', async () => {
  //   describe('成功', async () => {
  //     it('KFJL1 编辑 EJZH1 XGT1&XGT2', async () => {

  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

  // // KFJL 配置YJZH_GTs
  // describe('/setYJZH_GTs', async () => {
  //   describe('成功', async () => {
  //     it('KFJL1 将 EJZH1 配置到GT1&GT2', async () => {

  //     });
  //   });
  //   describe('失败', async () => {
  //     describe('数据不合法', async () => { });
  //     describe('没有权限', async () => { });
  //     describe('操作状态不正确', async () => { });
  //     describe('唯一性校验', async () => { });
  //   });
  // });

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

