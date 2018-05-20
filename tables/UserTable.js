import debug from 'debug';
import squel from 'squel';
import bCrypt from 'bcryptjs';
import BaseTable from './BaseTable';
import { PP, JS, User, sequelize } from '../models/Model';

const ppLog = debug('ppLog');

export default class UserTable extends BaseTable {
  getTable() {
    return User;
  }

  checkCreateParams() {
    // throw new Error('checkCreateParams should be overrided.');
  }

  checkEditParams() {
    // throw new Error('checkEditParams should be overrided.');
  }

  checkCreateRight() {
    // 除了admin, 其他人创建用户都应该用专用api, 这样才能控制创建的人在其负责范围内
    if (![JS.ADMIN].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDeleteRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record, transaction) {

    if (record && record.id === this.user.id) {
      // allow to do that
      return;
    }

    let tmpPP;
    let tmpGYSId;
    let tmpAZGSId;
    switch (record.JS) {
      case JS.ADMIN:
        if (this.user.JS !== JS.ADMIN)
          throw new Error('无此权限!');
        else
          break;
      case JS.PPJL:
        if (![JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.KFJL:
        if (![JS.PPJL, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpPPs = await record.getKFJLPPs({ transaction });
        for (let i = 0; i < tmpPPs.length; i++) {
          await this.user.checkPPId(tmpPPs[i].id, transaction);
        }
        break;
      case JS.GZ:
        if (![JS.KFJL, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpGTs = await record.getGTs({ transaction });
        for (let i = 0; i < tmpGTs.length; i++) {
          await this.user.checkGTId(tmpGTs[i].id, transaction);
        }
        break;
      case JS.GTBA:
        if (![JS.KFJL, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpGT = await record.getGT({ transaction });
        await this.user.checkGTId(tmpGT.id);
        break;
      case JS.GYSGLY:
        if (![JS.KFJL, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.AZGSGLY:
        if (![JS.KFJL, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.ZHY:
        if (![JS.GYSGLY, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpGYSs = await record.getGYSs({ transaction });
        // 程序上控制装货员只能属于一个供应商, 所以只需要取一条记录
        tmpGYSId = await tmpGYSs[0].id;
        if (this.user.GYSId !== tmpGYSId) {
          throw new Error('无此权限!');
        }

        break;
      case JS.AZG:
        if (![JS.AZGSGLY, JS.ADMIN].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpAZGSs = await record.getAZGSs({ transaction });
        // 程序上控制安装工只能属于一个安装公司, 所以只需要取一条记录
        tmpAZGSId = await tmpAZGSs[0].id;
        if (this.user.AZGSId !== tmpAZGSId) {
          throw new Error('无此权限!');
        }

        break;
      default:
        throw new Error('无此权限!');
    }
  }

  getLikeSearchFields() {
    // todo: get from schema
    return ['id', 'name'];
  }

  getDisplayFields() {
    return ['a.id', 'a.name', 'a.username', 'a.phone', 'a.mail', 'a.JS', 'a.createdAt', 'a.updatedAt'];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'name' }])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel.select().from('User', 'a');

    const likeFields = ['a.id', 'a.name', 'a.username'];

    let query = '';

    let relateds, ppIDs;

    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        relateds = await this.user.getPPJLPPs();
        ppIDs = _.map(relateds, (obj) => { return `'${obj.id}'` });

        query = `a.id in (SELECT UserId as id from PPJL_PP WHERE PPId in (${ppIDs})) OR a.id in (SELECT UserId as id from KFJL_PP WHERE PPId in (${ppIDs})) OR a.JS in ('${JS.AZGSGLY}', '${JS.GYSGLY}') OR a.id in (SELECT UserId as id from GZ_PP WHERE PPId in (${ppIDs})) OR a.id in (SELECT GTBAUserId as id from GT WHERE PPId in (${ppIDs}))`;
        break;
      case JS.KFJL:
        relateds = await this.user.getKFJLPPs();
        ppIDs = _.map(relateds, (obj) => { return `'${obj.id}'` });

        query = `a.id in (SELECT UserId as id from PPJL_PP WHERE PPId in (${ppIDs})) OR a.id in (SELECT UserId as id from KFJL_PP WHERE PPId in (${ppIDs})) OR a.JS in ('${JS.AZGSGLY}', '${JS.GYSGLY}') OR a.id in (SELECT UserId as id from GZ_PP WHERE PPId in (${ppIDs})) OR a.id in (SELECT GTBAUserId as id from GT WHERE PPId in (${ppIDs}))`;
        break;
      case JS.GYSGLY:
        relateds = await this.user.getGLYGYSs();
        let gysIDs = _.map(relateds, (obj) => { return `'${obj.id}'` });

        query = `a.id in (SELECT UserId as id from GLY_GYS WHERE GYSId in (${gysIDs})) OR a.id in (SELECT UserId as id from ZHY_GYS WHERE GYSId in (${gysIDs}))`;
        break;
      case JS.AZGSGLY:
        relateds = await this.user.getGLYAZGSs();
        let azgsIDs = _.map(relateds, (obj) => { return `'${obj.id}'` });

        query = `a.id in (SELECT UserId as id from GLY_AZGS WHERE AZGSId in (${azgsIDs})) OR a.id in (SELECT UserId as id from AZG_AZGS WHERE AZGSId in (${azgsIDs}))`;
        break;
      default: 
        break;
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

  // override 为了对password进行处理
  filterFields(fields) {
    const filteredFields = {
      ...fields,
    };
    // 防止指定id
    delete filteredFields.id;
    filteredFields.password = bCrypt.hashSync(filteredFields.password, 8);
    return filteredFields;
  }
}
