import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import * as DBTables from '../models/Model';

const ppLog = debug('ppLog');

export default class YJZHTable extends BaseTable {
  getTable() {
    return DBTables.YJZH;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record, transaction) {
    switch (this.user.JS) {
      case DBTables.JS.ADMIN:
        break;
      case DBTables.JS.PPJL:
      case DBTables.JS.KFJL:
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
      'a.imageUrl',
      'c.code WLCode',
      'c.name WLName',
      'a.disabledAt',
      'b.name PPName',
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword } = queryObj;
    const tmpSquel = squel
      .select()
      .from('YJZH', 'a')
      .join('PP', 'b', 'a.PPId = b.id')
      .join('WL', 'c', 'a.WLId = c.id');

    const likeFields = [
      'a.name',
      'c.code',
      'c.name',
      'b.name',
    ];

    // 根据用户操作记录范围加入where
    let PPIds;
    let PPId;

    switch (this.user.JS) {
      case DBTables.JS.ADMIN:
        break;
      case DBTables.JS.PPJL:
        PPIds = await this.user
          .getPPJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpSquel.where(`
          a.PPId = ${PPId}
        `);

        break;
      case DBTables.JS.KFJL:
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

  async findOne(id, transaction, queryObj) {
    this.checkFindOneRight();

    let findOneOption = {
      where: { id },
      transaction,
    };
    if (this.getFindOneOption) {
      findOneOption = await this.getFindOneOption(id, transaction);
    }
    const record = await this.getTable().findOne(findOneOption);

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看否在用户权限范围
    await this.checkUserAccess(record, transaction);

    let r = record.toJSON();

    if (Number(queryObj.detail) === 1) {
      r = await DBTables.YJZH.findOneAsDetail(r.id, transaction);
    }

    return {
      code: 1,
      data: r,
    };
  }
}
