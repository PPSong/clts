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
import { resolve } from 'path';

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

const replaceAll = (str, target, replacement) =>
  str.replace(new RegExp(target, 'g'), replacement);

process.env.NODE_ENV = 'test';
const server = require('../app');

const ppLog = debug('ppLog');
const baseUrl = 'http://localhost:3001';
const api = `${baseUrl}/api`;
let ZHYToken;
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

describe('SPRT_Search测试', () => {
  before(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'tcltcl',
    });

    await con.connect();
    await con.query('DROP DATABASE IF EXISTS cltp');
    await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    const data = await readFile(`${__dirname}/../tools_izz/initDataSearchScript_izz.sql`);
    scriptArr = data.split(';');

    await initData();
    await createViewAndProcedure();


    ZHYToken = await getToken('ZHY1', '123456');
  });

  describe('test', async () => {
    it.skip('small test', async () => {
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

  // 获取DDWL装箱任务 [ZHY]
  describe('getDDWLZhuangXiangList', async () => {
    it('ZHY进入WL装箱任务列表', async () => {
      const curPage = 0;
      const trueList = [{
        PPId: 1,
        PPName: 'PP1',
        DDId: 1,
        DDName: 'DD1',
        GTId: 1,
        GTName: 'GT1',
        totalNumber: '10',
        totalZXNumber: '0',
      }];

      const response = await post(
        'getDDWLZhuangXiangList',
        {
          curPage,
        },
        ZHYToken,
      );
      assert.equal(response.data.code, 1);
      assert.deepEqual(response.data.data, trueList);
    });

    it('ZHY模糊搜索WL装箱任务列表', async () => {
      const curPage = 0;
      const keyword = 'PP1'
      const trueList = [{
        PPId: 1,
        PPName: 'PP1',
        DDId: 1,
        DDName: 'DD1',
        GTId: 1,
        GTName: 'GT1',
        totalNumber: '10',
        totalZXNumber: '0',
      }];

      const response = await post(
        'getDDWLZhuangXiangList',
        {
          curPage,
          keyword,
        },
        ZHYToken,
      );
      assert.equal(response.data.code, 1);
      assert.deepEqual(response.data.data, trueList);
    });
  });

  // 获取指定DDGT的DDWL装箱任务 [ZHY]  
  describe('getDDGT0DDWLZhuangXiangList', async () => {
    it('ZHY进入某个DD_GT任务', async () => {
      const curPage = 0;
      const DDId = 1;
      const GTId = 1;
      const trueList = [{
        WLId: 1,
        WLName: 'WL1_3_1',
        WLCode: '1_3_1',
        number: 10,
        ZXNumber: 0,
      }];

      const response = await post(
        'getDDGT0DDWLZhuangXiangList',
        {
          curPage,
          DDId,
          GTId,
        },
        ZHYToken,
      );
      assert.equal(response.data.code, 1);
      assert.deepEqual(response.data.data, trueList);
    });
  });

  // 获取指定YJZXTimeGT的BHWL装箱任务 [ZHY]
  describe('getYJZXTimeGT0BHWLZhuangXiangList', async () => {
    it.only('ZHY进入BHWL装箱任务', async () => {
      const curPage = 0;
      const YJZXTime = '2018-10-10';
      const GTId = 1;
      const trueList = [{
        WLId: 1,
        WLName: 'WL1_3_1',
        WLCode: '1_3_1',
        number: 10,
        ZXNumber: 0,
        WLBHStatus: '已分配发货供应商',
      }];

      const response = await post(
        'getDDGT0DDWLZhuangXiangList',
        {
          curPage,
          YJZXTime: new Date(YJZXTime).getTime(),
          GTId,
        },
        ZHYToken,
      );
      assert.equal(response.data.code, 1);
      console.log('izzlog', response.data);
      assert.deepEqual(response.data.data, trueList);
    });
  });

  // 获取指定DDGT的DDWL已装箱WYWL [ZHY]
  describe('getDDGT0DDWLYiZhuangXiangWYWLList', async () => {
    it('ZHY进入已装箱WYWL', async () => {
      const curPage = 0;
      const DDId = 1;
      const GTId = 1;

      //required: ['curPage', 'DDId', 'GTId'],
    });
  });

  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  describe('getYJZXTimeGT0BHWLYiZhuangXiangWYWLList', async () => {
    it('', async () => {
      // required: ['curPage', 'YJZXTime', 'GTId'],
    });
  });

  // 获取DDDP装箱任务 [ZHY]
  describe('getDDDPZhuangXiangList', async () => {
    it('', async () => {
      // required: ['curPage'],
      //keyword

    });
  });

  // 获取BHDP装箱任务 [ZHY]
  describe('getBHDPZhuangXiangList', async () => {
    it('', async () => {
      // required: ['curPage'],
      //keyword

    });
  });

  // 获取指定DDGT的DDDP装箱任务 [ZHY]
  describe('getDDGT0DDDPZhuangXiangList', async () => {
    it('', async () => {
      // required: ['curPage'],
      //keyword

    });
  });

  // 获取BHDP装箱任务 [ZHY]
  describe('getBHDPZhuangXiangList', async () => {
    it('', async () => {
      // required: ['curPage', 'DDId', 'GTId'],


    });
  });

  // 获取指定YJZXTimeGT的BHDP装箱任务 [ZHY]
  describe('getYJZXTimeGT0BHDPZhuangXiangList', async () => {
    it('', async () => {
      //required: ['curPage', 'YJZXTime', 'GTId'],

    });
  });

  // 获取指定DDGT的DDDP已装箱WYDP [ZHY]
  describe('getDDGT0DDDPYiZhuangXiangWYDPList', async () => {
    it('', async () => {
      //required: ['curPage', 'DDId', 'GTId'],

    });
  });

  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  describe('getBHDPZhuangXiangList', async () => {
    it('', async () => {
      //  required: ['curPage', 'YJZXTime', 'GTId'],

    });
  });
});
