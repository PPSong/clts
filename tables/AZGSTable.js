import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { AZGS, JS } from '../models/Model';

const ppLog = debug('ppLog');

export default class AZGSTable extends BaseTable {
  getTable() {
    return AZGS;
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
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.AZGSGLY, JS.AZG].includes(this.user.JS)) {
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
    return ['a.id', 'a.name', 'a.disabledAt', 'a.createdAt', 'a.updatedAt'];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'name' }])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel.select().from('AZGS', 'a');

    const likeFields = ['a.id', 'a.name'];

    let query = '';

    if (this.user.JS === JS.AZGSGLY || this.user.JS === JS.AZG) {
      //只能获取和自己绑定的AZGS
      let azgsList = [];
      if (this.user.JS === JS.AZGSGLY) {
        azgsList = await this.user.getGLYAZGSs();
      } else {
        azgsList = await this.user.getAZGAZGSs();
      }
      azgsList = azgsList || [];

      if (azgsList.length < 1) {
        throw new Error('无此权限!');
      }

      let azgsIDs = [];
      azgsList.forEach(azgs => {
        azgsIDs.push(`'${azgs.id}'`);
      });

      query = `a.id in (${azgsIDs})`;
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
