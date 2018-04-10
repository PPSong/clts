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
  before(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'tcltcl',
    });

    await con.connect();
    await con.query('DROP DATABASE cltp');
    await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    // Drop all tables
    await sequelize.drop();
    await sequelize.sync({ force: true });
    await User.create({
      id: '1',
      JS: '系统管理员',
      username: 'admin',
      password: '$2a$08$L0.LfGHcX4CsXP1H5DBmlustuUNWoFGhwVUcxLjHDkfWAO6M0MCxq',
      createdAt: '2018-04-07 20:11:04.108',
      updatedAt: '2018-04-07 20:11:04.108'
    });

    adminToken = await getToken('admin', '123456'); 

  });

  describe('test', async () => {
    it('small test', async () => {
      assert.equal(1, 1);
    });
    it('small test2', async () => {
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
      it('admin 为 PP1 创建 PPJL1', async () => {

      });

      it('admin 为 PP1 创建 PPJL2', async () => {

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
      it('PPJL1 为 PP1 创建 KFJL1', async () => {

      });

      it('PPJL1 为 PP1 创建 KFJL2', async () => {

      });//PP1的KFJL变成KFJL2
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => { 
        it('PPJL1 为 PP2 创建 KFJL3', async () => {

        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 新建GT, GTBA [KFJL]
  describe('/createGT_GTBA', async () => {
    describe('成功', async () => {
      it('KFJL1 为 PP1 创建 GT1&GTBA1', async () => {

      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => { 
        it('KFJL1 为 PP2 创建 GT2', async () => {

        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 编辑柜台图 [KFJL]
  describe('/setGT_IMAGE', async () => {
    describe('成功', async () => {
      it('KFJL1 编辑 GT1 的图片', async () => {

      });
    });
    describe('失败', async () => {
      describe.skip('数据不合法', async () => { });
      describe('没有权限', async () => { 
        it('KFJL1 编辑 GT2 的图片', async () => {

        });
      });
      describe.skip('操作状态不正确', async () => { });
      describe.skip('唯一性校验', async () => { });
    });
  });

  // 创建 GZ [KFJL]
  describe('/createGZ', async () => {
    describe('成功', async () => {
      it('KFJL1 为PP1 创建 GZ1', async () => {

      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { 
        it('KFJL1 为PP2 创建 GZ2', async () => {

        });
      });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 配置 GZ 负责柜台 [KFJL]
  describe('/setGZ_GTs', async () => {
    describe('成功', async () => {
      it('KFJL1 GT1&GT2 配置GZ1', async () => {

      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => {
        it('KFJL1 GT3&GT4 配置GZ2', async () => {

        });
       });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 新建GYS, GLY
  describe('/createGYSAndGLY', async () => {
    describe('成功', async () => {
      it('KFJL1 创建 GYSGLY1', async () => {

      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 新建AZGS, GLY
  describe('/createAZGSAndGLY', async () => {
    describe('成功', async () => {
      it('KFJL1 创建 AZGSGLY1', async () => {

      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // 配置 DP_DWs [KFJL]
  describe('/setDP_DWs', async () => {
    describe('成功', async () => {
      it('KFJL1 将DP1 关联 GT1的 DW1&DW2', async () => {

      });

      it('KFJL1 将DP2 关联 GT1的 DW3 GT2的 DW1', async () => {

      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { 
        it('KFJL1 将DP3 关联 GT1的 DW1', async () => {

        });
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

  // KFJL 创建 EJZH id, WLId, imageUrl, XGTs, FGTesters, SJWLs,
  describe('/createEJZH', async () => {
    describe('成功', async () => {
      it('KFJL1 创建 EJZH1 ', async () => {
        //没有物料
      });
      it('KFJL1 创建 EJZH2 ', async () => {
        //仅FGTesters
      });
      it('KFJL1 创建 EJZH3 ', async () => {
        //仅SJWLs
      });
      it('KFJL1 创建 EJZH4 ', async () => {
        //FGTesters&SJWLs
      });
      it('KFJL1 创建 EJZH5 ', async () => {
        //与EJZH4相同
      });
      it('KFJL1 创建 EJZH6 ', async () => {
        //与EJZH4不同的FGTesters&SJWLs
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 编辑 EJZH
  describe('/editEJZH', async () => {
    describe('成功', async () => {
      it('KFJL1 编辑 EJZH1 XGT1&XGT2', async () => {
        
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 创建 YJZH
  describe('/createYJZH', async () => {
    describe('成功', async () => {
      it('KFJL1 创建 YJZH1 ', async () => {
        //没有EJZH
      });
      it('KFJL1 创建 YJZH2 ', async () => {
        //EJZH1
      });
      it('KFJL1 创建 YJZH3 ', async () => {
        //EJZH1
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 编辑 YJZH
  describe('/editYJZH', async () => {
    describe('成功', async () => {
      it('KFJL1 编辑 EJZH1 XGT1&XGT2', async () => {
        
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 配置YJZH_GTs
  describe('/setYJZH_GTs', async () => {
    describe('成功', async () => {
      it('KFJL1 将 EJZH1 配置到GT1&GT2', async () => {
        
      });
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });

  // KFJL 生成订单
  describe('/createDD', async () => {
    describe('成功', async () => {
    });
    describe('失败', async () => {
      describe('数据不合法', async () => { });
      describe('没有权限', async () => { });
      describe('操作状态不正确', async () => { });
      describe('唯一性校验', async () => { });
    });
  });
});

