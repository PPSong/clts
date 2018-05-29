import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetDWs0DP extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL, DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { DWIds, DPId } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkDPId(DPId, transaction);

    for (let i = 0; i < DWIds.length; i++) {
      await user.checkDWId(DWIds[i], transaction);
    }
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 设置DWs的DP
    // await tmpDP.setDWs(DWIds, { transaction });
    const sql = `
      UPDATE
        DW
      SET
        DPId = ${DPId}
      WHERE
        id in (${DWIds.join(',')})
    `;
    await DBTables.sequelize.query(sql, {
      type: DBTables.sequelize.QueryTypes.UPDATE,
      transaction,
    });
    // end 设置DWs的DP
  }
}
