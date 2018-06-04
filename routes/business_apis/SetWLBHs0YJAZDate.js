import _ from 'lodash';
import moment from 'moment';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetWLBHs0YJAZDate extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static validateParamsFormat(req, res, next) {
    const { ids, YJAZDate } = req.body;

    // 检查时间格式
    if (!moment(YJAZDate, 'YYYY-MM-DD').isValid()) {
      throw new Error(`${YJAZDate}时间格式不正确!`);
    }
    // end 检查时间格式
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, YJAZDate } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查WLBHIds存在
    const tmpWLBHs = await DBTables.WLBH.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpWLBHIds = tmpWLBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpWLBHIds);
    if (diffIds.length > 0) {
      throw new Error(`物料补货记录id:${diffIds}不存在!`);
    }
    // end 检查WLBHIds存在

    // 检查WLBH是否属于同一个AZGS
    const tmpWLBHAZGSIds = tmpWLBHs.map(item => item.AZGSId);
    const tmpUniqueWLBHAZGSIds = [...new Set(tmpWLBHAZGSIds)];

    if (tmpUniqueWLBHAZGSIds.length !== 1) {
      throw new Error('补货物料应该要存在并属于同一个安装公司!');
    }
    // end 检查WLBH是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueWLBHAZGSIds[0];

    // 检查WLBH状态是'通过' >= x < '收货'之前
    const notSetAGZSWLBHs = [];
    const notCSWLBHs = tmpWLBHs.filter(item => {
      if (!item.AZGSId) {
        notSetAGZSWLBHs.push(item);
      }
      return !(
        DBTables.WLBHStatusMap.get(item.status) <
            DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.WC) &&
          DBTables.WLBHStatusMap.get(item.status) >=
            DBTables.WLBHStatusMap.get(DBTables.WLBHStatus.TG)
      )
    });

    if (notCSWLBHs.length > 0) {
      throw new Error(`补货物料[${notCSWLBHs[0].id}]不在${DBTables.WLBHStatus.TG}状态之后并且${DBTables.WLBHStatus.SH}状态之前, 不可指定预计安装时间!`);
    }

    if (notSetAGZSWLBHs.length > 0) {
      throw new Error(`补货物料[${notSetAGZSWLBHs[0].id}]没有设置安装公司, 不可指定预计安装时间!`);
    }
    // end 检查WLBH状态是'通过' >= x < '收货'之前

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // end 检查WLBH是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.WLBH.update(
      {
        YJAZDate,
      },
      {
        where: {
          id: {
            $in: ids,
          },
        },
        transaction,
      },
    );
  }
}
