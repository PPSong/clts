import { assert } from 'chai';
import Sequelize from 'sequelize';
import mysql from 'mysql2';
import axios from 'axios';
import debug from 'debug';
import fs from 'fs';
import _ from 'lodash';

import {
  init,
  sequelize,
  QY,
  GYSType,
  CS,
  JS,
  DDStatus,
  PPJL_PP,
  KFJL_PP,
  PP,
  GT,
  GYS,
  AZGS,
  User,
  DW,
  DP,
  WL,
  FG,
  FGTester,
  EJZH,
  YJZH,
  DD,
  DD_GT_WL,
  DD_DW_DP,
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
  const r = await axios.post(`${api}/${path}`, body, {
    headers: { Authorization: `bearer ${token}` },
  });

  return r;
};

const put = async (path, body, token) => {
  const r = await axios.put(`${api}/${path}`, body, {
    headers: { Authorization: `bearer ${token}` },
  });

  return r;
};

const get = async (path, params, token) => {
  const r = await axios.get(`${api}/${path}`, {
    params,
    headers: { Authorization: `bearer ${token}` },
  });

  return r;
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

describe('测试案例', () => {
  before(async () => {
    const con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'tcltcl',
    });

    await con.connect();
    await con.query('DROP DATABASE cltp');
    await con.query('CREATE DATABASE cltp CHARACTER SET utf8 COLLATE utf8_general_ci');

    const data = await readFile(`${__dirname}/../tools/initDataScript.sql`);

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

    adminToken = await getToken('admin', '1');
    PPJLToken = await getToken('PPJL1', '1');
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

    it('temp test', async () => {
      const r = await get(
        'DW',
        {
          keyword: 'DW',
        },
        PPJLToken,
      );

      assert.equal(1, 1);
    });

    it('admin 创建 PP', async () => {
      const name = 'T_PP1';
      await post(
        'PP',
        {
          name,
        },
        adminToken,
      );

      const r = await PP.findOne({ where: { name } });

      assert.notEqual(r, null);
    });

    it('admin 创建 PPJL', async () => {
      const PPId = 3;
      const username = 'T_PPJL';
      const password = '1';
      await post(
        'createPPJL',
        {
          PPId,
          username,
          password,
        },
        adminToken,
      );

      const user = await User.findOne({ where: { username } });
      assert.notEqual(user, null);

      const r = await PPJL_PP.findOne({ where: { PPId } });
      assert.notEqual(r.UserId, user.Id);
    });

    it('PPJL 创建 KFJL', async () => {
      const tmpPPJLToken = await getToken('T_PPJL', '1');
      const PPId = 3;
      const username = 'T_KFJL';
      const password = '1';
      await post(
        'createKFJL',
        {
          PPId,
          username,
          password,
        },
        tmpPPJLToken,
      );

      const user = await User.findOne({ where: { username } });
      assert.notEqual(user, null);

      const r = await KFJL_PP.findOne({ where: { PPId } });
      assert.notEqual(r.UserId, user.Id);
    });

    it('KFJL 创建 GT, GTBA', async () => {
      const PPId = 1;
      const name = 'T_GT';
      const code = 'T_GTCode';
      const tmpQY = QY.EAST;
      const tmpCS = '上海';
      await post(
        'createGT_GTBA',
        {
          PPId,
          name,
          code,
          QY: tmpQY,
          CS: tmpCS,
        },
        KFJLToken,
      );

      const tmpGT = await GT.findOne({ where: { name } });
      assert.notEqual(tmpGT, null);

      const tmpGTBA = await tmpGT.getGTBA();
      assert.equal(tmpGTBA.username, code);
    });

    it('KFJL 编辑 柜台图', async () => {
      const name = 'T_GT';
      const tmpGT = await GT.findOne({
        where: {
          name,
        },
      });
      const id = tmpGT.id;
      const imageUrl = 'T_imageUrl';
      await post(
        'setGT_IMAGE',
        {
          id,
          imageUrl,
        },
        KFJLToken,
      );

      const tmpGT2 = await GT.findOne({ where: { name } });
      assert.equal(tmpGT2.imageUrl, imageUrl);
    });

    it('KFJL 创建 GZ', async () => {
      const PPId = 1;
      const username = 'T_GZ';
      const password = '1';
      await post(
        'createGZ',
        {
          PPId,
          username,
          password,
        },
        KFJLToken,
      );

      const tmpUser = await User.findOne({ where: { username } });
      assert.equal(tmpUser.JS, JS.GZ);
      const PPIds = await tmpUser.getGZPPs();
      assert.equal(PPIds[0].id, 1);
    });

    it('KFJL 配置 GZ 负责柜台', async () => {
      const username = 'T_GZ';
      const name = 'T_GT';
      const GZUser = await User.findOne({ where: { username } });
      const GZUserId = GZUser.id;
      const tmpGT = await GT.findOne({ where: { name } });
      const GTId = tmpGT.id;
      const GTIds = [GTId];
      await post(
        'setGZ_GTs',
        {
          GZUserId,
          GTIds,
        },
        KFJLToken,
      );

      const tmpGT2 = await GT.findOne({ where: { name } });
      assert.equal(tmpGT2.GZUserId, GZUserId);
    });

    it('KFJL 创建 GYSGLY和GYS', async () => {
      const name = 'T_GYS';
      const username = 'T_GYSGLY';
      const password = '1';
      const type = GYSType.SC;
      await post(
        'createGYSAndGLY',
        {
          name,
          username,
          password,
          type,
        },
        KFJLToken,
      );

      const tmpGYS = await GYS.findOne({ where: { name } });
      assert.notEqual(tmpGYS, null);

      const tmpGLYs = await tmpGYS.getGLYs();
      assert.equal(tmpGLYs[0].username, username);
    });

    it('KFJL 创建 AZGSGLY和AZGS', async () => {
      const name = 'T_AZGS';
      const username = 'T_AZGSGLY';
      const password = '1';
      await post(
        'createAZGSAndGLY',
        {
          name,
          username,
          password,
        },
        KFJLToken,
      );

      const tmpAZGS = await AZGS.findOne({ where: { name } });
      assert.notEqual(tmpAZGS, null);

      const tmpAZGSs = await tmpAZGS.getGLYs();
      assert.equal(tmpAZGSs[0].username, username);
    });

    it('KFJL 创建 DW', async () => {
      const name = 'T_DW';
      const GTId = 1;

      await post(
        'DW',
        {
          name,
          GTId,
        },
        KFJLToken,
      );

      const tmpDW = await DW.findOne({ where: { name } });
      assert.notEqual(tmpDW, null);
      assert.equal(tmpDW.GTId, GTId);
    });

    it('KFJL 创建 DP', async () => {
      const name = 'T_DP';
      const PPId = 1;
      const GYSId = 1;

      await post(
        'DP',
        {
          name,
          PPId,
          GYSId,
        },
        KFJLToken,
      );

      const tmpDP = await DP.findOne({ where: { name } });
      assert.notEqual(tmpDP, null);
      assert.equal(tmpDP.PPId, PPId);
      assert.equal(tmpDP.GYSId, GYSId);
    });

    it('KFJL 编辑 DP图', async () => {
      const tmpDP = await DP.findOne({
        where: {
          name: 'T_DP',
        },
      });
      const { id } = tmpDP;
      const imageUrl = 'T_imageUrl';

      await put(
        `DP/${id}`,
        {
          imageUrl,
          PPId: 3,
        },
        KFJLToken,
      );

      await tmpDP.reload();
      assert.equal(tmpDP.imageUrl, 'T_imageUrl');
      assert.equal(tmpDP.PPId, 1);
    });

    it('KFJL 配置 DP_DWs', async () => {
      const tmpDP = await DP.findOne({
        where: {
          name: 'T_DP',
        },
      });
      const { id } = tmpDP;
      const DWIds = [11];

      await post(
        'setDP_DWs',
        {
          id,
          DWIds,
        },
        KFJLToken,
      );

      const tmpDWs = await DW.findAll({
        where: {
          id: {
            $in: DWIds,
          },
        },
      });

      const tmpDW_DP = tmpDWs.map(item => item.DPId);
      assert.deepEqual(tmpDW_DP, [id]);
    });

    it('KFJL 创建 WL', async () => {
      const name = 'T_WL3';
      const code = 'T_WL3Code';
      const level = 3;
      const GYSId = 1;
      const PPId = 1;

      await post(
        'WL',
        {
          name,
          code,
          level,
          PPId,
          GYSId,
        },
        KFJLToken,
      );

      const tmpWL = await WL.findOne({
        where: {
          name,
        },
      });

      assert.equal(tmpWL.code, code);
      assert.equal(tmpWL.level, level);
      assert.equal(tmpWL.GYSId, GYSId);
    });

    it('KFJL 编辑 WL图', async () => {
      const imageUrl = 'T_WL3_imageUrl';
      const note = 'T_note';
      const code = 'T_Code';
      const tmpWL = await WL.findOne({
        where: {
          name: 'T_WL3',
        },
      });

      await put(
        `WL/${tmpWL.id}`,
        {
          imageUrl,
          note,
          code,
        },
        KFJLToken,
      );

      await tmpWL.reload();

      assert.equal(tmpWL.imageUrl, imageUrl);
      assert.equal(tmpWL.note, note);
      assert.notEqual(tmpWL.code, code);
    });

    it('KFJL 创建 FG, Tester, FGTester', async () => {
      const PPId = 1;
      const FGPayload = {
        name: 'T_FG',
        note: 'T_note',
        Testers: ['Tester1', 'T_Tester1', 'T_Tester2'],
      };

      await post(
        'createFG_Tester_FGTester',
        {
          PPId,
          FG: FGPayload,
        },
        KFJLToken,
      );

      const tmpFG = await FG.findOne({
        where: {
          name: FGPayload.name,
        },
      });

      const Testers = await tmpFG.getTesters();
      const TesterNames = Testers.map(item => item.name);
      assert.deepEqual(TesterNames, FGPayload.Testers);
    });

    it('KFJL 创建 EJZH', async () => {
      const PPId = 1;
      const name = 'T_EJZH';
      const WLId = 7;
      const imageUrl = 'T_imageUrl';
      const XGTs = ['T_XGT1', 'T_XGT1'];
      const FGTesters = [
        {
          id: 1,
          number: 2,
        },
        {
          id: 2,
          number: 3,
        },
      ];
      const SJWLs = [
        {
          id: 13,
          number: 2,
        },
        {
          id: 14,
          number: 3,
        },
      ];

      await post(
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

      const tmpEJZH = await EJZH.findOne({
        where: {
          name: 'T_EJZH',
        },
      });

      assert.equal(tmpEJZH.PPId, PPId);
      assert.equal(tmpEJZH.name, name);
      assert.equal(tmpEJZH.WLId, WLId);
      assert.equal(tmpEJZH.imageUrl, imageUrl);

      const tmpXGTs = await tmpEJZH.getEJZHXGTs();
      const tmpXGTImageUrls = tmpXGTs.map(item => item.imageUrl);
      assert.deepEqual(tmpXGTImageUrls, XGTs);

      const tmpFGTesters = await tmpEJZH.getFGTesters();
      const tmpFGTesterObjs = tmpFGTesters.map(item => ({
        id: item.EJZH_FGTester.FGTesterId,
        number: item.EJZH_FGTester.number,
      }));
      assert.deepEqual(tmpFGTesterObjs, FGTesters);

      const tmpSJWLs = await tmpEJZH.getSJWLs();
      const tmpSJWLObjs = tmpSJWLs.map(item => ({
        id: item.EJZH_SJWL.WLId,
        number: item.EJZH_SJWL.number,
      }));
      assert.deepEqual(tmpSJWLObjs, SJWLs);
    });

    it('KFJL 编辑 EJZH', async () => {
      const name = 'T_EJZH';
      const tmpEJZH0 = await EJZH.findOne({
        where: {
          name,
        },
      });
      const id = tmpEJZH0.id;
      const WLId = 8;
      const imageUrl = 'T_imageUrl2';
      const XGTs = ['T_XGT2', 'T_XGT2'];
      const FGTesters = [
        {
          id: 3,
          number: 3,
        },
        {
          id: 4,
          number: 2,
        },
      ];
      const SJWLs = [
        {
          id: 15,
          number: 3,
        },
        {
          id: 16,
          number: 2,
        },
      ];

      await post(
        'editEJZH',
        {
          id,
          WLId,
          imageUrl,
          XGTs,
          FGTesters,
          SJWLs,
        },
        KFJLToken,
      );

      const tmpEJZH = await EJZH.findOne({
        where: {
          name: 'T_EJZH',
        },
      });

      assert.equal(tmpEJZH.name, name);
      assert.equal(tmpEJZH.WLId, WLId);
      assert.equal(tmpEJZH.imageUrl, imageUrl);

      const tmpXGTs = await tmpEJZH.getEJZHXGTs();
      const tmpXGTImageUrls = tmpXGTs.map(item => item.imageUrl);
      assert.deepEqual(tmpXGTImageUrls, XGTs);

      const tmpFGTesters = await tmpEJZH.getFGTesters();
      const tmpFGTesterObjs = tmpFGTesters.map(item => ({
        id: item.EJZH_FGTester.FGTesterId,
        number: item.EJZH_FGTester.number,
      }));
      assert.deepEqual(tmpFGTesterObjs, FGTesters);

      const tmpSJWLs = await tmpEJZH.getSJWLs();
      const tmpSJWLObjs = tmpSJWLs.map(item => ({
        id: item.EJZH_SJWL.WLId,
        number: item.EJZH_SJWL.number,
      }));
      assert.deepEqual(tmpSJWLObjs, SJWLs);
    });

    it('KFJL 创建 YJZH', async () => {
      const PPId = 1;
      const name = 'T_YJZH';
      const WLId = 1;
      const imageUrl = 'T_imageUrl';
      const XGTs = ['T_XGT1', 'T_XGT1'];
      const EJZHs = [
        {
          id: 1,
          number: 2,
        },
        {
          id: 2,
          number: 3,
        },
      ];

      await post(
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

      const tmpYJZH = await YJZH.findOne({
        where: {
          name: 'T_YJZH',
        },
      });

      assert.equal(tmpYJZH.PPId, PPId);
      assert.equal(tmpYJZH.name, name);
      assert.equal(tmpYJZH.WLId, WLId);
      assert.equal(tmpYJZH.imageUrl, imageUrl);

      const tmpXGTs = await tmpYJZH.getYJZHXGTs();
      const tmpXGTImageUrls = tmpXGTs.map(item => item.imageUrl);
      assert.deepEqual(tmpXGTImageUrls, XGTs);

      const tmpEJZHs = await tmpYJZH.getEJZHs();
      const tmpEJZHObjs = tmpEJZHs.map(item => ({
        id: item.YJZH_EJZH.EJZHId,
        number: item.YJZH_EJZH.number,
      }));
      assert.deepEqual(tmpEJZHObjs, EJZHs);
    });

    it('KFJL 编辑 YJZH', async () => {
      const name = 'T_YJZH';
      const tmpYJZH0 = await YJZH.findOne({
        where: {
          name,
        },
      });
      const id = tmpYJZH0.id;
      const WLId = 2;
      const imageUrl = 'T_imageUrl2';
      const XGTs = ['T_XGT2', 'T_XGT2'];
      const EJZHs = [
        {
          id: 2,
          number: 3,
        },
        {
          id: 3,
          number: 2,
        },
      ];

      await post(
        'editYJZH',
        {
          id,
          WLId,
          imageUrl,
          XGTs,
          EJZHs,
        },
        KFJLToken,
      );

      const tmpYJZH = await YJZH.findOne({
        where: {
          name: 'T_YJZH',
        },
      });

      assert.equal(tmpYJZH.name, name);
      assert.equal(tmpYJZH.WLId, WLId);
      assert.equal(tmpYJZH.imageUrl, imageUrl);

      const tmpXGTs = await tmpYJZH.getYJZHXGTs();
      const tmpXGTImageUrls = tmpXGTs.map(item => item.imageUrl);
      assert.deepEqual(tmpXGTImageUrls, XGTs);

      const tmpEJZHs = await tmpYJZH.getEJZHs();
      const tmpEJZHObjs = tmpEJZHs.map(item => ({
        id: item.YJZH_EJZH.EJZHId,
        number: item.YJZH_EJZH.number,
      }));
      assert.deepEqual(tmpEJZHObjs, EJZHs);
    });

    it('KFJL 配置 YJZH_GTs', async () => {
      const YJZHName = 'T_YJZH';
      const GTName = 'T_GT';
      const tmpYJZH0 = await YJZH.findOne({
        where: {
          name: YJZHName,
        },
      });
      const id = tmpYJZH0.id;
      const tmpGT0 = await GT.findOne({
        where: {
          name: GTName,
        },
      });
      const GTs = [{ id: tmpGT0.id, number: 3 }];

      await post(
        'setYJZH_GTs',
        {
          id,
          GTs,
        },
        KFJLToken,
      );

      const tmpYJZH = await YJZH.findOne({
        where: {
          name: 'T_YJZH',
        },
      });

      const tmpGTs = await tmpYJZH.getGTs();
      const tmpGTObjs = tmpGTs.map(item => ({ id: item.id, number: item.GT_YJZH.number }));
      assert.deepEqual(tmpGTObjs, GTs);
    });

    it('KFJL创建DD', async () => {
      const PPId = 1;
      const name = 'T_DD';

      await post(
        'createDD',
        {
          PPId,
          name,
        },
        KFJLToken,
      );

      const tmpDD = await DD.findOne({
        where: {
          name,
        },
      });

      assert.notEqual(tmpDD, null);
      // todo: 检查相关snapshot和DD_GT_WL DD_DW_DP
    });

    it('KFJL重置DD_GTFXs', async () => {
      const id = 1;
      const GTIds = [1, 2];

      await post(
        'setDD_GTFXs',
        {
          id,
          GTIds,
        },
        KFJLToken,
      );

      const tmpDD = await DD.findOne({
        where: {
          id,
        },
      });

      const tmpGTs = await tmpDD.getFXGTs();
      const tmpGTIds = tmpGTs.map(item => item.id);

      assert.deepEqual(tmpGTIds, GTIds);
      // todo: 检查相关snapshot和DD_GT_WL DD_DW_DP
    });

    it('KFJL重新生成DD', async () => {
      const DDId = 1;

      await post(
        'reCreateDD',
        {
          DDId,
        },
        KFJLToken,
      );

      assert.equal(1, 1);
      // todo: 检查相关snapshot和DD_GT_WL DD_DW_DP
    });

    it('PPJL 批量设置订单柜台物料的安装公司', async () => {
      const id = 1;
      const DD_GT_WLIds = [128, 129];

      await post(
        'setDDGTWLs_AZGS',
        {
          id,
          DD_GT_WLIds,
        },
        PPJLToken,
      );

      const tmpDD_GT_WLs = await DD_GT_WL.findAll({
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
      });

      assert.deepEqual([id, id], tmpDD_GT_WLs.map(item => item.AZGSId));
    });

    it('PPJL 批量设置订单灯位灯片的安装公司', async () => {
      const id = 1;
      const DD_DW_DPIds = [16, 17];

      await post(
        'setDDDWDPs_AZGS',
        {
          id,
          DD_DW_DPIds,
        },
        PPJLToken,
      );

      const tmpDD_DW_DPs = await DD_DW_DP.findAll({
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
      });

      assert.deepEqual([id, id], tmpDD_DW_DPs.map(item => item.AZGSId));
    });

    it('PPJL审批通过DD', async () => {
      const id = 1;

      await post(
        'approveDD',
        {
          id,
        },
        PPJLToken,
      );

      const tmpDD = await DD.findOne({
        where: {
          id,
        },
      });

      assert.equal(DDStatus.YSP, tmpDD.status);
    });

    it('GYSGLY 批量设置订单柜台物料的发货供应商', async () => {
      const DD_GT_WLIds = [128, 129];
      const GYSId = 6;

      await post(
        'setDDGTWLs_GYS',
        {
          DD_GT_WLIds,
          GYSId,
        },
        GYSGLYToken,
      );

      const tmpDD_GT_WLs = await DD_GT_WL.findAll({
        where: {
          id: {
            $in: DD_GT_WLIds,
          },
        },
      });

      assert.deepEqual([GYSId, GYSId], tmpDD_GT_WLs.map(item => item.GYSId));
    });

    it('GYSGLY 批量设置订单灯位灯片的发货供应商', async () => {
      const DD_DW_DPIds = [16, 17];
      const GYSId = 6;

      await post(
        'setDDDWDPs_GYS',
        {
          DD_DW_DPIds,
          GYSId,
        },
        GYSGLYToken,
      );

      const tmpDD_DW_DPs = await DD_DW_DP.findAll({
        where: {
          id: {
            $in: DD_DW_DPIds,
          },
        },
      });

      assert.deepEqual([GYSId, GYSId], tmpDD_DW_DPs.map(item => item.GYSId));
    });
  });
});
