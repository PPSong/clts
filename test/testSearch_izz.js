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
let adminToken;
let PPJLToken;
let KFJLToken;
let GZToken;
let GTBAToken;
let GYSGLYToken;
let AZGSGLYToken;
let ZHYToken;
let AZGToken;

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

  // 装货 [ZHY]
  describe('装货查询', async () => {
    it('ZHY物料', async () => {
      const name = 'PP_T';
      
    });
  });

  // 安装 [AZG]
  describe('安装端查询', async () => {
    it('ZHY物料', async () => {
      
    });
  });
});
