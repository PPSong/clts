import _ from 'lodash';
import moment from 'moment';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDPBHs0YJAZDate extends BusinessApiBase {
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

    // 检查DPBHIds存在
    const tmpDPBHs = await DBTables.DPBH.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
      transaction,
    });

    const tmpDPBHIds = tmpDPBHs.map(item => item.id);
    const diffIds = _.difference(ids, tmpDPBHIds);
    if (diffIds.length > 0) {
      throw new Error(`灯片补货记录id:${diffIds}不存在!`);
    }
    // end 检查DPBHIds存在

    // 检查DPBH是否属于同一个AZGS
    const tmpDPBHAZGSIds = tmpDPBHs.map(item => item.AZGSId);
    const tmpUniqueDPBHAZGSIds = [...new Set(tmpDPBHAZGSIds)];

    if (tmpUniqueDPBHAZGSIds.length !== 1) {
      throw new Error('补货灯片应该要存在并属于同一个安装公司!');
    }
    // end 检查DPBH是否属于同一个AZGS

    const tmpAZGSId = tmpUniqueDPBHAZGSIds[0];

    // 检查DPBH状态是'通过' >= x < '收货'之前
    const notSetAGZSDPBHs = [];
    const notCSDPBHs = tmpDPBHs.filter(item => {
      if (!item.AZGSId) {
        notSetAGZSDPBHs.push(item);
      }
      return !(
        DBTables.DPBHStatusMap.get(item.status) <
            DBTables.DPBHStatusMap.get(DBTables.DPBHStatus.WC) &&
          DBTables.DPBHStatusMap.get(item.status) >=
            DBTables.DPBHStatusMap.get(DBTables.DPBHStatus.TG)
      )
    });

    if (notCSDPBHs.length > 0) {
      throw new Error(`补货灯片[${notCSDPBHs[0].id}]不在${DBTables.DPBHStatus.TG}状态之后并且${DBTables.DPBHStatus.SH}状态之前, 不可指定预计安装时间!`);
    }

    if (notSetAGZSDPBHs.length > 0) {
      throw new Error(`补货灯片[${notSetAGZSDPBHs[0].id}]没有设置安装公司, 不可指定预计安装时间!`);
    }
    // end 检查DPBH状态是'通过' >= x < '收货'之前

    // 检查AZGS是当前用户所属AZGS
    const tmpAZGS = await user.checkAZGSId(tmpAZGSId, transaction);
    // end 检查AZGS是当前用户所属AZGS

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // end 检查DPBH是否属于同一个DD, 同一个AZGS, 并且是操作者所属AZGS

    await DBTables.DPBH.update(
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
