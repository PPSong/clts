import debug from 'debug';
import squel from 'squel';
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
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
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

  getDisplayFields() {
    return [
      'a.id',
      'b.code GTCode',
      'b.name GTName',
      'a.name',
      'a.CC',
      'a.CZ',
      'a.disabledAt',
      'c.name PPName',
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([
    { name: 'c.name' },
    { name: 'b.name' },
    { name: 'a.name' },
  ])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel
      .select()
      .from('DW', 'a')
      .join('GT', 'b', 'a.GTId = b.id')
      .join('PP', 'c', 'b.PPId = c.id');

    const likeFields = ['b.code', 'b.name', 'a.name', 'a.CC', 'A.CZ', 'c.name'];

    // 根据用户操作记录范围加入where
    let PPIds;
    let PPId;

    switch (this.user.JS) {
      case JS.PPJL:
        PPIds = await this.user
          .getPPJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpSquel.where(`
          b.PPId = ${PPId}
        `);

        break;
      case JS.KFJL:
        PPIds = await this.user
          .getKFJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpSquel.where(`
          b.PPId = ${PPId}
        `);

        break;
      default:
        throw new Error('无此权限!');
    }
    // end 根据用户操作记录范围加入where

    // 把模糊搜索条件加入where
    if (keyword) {
      const likeWhere = likeFields.reduce(
        (result, item) => result.or(`${item} like '%${keyword}%'`),
        squel.expr(),
      );
      tmpSquel.where(likeWhere.toString());
    }
    // end 把模糊搜索条件加入where

    return tmpSquel;
  }
}
