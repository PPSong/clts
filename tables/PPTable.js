import debug from 'debug';
import squel from 'squel';
import BaseTable from './BaseTable';
import { PP, JS, sequelize } from '../models/Model';

const ppLog = debug('ppLog');

export default class PPTable extends BaseTable {
  getTable() {
    return PP;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (![JS.ADMIN, JS.KFJL, JS.PPJL, JS.GZ, JS.GTBA].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![JS.ADMIN, JS.KFJL, JS.PPJL, JS.GZ, JS.GTBA].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(redord, transaction) {
    if (![JS.ADMIN, JS.KFJL, JS.PPJL, JS.GZ, JS.GTBA].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }
  getDisplayFields() {
    return ['a.id', 'a.name', 'a.disabledAt', 'a.createdAt', 'a.updatedAt'];
  }

  getOrderByFields(orderByFields = JSON.stringify([
    { name: 'a.id' },
  ])) {
    return orderByFields;
  }

  async getQueryOption(queryObj, transaction) {
    const { keyword } = queryObj;
    const tmpSquel = squel
      .select()
      .from('PP', 'a');

    const likeFields = ['a.name'];

    let query = '';

    if (this.user.JS !== JS.ADMIN) {
      //只能获取和自己绑定的GYS
      let ppIDs = [];
      if (this.user.JS === JS.GTBA) {
        let gt = await this.user.getGTBA();
        ppIDs = [ gt.PPId ];
      } else {
        let ppList = [];
        if (this.user.JS === JS.KFJL) {
          ppList = await this.user.getKFJLPPs();
        } else if (this.user.JS === JS.PPJL) {
          ppList = await this.user.getPPJLPPs();
        } else if (this.user.JS === JS.GZ) {
          ppList = await this.user.getGZPPs();
        }

        ppList = ppList || [];

        ppList.forEach(pp => {
          ppIDs.push(`'${pp.id}'`);
        });
      }

      if (ppIDs.length < 1) {
        throw new Error('无此权限!');
      }

      query = `a.id in (${ppIDs})`;
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

  async wrapperGetListResult(records, queryObj) {
    records = records || [];
    if (this.user.JS === JS.ADMIN && Number(queryObj.needPPJL) === 1) {
      for(let i = 0; i < records.length; i++) {
        let pp = records[i];
        let sql = `SELECT id, name, username, phone, mail FROM User WHERE id in (SELECT UserId as id FROM PPJL_PP WHERE PPId = '${pp.id}')`;
        let ppjls = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        pp.PPJL = ppjls[0];
        if (pp.PPJL) {
          pp.PPJL = {
            id: pp.PPJL.id,
            name: pp.PPJL.name,
            username: pp.PPJL.username,
            phone: pp.PPJL.phone,
            mail: pp.PPJL.mail
          };
        }
        records[i] = pp;
      }
    }
    return records;
  }
}
