import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { DW, JS, GT } from '../models/Model';
import * as DBTables from '../models/Model';

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
      'a.createdAt',
    ];
  }

  getOrderByFields(orderByFields = JSON.stringify([
    { name: 'c.name' },
    { name: 'b.name' },
    { name: 'a.name' },
  ])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword } = queryObj;
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
      case JS.ADMIN:
        break;
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
        break;
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
    let record = await this.getTable().findOne(findOneOption);

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看否在用户权限范围
    await this.checkUserAccess(record, transaction);

    record = record.toJSON();

    if (Number(queryObj.detail) === 1) {  
      if (record.GTId) {
        let GT = await DBTables.GT.findOne({ 
          where:{
            id: record.GTId
          },
          transaction
        });
        if (GT) {
          record.GT_name = GT.name;
          record.GT_code = GT.code || '';
          record.GT_CS = GT.CS || '';
          record.GT_QY = GT.QY || '';

          if (GT.PPId) {
            let PP = await DBTables.PP.findOne({ 
              where:{
                id: GT.PPId
              },
              transaction
            });
            if (PP) {
              record.PPId = PP.id;
              record.PPName = PP.name;
            }
          }
        }
      }
  
      if (record.DPId) {
        let DP = await DBTables.DP.findOne({ 
          where:{
            id: record.DPId
          },
          transaction
        });
        if (DP) {
          record.DP_name = DP.name;
          record.DP_Code1 = DP.Code1 || '';
          record.DP_Code2 = DP.Code2 || '';
          record.DP_Code3 = DP.Code3 || '';
          record.DP_Code4 = DP.Code4 || '';
          record.DP_Code5 = DP.Code5 || '';
          record.DP_GYSId = DP.GYSId;
        }
  
        if (DP.GYSId) {
          let GYS = await DBTables.GYS.findOne({ 
            where:{
              id: DP.GYSId
            },
            transaction
          });
          if (GYS) record.DP_GYSName = GYS.name;
        }
      }
    }

    return {
      code: 1,
      data: record,
    };
  }
}
