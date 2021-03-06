import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { FGTester, JS, GT } from '../models/Model';

const ppLog = debug('ppLog');

export default class FGTesterTable extends BaseTable {
  getTable() {
    return FGTester;
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
    if (![JS.ADMIN, JS.PPJL, JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record, transaction) {
    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
      case JS.KFJL:
        await this.user.checkPPId(record.PPId, transaction);
        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getDisplayFields() {
    return [
      'a.id',
      'a.name',
      'a.Code1',
      'a.Code2',
      'a.Code3',
      'a.Code4',
      'a.Code5',
      'a.disabledAt',
      'b.name PPName',
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword, onlyEnabled } = queryObj;
    const tmpSquel = squel
      .select()
      .from('FGTester', 'a')
      .join('PP', 'b', 'a.PPId = b.id');

    const likeFields = [
      'a.name',
      'a.Code1',
      'a.Code2',
      'a.Code3',
      'a.Code4',
      'a.Code5',
      'b.name',
    ];

    // 根据用户操作记录范围加入where
    let PPIds;
    let PPId;

    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        PPIds = await this.user
          .getPPJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpSquel.where(`
          a.PPId = ${PPId}
        `);

        break;
      case JS.KFJL:
        PPIds = await this.user
          .getKFJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpSquel.where(`
          a.PPId = ${PPId}
        `);

        break;
      default:
        throw new Error('无此权限!');
    }
    if (Number(onlyEnabled) === 1) tmpSquel.where(`a.disabledAt IS NULL or a.disabledAt = 0`);
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
