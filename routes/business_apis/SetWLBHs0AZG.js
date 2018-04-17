import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetWLBHs0AZG extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      HBUUID, GTId, WLIds, AZGUserId,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkAZGUserId(AZGUserId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await DBTables.WLBH.update(
      {
        AZGUserId,
      },
      {
        where: {
          HBUUID,
          GTId,
          WLId: {
            $in: WLIds,
          },
        },
        transaction,
      },
    );
  }
}
