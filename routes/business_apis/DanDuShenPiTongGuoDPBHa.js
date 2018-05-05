import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class DanDuShenPiTongGuoDPBHa extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { id, KFJLNote } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DPBH的id存在, 且状态属于CS, 且所属PPId和操作者一致
    const tmpDPBH = await DBTables.DPBH.findOne({
      include: [
        {
          model: DBTables.DW,
          as: 'DW',
          include: [
            {
              model: DBTables.GT,
              as: 'GT',
            },
          ],
        },
      ],
      where: {
        id,
      },
      transaction,
    });

    if (!tmpDPBH) {
      throw new Error(`灯片补货记录id:${id}不存在!`);
    }

    await user.checkPPId(tmpDPBH.DW.GT.PPId, transaction);

    if (tmpDPBH.status !== DBTables.DPBHStatus.CS) {
      throw new Error(`灯片补货记录:${tmpDPBH}状态不属于${DBTables.DPBHStatus.CS}!`);
    }
    // end 检查DPBH的id存在, 且状态属于CS, 且所属PPId和操作者一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    await ppUtils.changeDPBHsStatus(
      [id],
      DBTables.DPBHStatus.KFJLSPTG,
      user,
      transaction,
      KFJLNote,
    );
  }
}
