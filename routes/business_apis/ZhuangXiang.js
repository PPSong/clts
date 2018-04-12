import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ZhuangXiang extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // HWEWMs: [{ type: 'WL'/'DP'. typeId: 15, uuid: '123456'}]
    // KDXEWM: { type: 'KDX', uuid: '123456'}
    const {
      DDId, GTId, HWEWMs, KDXEWM,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 检查KDXEWM是否是KDX
    if (KDXEWM.type !== DBTables.EWMType.KDX) {
      throw new Error('快递箱二维码不正确!');
    }
    // end 检查KDXEWM是否是KDX

    // 检查二维码是否都属于WL或DP
    const tmpTypes = HWEWMs.map(item => item.type);
    const tmpUniqueType = [...new Set(tmpTypes)];
    if (
      !(
        tmpUniqueType.length === 1 &&
        (tmpUniqueType[0] === DBTables.EWMType.WL || tmpUniqueType[0] === DBTables.EWMType.DP)
      )
    ) {
      throw new Error('二维码组必须同属于物料或灯片!');
    }

    const tmpType = tmpUniqueType[0];
    // end 检查二维码是否都属于WL或DP

    let tmpTargetGYSIds;
    // 判断HWEWMs属于同一个DD_GT
    if (tmpType === DBTables.EWMType.WL) {
      tmpTargetGYSIds = await this.checkWLEWMSIsSameDDGTAndGetGYSIds(
        DDId,
        GTId,
        HWEWMs,
        transaction,
      );
    } else {
      tmpTargetGYSIds = await this.checkDPEWMSIsSameDDGTAndGetGYSIds(
        DDId,
        GTId,
        HWEWMs,
        transaction,
      );
    }
    // end 判断HWEWMs属于同一个DD_GT

    // 检查ZHY是否有权限装箱这个货物
    const tmpUniqueGYSIdArr = [...new Set(tmpTargetGYSIds)];

    if (tmpUniqueGYSIdArr.length !== 1) {
      throw new Error('二维码组必须同属于同一个发货供应商!');
    }
    const tmpGYSId = tmpUniqueGYSIdArr[0];

    const tmpGYS = await user.checkGYSId(tmpGYSId, transaction);
    // end 检查ZHY是否有权限装箱这个货物

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建相关记录
    // 如需新建KDX则新建, 并新建相关KDXCZ
    const KDXEWMString = JSON.stringify(KDXEWM);
    let tmpKDX = await DBTables.KDX.findOne({
      where: {
        EWM: KDXEWMString,
      },
      transaction,
    });

    if (tmpKDX) {
      // KDX已存在
      if (tmpKDX.GTId !== GTId) {
        // 检查已有KDX所属GT
        throw new Error(`快递箱:${tmpKDX}不属于这个柜台!`);
      }

      if (tmpKDX.status !== DBTables.KDXStatus.ZX) {
        // 检查已有KDX当前状态
        throw new Error(`快递箱:${tmpKDX}状态为:${tmpKDX.status}, 不能装箱!`);
      }
    } else {
      // KDX不存在
      tmpKDX = await DBTables.KDX.create(
        {
          EWM: KDXEWMString,
          GTId,
          status: DBTables.KDXStatus.ZX,
        },
        {
          transaction,
        },
      );
    }

    // 新建相关KDXCZ
    await DBTables.KDXCZ.create(
      {
        KDXId: tmpKDX.id,
        status: DBTables.KDXStatus.ZX,
        UserId: user.id,
      },
      { transaction },
    );
    // end 新建相关KDXCZ

    // end 如需新建KDX则新建, 并新建相关KDXCZ

    for (let i = 0; i < HWEWMs.length; i++) {
      if (tmpType === DBTables.EWMType.WL) {
        // WL
        const tmpDDGTWL = await DBTables.DD_GT_WL.findOne({
          where: {
            DDId,
            GTId,
            WLId: HWEWMs[i].typeId,
          },
          transaction,
        });
        if (tmpDDGTWL.ZXNumber === tmpDDGTWL.number) {
          // 如果预订数额已满则报错
          throw new Error(`${HWEWMs[i]}数额已满!`);
        }
        await this.zhuangXiangWLEWM(tmpDDGTWL, HWEWMs[i], tmpGYS.id, tmpKDX.id, user, transaction);
        await DBTables.sequelize.query(
          'UPDATE DD_GT_WL SET ZXNumber = IFNULL(ZXNumber, 0) + 1 WHERE id = :id',
          {
            transaction,
            replacements: { id: tmpDDGTWL.id },
            raw: true,
            type: 'UPDATE',
          },
        );
      } else {
        // DP
        const tmpDDDWDP = await DBTables.DD_DW_DP.findOne({
          where: {
            DDId,
            DPId: HWEWMs[i].typeId,
            ZXNumber: null,
          },
          include: [
            {
              model: DBTables.DW,
              as: 'DW',
              where: {
                GTId,
              },
            },
          ],
          transaction,
        });
        if (!tmpDDDWDP) {
          // 如果预订数额已满则报错
          throw new Error(`${HWEWMs[i]}数额已满!`);
        }
        await this.zhuangXiangDPEWM(tmpDDDWDP, HWEWMs[i], tmpGYS.id, tmpKDX.id, user, transaction);
        await DBTables.sequelize.query('UPDATE DD_DW_DP SET ZXNumber = 1 WHERE ID = :id', {
          transaction,
          replacements: { id: tmpDDDWDP.id },
          raw: true,
          type: 'UPDATE',
        });
      }
    }
    // end 新建相关记录
  }

  static async zhuangXiangWLEWM(DDGTWL, WYWLEWM, GYSId, KDXId, user, transaction) {
    const WYWLEWMString = JSON.stringify(WYWLEWM);
    let tmpWYWL = await DBTables.WYWL.findOne({
      where: {
        EWM: WYWLEWMString,
      },
      transaction,
    });

    if (tmpWYWL) {
      // WYWL存在
      if (tmpWYWL.status !== DBTables.WYWLStatus.RK) {
        // 如果不属于RK状态报错
        throw new Error(`${WYWLEWM}状态为:${tmpWYWL.status}, 不可装箱!`);
      }

      if (tmpWYWL.GYSId !== GYSId) {
        // 发货供应商不正确
        throw new Error(`${WYWLEWM}发货供应商为:${tmpWYWL.GYSId}, 不可装箱!`);
      }

      // 设置状态, 绑定KDXId
      await tmpWYWL.update(
        {
          status: DBTables.WYWLStatus.ZX,
          DDGTWLId: DDGTWL.id,
          KDXId,
        },
        {
          transaction,
        },
      );
    } else {
      // WYWL不存在就新建
      tmpWYWL = await DBTables.WYWL.create(
        {
          EWM: WYWLEWMString,
          status: DBTables.WYWLStatus.ZX,
          WLId: WYWLEWM.typeId,
          GYSId,
          DDGTWLId: DDGTWL.id,
          KDXId,
        },
        {
          transaction,
        },
      );
    }

    // 新建相关WYWLCZ
    await DBTables.WYWLCZ.create(
      {
        WYWLId: tmpWYWL.id,
        status: DBTables.WYWLStatus.ZX,
        UserId: user.id,
      },
      {
        transaction,
      },
    );
    // end 新建相关WYWLCZ
  }

  static async zhuangXiangDPEWM(DDDWDP, WYDPEWM, GYSId, KDXId, user, transaction) {
    const WYDPEWMString = JSON.stringify(WYDPEWM);
    let tmpWYDP = await DBTables.WYDP.findOne({
      where: {
        EWM: WYDPEWMString,
      },
      transaction,
    });

    if (tmpWYDP) {
      // WYDP存在
      if (tmpWYDP.status !== DBTables.WYDPStatus.RK) {
        // 如果不属于RK状态报错
        throw new Error(`${WYDPEWM}状态为:${tmpWYDP.status}, 不可装箱!`);
      }

      if (tmpWYDP.GYSId !== GYSId) {
        // 发货供应商不正确
        throw new Error(`${WYDPEWM}发货供应商为:${tmpWYDP.GYSId}, 不可装箱!`);
      }

      // 设置状态, 绑定KDXId
      await tmpWYDP.update(
        {
          status: DBTables.WYDPStatus.ZX,
          DDGTWLId: DDDWDP.id,
          KDXId,
        },
        {
          transaction,
        },
      );
    } else {
      // WYDP不存在就新建
      tmpWYDP = await DBTables.WYDP.create(
        {
          EWM: WYDPEWMString,
          status: DBTables.WYWLStatus.ZX,
          DPId: WYDPEWM.typeId,
          GYSId,
          DDDWDPId: DDDWDP.id,
          KDXId,
        },
        {
          transaction,
        },
      );
    }

    // 新建相关WYDPCZ
    await DBTables.WYDPCZ.create(
      {
        WYDPId: tmpWYDP.id,
        status: DBTables.WYDPStatus.ZX,
        UserId: user.id,
      },
      {
        transaction,
      },
    );
    // end 新建相关WYDPCZ
  }

  static async checkWLEWMSIsSameDDGTAndGetGYSIds(DDId, GTId, HWEWMs, transaction) {
    const tmpWLIds = HWEWMs.map(item => item.typeId);

    const tmpTargetWLs = await DBTables.DD_GT_WL.findAll({
      where: {
        DDId,
        GTId,
      },
      transaction,
    });

    const tmpTargetWLIds = tmpTargetWLs.map(item => item.WLId);

    const diffWLIds = _.difference(tmpWLIds, tmpTargetWLIds);
    if (diffWLIds.length > 0) {
      throw new Error(`${diffWLIds}不属于目标柜台!`);
    }

    const tmpDDGTWLs = await DBTables.DD_GT_WL.findAll({
      where: {
        DDId,
        GTId,
        WLId: {
          $in: tmpWLIds,
        },
      },
      transaction,
    });

    const tmpDDGTWLGYSIds = tmpDDGTWLs.map(item => item.GYSId);

    return tmpDDGTWLGYSIds;
  }

  static async checkDPEWMSIsSameDDGTAndGetGYSIds(DDId, GTId, HWEWMs, transaction) {
    const tmpDPIds = HWEWMs.map(item => item.typeId);

    const tmpTargetDPs = await DBTables.DD_DW_DP.findAll({
      where: {
        DDId,
      },
      include: [
        {
          model: DBTables.DW,
          as: 'DW',
          where: {
            GTId,
          },
        },
      ],
      transaction,
    });
    const tmpTargetDPIds = tmpTargetDPs.map(item => item.DPId);

    const diffDPIds = _.difference(tmpDPIds, tmpTargetDPIds);
    if (diffDPIds.length > 0) {
      throw new Error(`${diffDPIds}不属于目标柜台!`);
    }

    const tmpDDDWDPs = await DBTables.DD_DW_DP.findAll({
      where: {
        DDId,
        DPId: {
          $in: tmpDPIds,
        },
      },
      include: [
        {
          model: DBTables.DW,
          as: 'DW',
          where: {
            GTId,
          },
        },
      ],
      transaction,
    });
    const tmpDDDWDPGYSIds = tmpDDDWDPs.map(item => item.GYSId);

    return tmpDDDWDPGYSIds;
  }
}
