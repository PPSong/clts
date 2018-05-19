import debug from 'debug';
import bCrypt from 'bcryptjs';
import BaseTable from './BaseTable';
import { PP, JS, User } from '../models/Model';

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
        if (![JS.PPJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpPPs = await record.getKFJLPPs({ transaction });
        for (let i = 0; i < tmpPPs.length; i++) {
          await this.user.checkPPId(tmpPPs[i].id, transaction);
        }
        break;
      case JS.GZ:
        if (![JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpGTs = await record.getGTs({ transaction });
        for (let i = 0; i < tmpGTs.length; i++) {
          await this.user.checkGTId(tmpGTs[i].id, transaction);
        }
        break;
      case JS.GTBA:
        if (![JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }

        const tmpGT = await record.getGT({ transaction });
        await this.user.checkGTId(tmpGT.id);
        break;
      case JS.GYSGLY:
        if (![JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.AZGSGLY:
        if (![JS.KFJL].includes(this.user.JS)) {
          throw new Error('无此权限!');
        }
        break;
      case JS.ZHY:
        if (![JS.GYSGLY].includes(this.user.JS)) {
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
        if (![JS.AZGSGLY].includes(this.user.JS)) {
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

  async getQueryOption(keyword, transaction) {
    const option = {
      transaction,
    };
    let PPIds;
    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        PPIds = await this.user.getPPJLPPs({ transaction }).map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        break;
      case JS.KFJL:
        PPIds = await this.user.getKFJLPPs({ transaction }).map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        break;
      case JS.GZ:
        PPIds = await this.user.getGZPPs({ transaction }).map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
        break;
      case JS.GTBA:
        PPIds = await this.user.getGTBAPPs({ transaction }).map(item => item.id);
        option.where = {
          id: {
            $in: PPIds,
          },
        };
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
