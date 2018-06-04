import debug from 'debug';
import _ from 'lodash';
import squel from 'squel';
import BaseTable from './BaseTable';
import { WL, JS, PP, GYS } from '../models/Model';

const ppLog = debug('ppLog');

export default class WLTable extends BaseTable {
  getTable() {
    return WL;
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
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY].includes(this.user.JS)) {
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
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record, transaction) {
    switch (this.user.JS) {
      case JS.PPJL:
      case JS.KFJL:
        await this.user.checkPPId(record.PPId, transaction);
        break;
      case JS.GYSGLY:
        await this.user.checkGYSId(record.GYSId, transaction);
        break;
      case JS.ADMIN:
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getDisplayFields() {
    return [
      'a.id',
      'a.level',
      'a.code',
      'a.name',
      'b.name GYSName',
      'a.disabledAt',
      'c.name PPName',
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword, onlyEnabled } = queryObj;
    const tmpSquel = squel
      .select()
      .from('WL', 'a')
      .join('GYS', 'b', 'a.GYSId = b.id')
      .join('PP', 'c', 'a.PPId = c.id');

    const likeFields = ['a.level', 'a.code', 'a.name', 'b.name', 'c.name'];

    // 根据用户操作记录范围加入where
    let PPIds, GYSIds;
    let PPId, GYSId;

    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        tmpSquel.where(`
          a.PPId in (SELECT PPId as id FROM PPJL_PP WHERE UserId = ${this.user.id})
        `);
        break;
      case JS.KFJL:
        tmpSquel.where(`
          a.PPId in (SELECT PPId as id FROM KFJL_PP WHERE UserId = ${this.user.id})
        `);
        break;
      case JS.GYSGLY:
        tmpSquel.where(`
          a.GYSId in (SELECT GYSId as id FROM GLY_GYS WHERE UserId = ${this.user.id})
        `);
        break;
      default:
        break;
    }
    if (queryObj.level) tmpSquel.where(`a.level = ${queryObj.level}`);
    if (Number(onlyEnabled) === 1) tmpSquel.where(`a.disabledAt IS NULL or a.disabledAt = 0`);
    // end 根据用户操作记录范围加入where

    // 把模糊搜索条件加入where
    if (keyword) {
      const likeWhere = likeFields.reduce(
        (result, item) => result.or(`${item} like '%${keyword}%'`),
        squel.expr(),
      );
      tmpSquel.where(likeWhere.toString());
    }
    // end 把模糊搜索条件加入where

    return tmpSquel;
  }
}
