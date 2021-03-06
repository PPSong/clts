import debug from 'debug';
import { sequelize } from '../models/Model';

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj);
};

export default class BusinessQueryApiBase {
  static getApi() {
    return async (req, res, next) => {
      let transaction;
      const { user } = req;
      try {
        transaction = await sequelize.transaction();
        this.checkApiAccess(user);
        const data = await this.mainProcess(req, res, next, user, transaction);

        // commit
        await transaction.commit();
        // end commit

        res.json({
          code: 1,
          data,
        });
      } catch (err) {
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

    if (tmpJSs === "*") return;
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
