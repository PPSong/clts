import debug from 'debug';
import bCrypt from 'bcryptjs';
import squel from 'squel';
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
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkEditRight() {
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkListRight() {
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkDisableRight() {
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkEnableRight() {
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  checkFindOneRight() {
    if (
      ![JS.ADMIN, JS.PPJL, JS.KFJL, JS.GYSGLY, JS.AZGSGLY].includes(this.user.JS)
    ) {
      throw new Error('无此权限!');
    }
  }

  async checkUserAccess(record, transaction) {
    let tmpPP;
    let tmpGYSId;
    let tmpAZGSId;
    switch (record.JS) {
      case JS.ADMIN:
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

  getDisplayFields() {
    return ['a.id', 'a.username', 'a.JS'];
  }

  getOrderByFields(orderByFields = JSON.stringify([{ name: 'username' }])) {
    return orderByFields;
  }

  async getQueryOption(keyword, transaction) {
    const tmpSquel = squel.select().from('User', 'a');

    const likeFields = ['a.id', 'a.name'];

    let PPIds;
    let PPId;
    let tmpJSs;

    // 根据用户操作记录范围加入where
    switch (this.user.JS) {
      case JS.ADMIN:
        break;
      case JS.PPJL:
        PPIds = await this.user
          .getPPJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpJSs = [JS.PPJL, JS.KFJL, JS.GZ, JS.GTBA, JS.GYSGLY, JS.AZGSGLY];
        tmpSquel
          .left_join('PPJL_PP', 'b', 'a.id = b.UserId')
          .left_join('KFJL_PP', 'c', 'a.id = c.UserId')
          .left_join('GZ_PP', 'd', 'a.id = d.UserId')
          .left_join('GT', 'e', 'a.id = e.GTBAUserId')
          .where(`a.JS in (${tmpJSs.join(',')})`)
          .where(`
            (
              a.JS = '${JS.PPJL}'
            AND
              c.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.KFJL}'
            AND
              c.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.GZ}'
            AND
              d.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.GTBA}'
            AND
              e.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.AZGSGLY}'
            )
          OR
            (
              a.JS = '${JS.GYSGLY}'
            )
          `);

        break;
      case JS.KFJL:
        PPIds = await this.user
          .getKFJLPPs({ transaction })
          .map(item => item.id);
        PPId = PPIds[0];
        tmpJSs = [JS.KFJL, JS.GZ, JS.GTBA, JS.GYSGLY, JS.AZGSGLY].map(item => `'${item}'`);
        tmpSquel
          .left_join('KFJL_PP', 'c', 'a.id = c.UserId')
          .left_join('GZ_PP', 'd', 'a.id = d.UserId')
          .left_join('GT', 'e', 'a.id = e.GTBAUserId')
          .where(`a.JS in (${tmpJSs.join(',')})`)
          .where(`
            (
              a.JS = '${JS.KFJL}'
            AND
              c.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.GZ}'
            AND
              d.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.GTBA}'
            AND
              e.PPId = ${PPId}
            )
          OR
            (
              a.JS = '${JS.AZGSGLY}'
            )
          OR
            (
              a.JS = '${JS.GYSGLY}'
            )
          `);

        break;
      case JS.GYSGLY:
        const GYSIds = await this.user
          .getGLYGYSs({ transaction })
          .map(item => item.id);
        const tmpGYSId = GYSIds[0];
        tmpJSs = [JS.ZHY].map(item => `'${item}'`);
        tmpSquel
          .left_join('ZHY_GYS', 'b', 'a.id = b.UserId')
          .where(`a.JS in (${tmpJSs.join(',')})`).where(`
        (
          a.JS = '${JS.ZHY}'
        AND
          b.GYSId = ${tmpGYSId}
        )
      `);

        break;
      case JS.AZGSGLY:
        const AZGSIds = await this.user
          .getGLYAZGSs({ transaction })
          .map(item => item.id);
        const tmpAZGSId = AZGSIds[0];
        tmpJSs = [JS.AZG].map(item => `'${item}'`);
        tmpSquel
          .left_join('AZG_AZGS', 'b', 'a.id = b.UserId')
          .where(`a.JS in (${tmpJSs.join(',')})`).where(`
        (
          a.JS = '${JS.AZG}'
        AND
          b.AZGSId = ${tmpAZGSId}
        )
      `);

        break;
      default:
        throw new Error('无此权限!');
    }

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

  // override 为了对password进行处理
  filterEditFields(fields) {
    const filteredFields = {
      ...fields,
    };
    filteredFields.password = bCrypt.hashSync(filteredFields.password, 8);
    return filteredFields;
  }
}
