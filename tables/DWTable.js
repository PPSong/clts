import debug from 'debug';
import BaseTable from './BaseTable';
import { DW, JS } from '../models/Model';

const ppLog = debug('ppLog');

export default class DWTable extends BaseTable {
  getTable() {
    return DW;
  }

  checkCreateRight() {
    if (![JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkSearchRight() {
    if (![JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    return ['id', 'name'];
  }

  async getQueryOption(keyword, id = null) {
    const option = {};
    let PPIds;
    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.KFJL:
        PPIds = await this.user.getKFJLPPs().map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        if (id) {
          option.where.id.$eq = id;
        }
        break;
      default:
        throw new Error('无此权限!');
    }
    // 把模糊搜索条件加入where
    if (keyword) {
      const fields = this.getLikeSearchFields();
      const likeArr = fields.map(item => ({ [item]: { $like: `%${keyword}%` } }));
      option.where = {
        ...option.where,
        $or: likeArr,
      };
    }
    return option;
  }
}
