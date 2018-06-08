import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetWLBH0AZGS extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids, AZGSId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // 检查ids存在
    const tmpWLBHs = await DBTables.WLBH.findAll({
      include: [
        {
          model: DBTables.GT,
          as: 'GT',
        },
      ],
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
    // end 检查ids存在

    // 是否属于同一PP
    const tmpPPIds = tmpWLBHs.map(item => item.GT.PPId);
    const tmpUniquePPId = [...new Set(tmpPPIds)];
    if (tmpUniquePPId.length > 1) {
      throw new Error('要属于同一品牌!');
    }
    const tmpPPId = tmpUniquePPId[0];
    // end 是否属于同一PP

    // 检查状态
    const notOKRecords = tmpWLBHs.filter(item => item.status !== DBTables.WLBHStatus.KFJLSPTG);
    if (notOKRecords.length > 0) {
      throw new Error(`物料补货记录:${notOKRecords}状态不属于${
        DBTables.WLBHStatus.KFJLSPTG
      }!`);
    }
    // end 检查状态

    await user.checkPPId(tmpPPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // set AZGS
    await DBTables.WLBH.update(
      {
        AZGSId: AZGSId ? AZGSId : null,
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
    // end set AZGS
  }
}
