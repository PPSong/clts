import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import * as DBTables from '../models/Model';

const ppLog = debug('ppLog');

export default class GTTable extends BaseTable {
  getTable() {
    return DBTables.GT;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.GZ, DBTables.JS.KFJL].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (
      ![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA, DBTables.JS.AZG].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![DBTables.JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA, DBTables.JS.AZG].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![DBTables.JS.ADMIN, DBTables.JS.PPJL, DBTables.JS.KFJL, DBTables.JS.GZ, DBTables.JS.GTBA, DBTables.JS.AZG].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async findOne(id, transaction) {
    this.checkFindOneRight();

    if (this.user.JS === DBTables.JS.AZG) {
      await this.user.checkGTId(id, transaction);
    }

    let findOneOption = {
      where: { id },
      transaction,
    };
    if (this.getFindOneOption) {
      findOneOption = await this.getFindOneOption(id, transaction);
    }
    let record = await this.getTable().findOne(findOneOption);

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看否在用户权限范围
    await this.checkUserAccess(record, transaction);

    record = record.toJSON();

    let PP = await DBTables.PP.findOne({ 
      where:{
        id: record.PPId
      },
      transaction
    });
    record.PPName = PP.name;

    if (record.GZUserId) {
      let GZUser = await DBTables.User.findOne({ 
        where:{
          id: record.GZUserId
        },
        transaction
      });
      record.GZUser_username = GZUser.username;
      record.GZUser_name = GZUser.name || '';
      record.GZUser_phone = GZUser.phone || '';
      record.GZUser_mail = GZUser.mail || '';
    }

    return {
      code: 1,
      data: record,
    };
  }

  getDisplayFields() {
    return [
      'a.id',
      'a.QY',
      'a.CS',
      'a.code',
      'a.name',
      'a.GZUserId',
      'a.GTBAUserId',
      'a.PPId',
      'a.disabledAt',
      'b.name PPName', 'a.createdAt', 'a.updatedAt',
      'c.name GZUser_name',
      'c.username GZUser_username',
      'c.phone GZUser_phone',
      'c.mail GZUser_mail'
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'a.id' }])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword } = queryObj;
    const tmpSquel = squel
      .select()
      .from('GT', 'a')
      .join('PP', 'b', 'a.PPId = b.id')
      .left_join('User', 'c', 'a.GZUserId = c.id');

    const likeFields = ['a.QY', 'a.CS', 'a.code', 'a.name', 'b.name'];

    let query = '';

    if (this.user.JS === DBTables.JS.GZ || this.user.JS === DBTables.JS.GTBA) {
      //只能获取和自己绑定的GYS
      if (this.user.JS === DBTables.JS.GZ) {
        query = `a.GZUserId = '${this.user.id}'`;
      } else {
        query = `a.GTBAUserId = '${this.user.id}'`;
      }
    } else if (this.user.JS === DBTables.JS.PPJL || this.user.JS === DBTables.JS.KFJL) {
      let pps = [];
      if (this.user.JS === DBTables.JS.PPJL) {
        pps = await this.user.getPPJLPPs();
      } else {
        pps = await this.user.getKFJLPPs();
      }

      if (pps.length < 1) {
        throw new Error('无此权限!');
      }

      let ppIDs = _.map(pps, (pp) => { return `'${pp.id}'` });

      query = `a.PPId in (${ppIDs})`;
    } else if (this.user.JS === DBTables.JS.AZG) {
      query = `a.id in (
          select GTId
          from (
            select *
            from DD_DW_DP
            where AZGUserId = ${this.user.id}
          ) a
          left join DW b
          on a.DWId = b.id
          GROUP BY GTId
          
          UNION
          
          select GTId id
          from DD_GT_WL 
          where AZGUserId = ${this.user.id}
          GROUP BY GTId
        )`;
    } 

    // 把模糊搜索条件加入where
    if (keyword) {
      const likeWhere = likeFields.reduce(
        (result, item) => result.or(`${item} like '%${keyword}%'`),
        squel.expr(),
      );
      if (query) {
        query = `(${query}) AND (${likeWhere.toString()})`;
      } else {
        query = likeWhere.toString();
      }
    }
    // end 把模糊搜索条件加入where
    if (query) {
      tmpSquel.where(query);
    }

    return tmpSquel;
  }
}
