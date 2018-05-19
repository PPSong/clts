import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import * as DBTables from '../models/Model';

const ppLog = debug('ppLog');

export default class PPTable extends BaseTable {
  getTable() {
    return DBTables.GT;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.GZ].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (
      ![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }
  getDisplayFields() {
    return [
      'a.id',
      'a.QY',
      'a.CS',
      'a.code',
      'a.name',
      'a.disabledAt',
      'b.name PPName', 'a.createdAt', 'a.updatedAt'
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel
      .select()
      .from('GT', 'a')
      .join('PP', 'b', 'a.PPId = b.id');

    const likeFields = ['a.QY', 'a.CS', 'a.code', 'a.name', 'b.name'];

    let query = '';

    if (this.user.JS === DBTables.JS.GZ || this.user.JS === DBTables.JS.GTBA) {
      //只能获取和自己绑定的GYS
      if (this.user.JS === DBTables.JS.GZ) {
        query = `a.GZUserId = '${this.user.id}'`;
      } else {
        query = `a.GTBAUserId = '${this.user.id}'`;
      }
    } else if (this.user.JS === DBTables.JS.PPJL || this.user.JS === DBTables.JS.KFJL) {
      let pps = [];
      if (this.user.JS === DBTables.JS.PPJL) {
        pps = await this.user.getPPJLPPs();
      } else {
        pps = await this.user.getKFJLPPs();
      }

      if (pps.length < 1) {
        throw new Error('无此权限!');
      }

      let ppIDs = _.map(pps, (pp) => { return `'${pp.id}'` });

      query = `a.PPId in (${ppIDs})`;
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
}
