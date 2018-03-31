import debug from 'debug';
import BaseTable from './BaseTable';
import { PP, JS } from '../models/Model';

const ppLog = debug('ppLog');

export default class PPTable extends BaseTable {
  getTable() {
    return PP;
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
    if (![JS.ADMIN].includes(this.user.JS)) {
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

  async checkUserAccess(redord) {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    return ['id', 'name'];
  }

  async getQueryOption(keyword, id = null) {
    const option = {};
    // 根据用户操作记录范围加入where
    // end 根据用户操作记录范围加入where

    // 把模糊搜索条件加入where
    if (keyword) {
      const fields = this.getLikeSearchFields();
      const likeArr = fields.map(item => ({ [item]: { $like: `%${keyword}%` } }));
      option.where = {
        ...option.where,
        $or: likeArr,
      };
    }
    // end 把模糊搜索条件加入where

    return option;
  }
}
