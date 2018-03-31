import { assert } from 'chai';
import axios from 'axios';
import debug from 'debug';
import fs from 'fs';
import _ from 'lodash';

import {
  init,
  sequelize,
  QY,
  CS,
  JS,
  UserPPJL,
  UserKFJL,
  PP,
  GT,
  GYS,
  AZGS,
  User,
  Student,
  Course,
  StudentCourse,
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

const get = async (path, params, token) => {
  const r = await axios.get(`${api}/${path}`, {
    params,
    headers: { Authorization: `bearer ${token}` },
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

describe('测试案例', () => {
  before(async () => {
    const data = await readFile(`${__dirname}/../tools/initDataScript.txt`);

    const scriptArr = data.split(';');

    await sequelize.sync({ force: true });

    for (let i = 0; i < scriptArr.length; i++) {
      if (scriptArr[i].trim().length > 0) {
        const r = await sequelize.query(scriptArr[i], null, { raw: true, type: 'INSERT' });
      }
    }

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

      console.log('pptest6');
      console.log(r.data);
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

      const r = await UserPPJL.findOne({ where: { PPId } });
      assert.notEqual(r.PPJLUserId, user.Id);
    });

    it('admin 创建 KFJL', async () => {
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
        adminToken,
      );

      const user = await User.findOne({ where: { username } });
      assert.notEqual(user, null);

      const r = await UserKFJL.findOne({ where: { PPId } });
      assert.notEqual(r.KFJLUserId, user.Id);
    });

    it('KFJL 创建 GT, GTBA', async () => {
      const name = 'T_GT';
      const code = 'T_GTCode';
      const tmpQY = QY.EAST;
      const tmpCS = '上海';
      await post(
        'createGT_GTBA',
        {
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
      const GTId = tmpGT.id;
      const imageUrl = 'T_imageUrl';
      await post(
        'setGT_IMAGE',
        {
          GTId,
          imageUrl,
        },
        KFJLToken,
      );

      const tmpGT2 = await GT.findOne({ where: { name } });
      assert.equal(tmpGT2.imageUrl, imageUrl);
    });

    it('admin 创建 GZ', async () => {
      const username = 'T_GZ';
      const password = '1';
      await post(
        'User',
        {
          username,
          password,
          JS: '柜长',
        },
        adminToken,
      );

      const tmpUser = await User.findOne({ where: { username } });
      assert.equal(tmpUser.JS, JS.GZ);
    });

    it('admin 配置 GZ 负责柜台', async () => {
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
        adminToken,
      );

      const tmpGT2 = await GT.findOne({ where: { name } });
      assert.equal(tmpGT2.GZUserId, GZUserId);
    });
  });

  // describe('test1', async () => {
  //   it('admin创建PPJL成功', async () => {
  //     const PPJLUsername = PPJLUsername1;
  //     const PPId = PPId1;
  //     const r = await axios.post(
  //       `${api}/createPPJL`,
  //       {
  //         username: PPJLUsername,
  //         password: '1',
  //         PPId,
  //       },
  //       {
  //         headers: { Authorization: `bearer ${adminToken}` },
  //       },
  //     );

  //     // 检查是否品牌1有username: PPJL1的品牌经理
  //     const tmpPP = await PP.findOne({ where: { id: PPId } });
  //     const tmpPPJLs = await tmpPP.getPPJLs();
  //     const tmpPPJLsName = tmpPPJLs.map(item => item.username);
  //     assert.equal(tmpPPJLsName.includes(PPJLUsername), true);
  //   });

  //   it('品牌经理创建KFJL成功', async () => {
  //     const PPJLUsername = PPJLUsername1;
  //     const PPId = PPId1;
  //     // 获得PPJL token
  //     let r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: PPJLUsername,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     const KFJLUsername = KFJLUsername1;
  //     r = await axios.post(
  //       `${api}/createKFJL`,
  //       {
  //         username: KFJLUsername,
  //         password: '1',
  //         PPId,
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否品牌1有username: KFJL1的客服经理
  //     const tmpPP = await PP.findOne({ where: { id: PPId } });
  //     const tmpKFJLs = await tmpPP.getKFJLs();
  //     const tmpKFJLsName = tmpKFJLs.map(item => item.username);
  //     assert.equal(tmpKFJLsName.includes(KFJLUsername), true);
  //   });

  //   it('客服经理创建柜台_GZ_GTBA成功', async () => {
  //     const GTName = GT1;
  //     const GZUsername = GZUsername1;
  //     const GTBAUsername = GTBAUsername1;
  //     // 获得KFJL token
  //     let r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: KFJLUsername1,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     r = await axios.post(
  //       `${api}/createGT_GZ_GTBA`,
  //       {
  //         GTName,
  //         GZUsername,
  //         GZPassword: '1',
  //         GTBAUsername,
  //         GTBAPassword: '1',
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否有柜台GT1, 柜长是GZ1, 柜台BA是GTBA1
  //     const tmpGT = await GT.findOne({ where: { name: GTName } });
  //     const tmpGZ = await tmpGT.getGZ();
  //     const tmpGTBA = await tmpGT.getGTBA();

  //     assert.equal(tmpGZ.username, GZUsername1);
  //     assert.equal(tmpGTBA.username, GTBAUsername1);
  //   });

  //   it('客服经理创建供应商_GYSGLY成功', async () => {
  //     let GYSName = GYS1;
  //     let GYSGLYUsername = GYSGLYUsername1;

  //     // 获得KFJL token
  //     let r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: KFJLUsername1,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     r = await axios.post(
  //       `${api}/createGYS_GYSGLY`,
  //       {
  //         GYSName,
  //         GYSGLYUsername,
  //         GYSGLYPassword: '1',
  //         isSC: true,
  //         isKC: true,
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     GYSName = GYS2;
  //     GYSGLYUsername = GYSGLYUsername2;
  //     r = await axios.post(
  //       `${api}/createGYS_GYSGLY`,
  //       {
  //         GYSName,
  //         GYSGLYUsername,
  //         GYSGLYPassword: '1',
  //         isSC: true,
  //         isKC: true,
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     GYSName = GYS3;
  //     GYSGLYUsername = GYSGLYUsername3;
  //     r = await axios.post(
  //       `${api}/createGYS_GYSGLY`,
  //       {
  //         GYSName,
  //         GYSGLYUsername,
  //         GYSGLYPassword: '1',
  //         isSC: true,
  //         isKC: true,
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否有供应商GYS1, 供应商管理员是GYSGLY1
  //     const tmpGYS = await GYS.findOne({ where: { name: GYSName } });
  //     const tmpGYSGLY = await tmpGYS.getGYSGLYs().map(item => item.username);

  //     assert.equal(tmpGYSGLY.includes(GYSGLYUsername), true);
  //   });

  //   it('客服经理创建安装公司_AZGSGLY成功', async () => {
  //     const AZGSName = AZGS1;
  //     const AZGSGLYUsername = AZGSGLYUsername1;

  //     // 获得KFJL token
  //     let r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: KFJLUsername1,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     r = await axios.post(
  //       `${api}/createAZGS_AZGSGLY`,
  //       {
  //         AZGSName,
  //         AZGSGLYUsername,
  //         AZGSGLYPassword: '1',
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否有安装公司AZGS1, 安装公司管理员是AZGSGLY1
  //     const tmpAZGS = await AZGS.findOne({ where: { name: AZGSName } });
  //     const tmpAZGSGLY = await tmpAZGS.getAZGSGLYs().map(item => item.username);

  //     assert.equal(tmpAZGSGLY.includes(AZGSGLYUsername), true);
  //   });

  //   it('KFJL新建柜台_GTBA成功', async () => {
  //     const name = 'GT1';
  //     const code = 'GT1Code';

  //     // 获得KFJL token
  //     const r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: KFJLUsername1,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     const record = await axios.post(
  //       `${api}/createGT_GTBA`,
  //       {
  //         name,
  //         code,
  //         QY: QY.EAST,
  //         CS: CS[0],
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否有创建的柜台
  //     const tmpGT = await GT.findOne({ where: { name } });
  //     assert.notEqual(tmpGT, null);

  //     // 检查柜台GTBA是否是正确的用户
  //     const tmpGTBA = await tmpGT.getGTBA();
  //     assert.equal(tmpGTBA.username, code);
  //   });

  //   it('KFJL设置柜台图片成功', async () => {
  //     const name = 'GT1';
  //     const code = 'GT1Code';

  //     // 获得KFJL token
  //     const r = await axios.post(`${baseUrl}/auth/signin`, {
  //       username: KFJLUsername1,
  //       password: '1',
  //     });
  //     const tmpToken = r.data.token;

  //     const record = await axios.post(
  //       `${api}/createGT_GTBA`,
  //       {
  //         name,
  //         code,
  //         QY: QY.EAST,
  //         CS: CS[0],
  //       },
  //       {
  //         headers: { Authorization: `bearer ${tmpToken}` },
  //       },
  //     );

  //     // 检查是否有创建的柜台
  //     const tmpGT = await GT.findOne({ where: { name } });
  //     assert.notEqual(tmpGT, null);

  //     // 检查柜台GTBA是否是正确的用户
  //     const tmpGTBA = await tmpGT.getGTBA();
  //     assert.equal(tmpGTBA.username, code);
  //   });
  // });
});
