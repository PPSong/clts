import debug from 'debug';
import BaseTable from './BaseTable';
import { DP, JS, PP, GYS } from '../models/Model';

const ppLog = debug('ppLog');

export default class DPTable extends BaseTable {
  getTable() {
    return DP;
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
    if (![JS.PPJL, JS.KFJL].includes(this.user.JS)) {
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

  async checkUserAccess(record) {
    switch (this.user.JS) {
      case JS.PPJL:
      case JS.KFJL:
        if (record.PPId !== this.user.PPId) {
          throw new Error('无此权限!');
        }
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    return ['id', 'name'];
  }

  async getQueryOption(keyword) {
    const option = {
      where: {},
      include: [
        {
          model: PP,
          as: 'PP',
          where: {},
        },
        {
          model: GYS,
          as: 'GYS',
          where: {},
        },
      ],
    };
    let PPIds;
    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.PPJL:
        PPIds = await this.user.getPPJLPPs().map(item => item.id);
        option.include[0].where.PPId = {
          $in: PPIds,
        };
        break;
      case JS.KFJL:
        PPIds = await this.user.getKFJLPPs().map(item => item.id);
        option.include[0].where.PPId = {
          $in: PPIds,
        };
        break;
      default:
        throw new Error('无此权限!');
    }
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
