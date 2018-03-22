import BaseTable from './BaseTable';
import { PP } from '../models/Model';

export default class PPTable extends BaseTable {
  getTable() {
    return PP;
  }

  getEditableFields() {
    // todo: get from modal schema
    return ['name'];
  }

  getUserAccessRange() {
    throw new Error('getUserAccessRange should be overrided.');
  }

  getLikeSearchFields() {
    throw new Error('getLikeSearchFields should be overrided.');
  }

  getQueryOption(keyword) {
    const option = {};
    // 根据用户操作记录范围加入where
    // 把模糊搜索条件加入where
    if (keyword) {
      option.where = {
        ...option.where,
        $or: [
          {
            name: {
              $like: `%${keyword}%`,
            },
          },
          {
            id: {
              $like: `%${keyword}%`,
            },
          },
        ],
      };
    }
    return option;
  }
}

