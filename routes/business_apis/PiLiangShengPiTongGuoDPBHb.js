import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';
import * as ppUtils from './ppUtils';

export default class PiLiangShengPiTongGuoDPBHb extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { ids } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查DPBH的ids存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致
    for (let i = 0; i < ids.length; i++) {
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
          id: ids[i],
        },
        transaction,
      });

      if (!tmpDPBH) {
        throw new Error(`灯片补货记录id:${ids[i]}不存在!`);
      }

      await user.checkPPId(tmpDPBH.DW.GT.PPId, transaction);

      if (tmpDPBH.status !== DBTables.DPBHStatus.KFJLSPTG) {
        throw new Error(`灯片补货记录:${tmpDPBH}状态不属于${DBTables.DPBHStatus.KFJLSPTG}!`);
      }
    }
    // 检查DPBH的ids存在, 且状态属于KFJLSPTG, 且所属PPId和操作者一致

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    ppUtils.changeDPBHsStatus(ids, DBTables.DPBHStatus.TG, user, transaction);
  }
}
