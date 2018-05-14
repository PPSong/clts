import debug from 'debug';
import BaseTable from './BaseTable';
import { DW, JS, GT } from '../models/Model';

const ppLog = debug('ppLog');

export default class DWTable extends BaseTable {
  getTable() {
    return DW;
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
        await this.user.checkGTId(record.GTId, transaction);
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    return ['id', 'name'];
  }

  async getQueryOption(keyword, transaction) {
    const option = {
      where: {},
      transaction,
      include: [
        {
          model: GT,
          as: 'GT',
          where: {},
        },
      ],
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
