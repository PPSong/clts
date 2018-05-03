import debug from 'debug';
import BaseTable from './BaseTable';
import { FGTester, JS, GT } from '../models/Model';

const ppLog = debug('ppLog');

export default class FGTesterTable extends BaseTable {
  getTable() {
    return FGTester;
  }

  checkCreateParams() {
    throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    throw new Error('checkEditParams should be overrided.');
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

  async checkUserAccess(record, transaction) {
    switch (this.user.JS) {
      case JS.PPJL:
      case JS.KFJL:
        await this.user.checkPPId(record.PPId, transaction);
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    return ['id', 'name', 'code1', 'code2', 'code3', 'code4', 'code5'];
  }

  async getQueryOption(keyword, transaction) {
    const option = {
      where: {},
      transaction,
    };
    let PPIds;
    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.PPJL:
        PPIds = await this.user.getPPJLPPs({ transaction }).map(item => item.id);
        option.include[0].where.PPId = {
          $in: PPIds,
        };
        break;
      case JS.KFJL:
        PPIds = await this.user.getKFJLPPs({ transaction }).map(item => item.id);
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
