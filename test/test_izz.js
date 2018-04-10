//test
import {
    assert
  } from 'chai';
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

          console.log('ppt113', r.status);
          return r;
      } catch(err) {
        console.log('ppt112', err.response.status);
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
  
      it('small test2', async () => {
        assert.equal(1, 1);
      });
  
      it('temp test', async () => {
        const r = await get(
          'DW', {
            keyword: '1',
          },
          PPJLToken,
        );
        // console.log('izz--->',r.data)
        assert.equal(1, 1);
      });
    });
  
    describe('品牌(PP)', async () => {
      describe('成功', async () => {
        it('admin创建PP成功', async () => {
          const name = 'YSL';
          const response = await post(
            'PP', {
              name,
            },
            adminToken,
          );
  
          const r = await PP.findOne({
            where: {
              name
            }
          });
  
          // console.log('--->admin创建PP成功', response.data)
          assert.equal(1, response.data);
          assert.notEqual(r, null);
          assert.equal('YSL', r.dataValues.name);
        });
      });
  
      describe('失败', async () => {
        it('admin创建PP失败-创建重复品牌', async () => {
          const name = 'YSL';
          const response = await post(
            'PP', {
              name,
            },
            adminToken,
          );
          assert.equal(-1, response.data.code);
        });
  
        it('PPJL创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            PPJLToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('KFJL创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            KFJLToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('GZ创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            GZToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('GTBA创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            GTBAToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('GYSGLY创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            GYSGLYToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('AZGSGLY创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            AZGSGLYToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        });
  
        it('ZHY创建PP失败-没有权限', async () => {
          const name = 'YSL1';
  
            const response = await post(
              'PP', {
                name,
              },
              ZHYToken,
            );
         
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        }); //todo:request failed with status code 401
  
        it.skip('AZG创建PP失败-没有权限', async () => {
          const name = 'YSL1';
          const response = await post(
            'PP', {
              name,
            },
            AZGToken,
          );
  
          assert.equal(-1, response.data.code);
          assert.exists('无此权限', response.data.msg);
        }); //todo:request failed with status code 401
  
      });
    });
  
    describe('用户(User)', async () => {
      describe('成功', async () => {
        it('admin创建PPJL成功', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const username = 'YSL_PPJL';
          const password = '123456';
          const response = await post(
            'createPPJL', {
              PPId,
              username,
              password,
            },
            adminToken,
          );
  
          const user = await User.findOne({
            where: {
              username
            }
          });
          assert.equal('YSL_PPJL', user.dataValues.username);
  
          const r = await PPJL_PP.findOne({
            where: {
              PPId: PPId
            }
          });
  
          assert.equal(1, response.data.code);
          assert.equal(user.dataValues.id, r.dataValues.UserId);
        });
  
        it('PPJL创建KFJL成功', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const YSL_PPJLToken = await getToken('YSL_PPJL', '123456');
  
          const username = 'YSL_KFJL';
          const password = '123456';
          const response = await post(
            'createKFJL', {
              PPId,
              username,
              password,
            },
            YSL_PPJLToken,
          );
  
          const user = await User.findOne({
            where: {
              // username: username
            }
          });
          console.log('---------->izz5', response.data)
          assert.equal('YSL_KFJL', user.dataValues.username);
  
          const r = await KFJL_PP.findOne({
            where: {
              PPId: PPId
            }
          });
          assert.equal(user.dataValues.id, r.dataValues.UserId);
        });
      }); //todo:'user.checkPPId is not a function'
  
      describe('失败', async () => {
        it('admin创建PPJL失败-用户名重复', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const username = 'YSL_PPJL';
          const password = '123456';
          const response = await post(
            'createPPJL', {
              PPId,
              username,
              password,
            },
            adminToken,
          );
  
          assert.equal(-1, response.data.code);
        });
  
        it('PPJL创建KFJL失败-用户名重复', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const username = 'YSL_PPJL';
          const password = '123456';
          const response = await post(
            'createPPJL', {
              PPId,
              username,
              password,
            },
            PPJLToken,
          );
  
          assert.equal(-1, response.data.code);
        });
  
        it('PPJL创建KFJL失败-与PPJL所属PP不同的KFJL', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const username = 'YSL_PPJL';
          const password = '123456';
          const response = await post(
            'createPPJL', {
              PPId,
              username,
              password,
            },
            PPJLToken,
          );
  
          assert.equal(-1, response.data.code);
        });
      });
    });
  
    describe('柜台(GT)', async () => {
      let YSL_KFJLToken;
      before(async () => {
        const YSL_KFJLToken = await getToken('YSL_KFJL', '123456');
      })
  
      describe('成功', async () => {
        it('KFJL创建GT&GTBA成功', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const name = '上海YSL';
          const code = 'YSL01';
          const QY = '东区';
          const CS = '上海';
          const response = await post(
            'createGT_GTBA', {
              PPId,
              name,
              code,
              QY,
              CS
            },
            YSL_KFJLToken,
          );
          assert.equal(1, response.data.code);
  
          const user = await User.findOne({
            where: {
              username: code
            }
          });
          assert.equal(code, user.dataValues.username);
  
          const GTinfo = await GT.findOne({
            where: {
              PPId: PPId
            }
          });
          assert.equal('上海YSL', GTinfo.dataValues.name);
        });
      });
  
      describe('失败', async () => {
        it('KFJL创建GT失败-与KFJL所属PP不同的GT', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const name = '上海YSL';
          const code = 'YSL01';
          const QY = '东区';
          const CS = '上海';
          const response = await post(
            'createGT_GTBA', {
              PPId,
              name,
              code,
              QY,
              CS
            },
            KFJLToken,
          );
          assert.equal(-1, response.data.code);
        });
  
        it('KFJL创建GT失败-GT名称系统已经存在', async () => {
          const PPname = 'YSL'
          const PPFind = await PP.findOne({
            where: {
              name: PPname
            }
          });
          const PPId = PPFind.dataValues.id;
          const name = '上海YSL';
          const code = 'YSL01';
          const QY = '东区';
          const CS = '上海';
          console.log('ppt111')
          const response = await post(
            'createGT_GTBA', {
              PPId,
              name,
              code,
              QY,
              CS
            },
            YSL_KFJLToken,
          );

          assert.equal(-1, response.data.code);
        });
      });
    });
  
    describe('用户', async () => {
        describe('成功', async () => {
  
        });
  
        describe('失败', async () => {
  
        });
    });
  
  });