import debug from 'debug';
import BaseTable from './BaseTable';
import { User, JS } from '../models/Model';

const ppLog = debug('ppLog');

export default class UserTable extends BaseTable {
  getTable() {
    return User;
  }

  getEditableFields(r) {
    // todo: get from modal schema
    return ['name'];
  }

  getLikeSearchFields() {
    return ['id', 'name'];
  }

  getQueryOption(keyword) {
    const option = {};
    // 根据用户操作记录范围加入where
    const { PPId } = this.user;

    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.AZG:
        return false;
      case JS.AZGGLY:
        return false;
      case JS.GTBA:
        option.where = {
          id: PPId,
        };
        break;
      case JS.GYSGLY:
        return false;
      case JS.GZ:
        option.where = {
          id: PPId,
        };
        break;
      case JS.KFJL:
        option.where = {
          id: PPId,
        };
        break;
      case JS.PPJL:
        option.where = {
          id: PPId,
        };
        break;
      case JS.ZHY:
        return false;
      default:
        break;
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
