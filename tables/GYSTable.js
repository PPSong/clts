import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { GYS, JS, sequelize, WYWLStatus } from '../models/Model';

const ppLog = debug('ppLog');

export default class GYSTable extends BaseTable {
  getTable() {
    return GYS;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.ZHY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  getDisplayFields() {
    return ['a.id', 'a.name', 'a.type', 'a.disabledAt', 'a.createdAt', 'a.updatedAt', 'user_phone', 'user_name', 'user_username', 'user_id'];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword, onlyEnabled } = queryObj;
    const tmpSquel = squel.select().from('GYS', 'a');

    const likeFields = ['a.name', 'a.type'];

    let query = '';

    if (this.user.JS === JS.GYSGLY || this.user.JS === JS.ZHY) {
      //只能获取和自己绑定的GYS
      let gysList = [];
      if (this.user.JS === JS.GYSGLY) {
        gysList = await this.user.getGLYGYSs();
      } else {
        gysList = await this.user.getZHYGYSs();
      }
      gysList = gysList || [];

      if (gysList.length < 1) {
        throw new Error('无此权限!');
      }

      let gysIDs = [];
      gysList.forEach(gys => {
        gysIDs.push(`'${gys.id}'`);
      });

      query = `a.id in (${gysIDs}) OR a.type = '中转'`;
    }

    // 把模糊搜索条件加入where
    if (keyword) {
      const likeWhere = likeFields.reduce(
        (result, item) => result.or(`${item} like '%${keyword}%'`),
        squel.expr(),
      );
      if (query) {
        query = `(${query}) AND (${likeWhere.toString()})`;
      } else {
        query = likeWhere.toString();
      }
    }
    // end 把模糊搜索条件加入where
    if (query) {
      tmpSquel.where(query);
    }
    if (Number(onlyEnabled) === 1) tmpSquel.where('a.disabledAt IS NULL or a.disabledAt = 0');

    return tmpSquel;
  }

  async getQueryResultOption(queryObj, transaction) {
    let tmpSquel = await this.getQueryOption(queryObj, transaction);

    tmpSquel.left_join(squel.select().field('max(UserId)', 'UserId').field('GYSId').from('GLY_GYS').group('GYSId'), 'b', 'a.id = b.GYSId');
    tmpSquel.left_join(squel.select().field('phone', 'user_phone').field('username', 'user_username').field('id', 'user_id').field('name', 'user_name').from('User'), 'c', 'b.UserId = c.user_id');

    return tmpSquel;
  }

  async wrapperGetListResult(GYSs, queryObj, transaction) {
    if (!queryObj.checkWLsKuCun) return GYSs;

    const checkWLsKuCun = queryObj.checkWLsKuCun.split(',');
    let requiredWLIds = [];

    for (let i = 0; i < checkWLsKuCun.length; i++) {
      let WLIdAndNum = checkWLsKuCun[i];
      let tmp = WLIdAndNum.split('*');
      let WLId = Number(tmp[0]);
      let num = Number(tmp[1]);
      requiredWLIds.push(WLId);
      checkWLsKuCun[i] = {
        WLId, num
      };
    }
    requiredWLIds = requiredWLIds.join(',');

    const list = [];
    for (let GYS of GYSs) {
      if (GYS.type === '中转') {
        let WLs = await sequelize.query(`
        SELECT 
          WLId, COUNT(*) as num
        FROM
          WYWL 
        WHERE 
          WLId in (${requiredWLIds}) AND 
          GYSId = ${GYS.id} AND 
          status = '${WYWLStatus.RK}'
        GROUP BY 
          WLId
        `, {
          type: sequelize.QueryTypes.SELECT,
          transaction
        });
        GYS.WLsKuCun = WLs;

        const hash = {};
        for (let WL of WLs) {
          WL.WLId = Number(WL.WLId);
          hash[WL.WLId] = WL;
        }

        for (let WL of checkWLsKuCun) {
          WL.WLId = Number(WL.WLId);
          let item = hash[WL.WLId] || { WLId:WL.WLId, num:0 };
          console.log(item.num, WL.num);
          if (item.num < WL.num) {
            if (!GYS.QSKC) GYS.QSKC = [];
            GYS.QSKC.push(WL.WLId);
          }
        }
      }
      list.push(GYS);
    }
    return list;
  }
}
