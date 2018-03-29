import debug from 'debug';
import BaseTable from './BaseTable';
import { DW, JS, GT } from '../models/Model';

const ppLog = debug('ppLog');

export default class DWTable extends BaseTable {
  getTable() {
    return DW;
  }

  checkCreateRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkSearchRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record) {
    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
      case JS.KFJL:
        const { GTId } = record;
        const tmpGT = await GT.findOne({
          where: {
            id: GTId,
          },
        });
        if (tmpGT.PPId !== this.user.PPId) {
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

  async getQueryOption(keyword, id = null) {
    const option = {
      where: {},
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
      case JS.ADMIN:
        if (id) {
          option.where.id = { $eq: id };
        }
        break;
      case JS.PPJL:
        PPIds = await this.user.getPPJLPPs().map(item => item.id);
        option.include[0].where.PPId = {
          $in: PPIds,
        };
        if (id) {
          option.where.id = { $eq: id };
        }
        break;
      case JS.KFJL:
        PPIds = await this.user.getKFJLPPs().map(item => item.id);
        option.include[0].where.PPId = {
          $in: PPIds,
        };
        if (id) {
          option.where.id = { $eq: id };
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
