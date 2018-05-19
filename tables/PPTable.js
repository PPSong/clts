import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { PP, JS } from '../models/Model';

const ppLog = debug('ppLog');

export default class PPTable extends BaseTable {
  getTable() {
    return PP;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (![JS.ADMIN, JS.KFJL, JS.PPJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }
  getDisplayFields() {
    return ['a.id', 'a.name', 'a.disabledAt', 'a.createdAt', 'a.updatedAt'];
  }

  getOrderByFields(orderByFields = JSON.stringify([
    { name: 'a.id' },
  ])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel
      .select()
      .from('PP', 'a');

    const likeFields = ['a.name'];

    let query = '';

    if (this.user.JS !== JS.ADMIN) {
      //只能获取和自己绑定的GYS
      let ppList = [];
      if (this.user.JS === JS.KFJL) {
        ppList = await this.user.getKFJLPPs();
      } else if (this.user.JS === JS.PPJL) {
        ppList = await this.user.getPPJLPPs();
      }
      ppList = ppList || [];

      if (ppList.length < 1) {
        throw new Error('无此权限!');
      }

      let ppIDs = [];
      ppList.forEach(pp => {
        ppIDs.push(`'${pp.id}'`);
      });

      query = `a.id in (${ppIDs})`;
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
