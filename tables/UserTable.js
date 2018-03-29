import debug from 'debug';
import bCrypt from 'bcryptjs';
import BaseTable from './BaseTable';
import { PP, JS, User } from '../models/Model';

const ppLog = debug('ppLog');

export default class UserTable extends BaseTable {
  getTable() {
    return User;
  }

  checkCreateRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkSearchRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record) {
    switch (record.JS) {
      case JS.ADMIN:
        throw new Error('无此权限!');
      case JS.PPJL:
        if (![JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.KFJL:
        if (![JS.ADMIN, JS.PPJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.GZ:
        if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.GTBA:
        if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.GYSGLY:
        if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.AZGSGLY:
        if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.ZHY:
        if (![JS.ADMIN, JS.GYSGLY].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.AZG:
        if (![JS.ADMIN, JS.AZGSGLY].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    // todo: get from schema
    return ['id', 'name'];
  }

  async getQueryOption(keyword, id = null) {
    const option = {};
    let PPIds;
    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        PPIds = await this.user.getPPJLPPs().map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        if (id) {
          option.where.id.$eq = id;
        }
        break;
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
      case JS.GZ:
        PPIds = await this.user.getGZPPs().map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        if (id) {
          option.where.id.$eq = id;
        }
        break;
      case JS.GTBA:
        PPIds = await this.user.getGTBAPPs().map(item => item.id);
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

  // override 为了对password进行处理
  filterFields(fields) {
    const filteredFields = {
      ...fields,
    };
    // 防止指定id
    delete filteredFields.id;
    filteredFields.password = bCrypt.hashSync(filteredFields.password, 8);
    return filteredFields;
  }
}
