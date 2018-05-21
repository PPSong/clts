import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { GYS, JS } from '../models/Model';

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
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  getDisplayFields() {
    return ['a.id', 'a.name', 'a.type', 'a.disabledAt', 'a.createdAt', 'a.updatedAt', 'user_phone', 'user_name', 'user_username', 'user_id'];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
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

      query = `a.id in (${gysIDs})`;
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

    return tmpSquel;
  }

  async getQueryResultOption(keyword, transaction) {
    let tmpSquel = await this.getQueryOption(keyword, transaction);

    tmpSquel.left_join(squel.select().field('max(UserId)', 'UserId').field('GYSId').from('GLY_GYS').group('GYSId'), 'b', 'a.id = b.GYSId');
    tmpSquel.left_join(squel.select().field('phone', 'user_phone').field('username', 'user_username').field('id', 'user_id').field('name', 'user_name').from('User'), 'c', 'b.UserId = c.user_id');

    return tmpSquel;
  }
}
