import debug from 'debug';
import { sequelize } from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj);
};

const OK = {
  code: 1,
  data: 'ok',
};

export default class BusinessApiBase {
  static getApi() {
    return async (req, res, next) => {
      let transaction;
      const { user } = req;

      try {
        transaction = await sequelize.transaction();

        this.checkApiAccess(user);
        this.validateParamsFormat(req, res, next);
        await this.mainProcess(req, res, next, user, transaction);

        // commit
        await transaction.commit();
        // end commit

        res.json(OK);
      } catch (err) {
        await this.errorCatchingHook(req, res, next, user, transaction);

        // rollback
        await (transaction && transaction.rollback());
        // end rollback

        ppLog(err);
        next(err);
      }
    };
  }

  static getAllowAccessJSs() {
    throw new Error('getAllowAccessJSs需要被实现!');
  }

  static checkApiAccess(user) {
    const tmpJSs = this.getAllowAccessJSs();

    if (!tmpJSs.includes(user.JS)) {
      throw new Error('没有权限!');
    }
  }

  // 单纯校验参数格式, 不做数据库查询
  static validateParamsFormat(req, res, next) {}

  static async mainProcess(req, res, next, user, transaction) {
    throw new Error('mainProcess需要被实现!');
  }

  static async errorCatchingHook(req, res, next, user, transaction) {}
}
