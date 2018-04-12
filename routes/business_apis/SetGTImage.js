import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class SetGTImage extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, imageUrl } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpGT = await user.checkGTId(id, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 设置image
    await tmpGT.update(
      {
        imageUrl,
      },
      { transaction },
    );
    // end 设置image
  }
}
