import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

async function checkEWMsExistanceAndGetRecords(tableName, EWMs, transaction) {
  const EWMStrings = EWMs.map(item => JSON.stringify(item));
  const tmpRecords = await DBTables[tableName].findAll({
    where: {
      EWM: {
        $in: EWMStrings,
      },
    },
    transaction,
  });
  const tmpEWMStrings = tmpRecords.map(item => item.EWM);
  const diffEWMs = _.difference(EWMStrings, tmpEWMStrings);
  if (diffEWMs.length > 0) {
    throw new Error(`${diffEWMs}不存在!`);
  }

  return tmpRecords;
}

export default class GuanLiangKuaiDi extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.ZHY];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // KDXEWM: [{ type: 'KDX', uuid: '123456'}]
    const { KDXEWMs, KDDCode } = req.body;
    const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    // const tmpKDXs = await DBTables.KDX.findAll({
    //   where: {
    //     EWM: {
    //       $in: KDXEWMStrings,
    //     },
    //   },
    //   transaction,
    // });

    // // 检查KDXEWMs都是存在的
    // const tmpKDXEWMStrings = tmpKDXs.map(item => item.EWM);
    // const diffEWMs = _.difference(KDXEWMStrings, tmpKDXEWMStrings);
    // if (diffEWMs.length > 0) {
    //   throw new Error(`${diffEWMs}不存在!`);
    // }
    // // end 检查KDXEWMs都是存在的

    const tmpKDXs = await checkEWMsExistanceAndGetRecords('KDX', KDXEWMs, transaction);

    // 检查KDXEWMs是属于ZX状态, 而且属于同一个GT
    const tmpFailedStatusKDXs = tmpKDXs.filter(item => item.status !== DBTables.ZX);

    if (tmpFailedStatusKDXs.length > 0) {
      const tmpFailedKDXEWMs = tmpFailedStatusKDXs.map(item => item.EWM);
      throw new Error(`${tmpFailedKDXEWMs}不在${DBTables.KDXStatus.ZX}状态不能绑定快递!`);
    }

    const tmpKDXGTs = tmpKDXs.map(item => item.GTId);
    const tmpUniqueKDXGTs = [...new Set(tmpKDXGTs)];
    if (tmpUniqueKDXGTs.length !== 1) {
      throw new Error('同一个快递单号的快递箱必须发往同一柜台');
    }
    // end 检查KDXEWMs是属于ZX状态, 而且属于同一个GT

    // 不用检查ZHY是否有权限快递这个KDX, 谁都可以快递

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 新建相关记录

    // 如需新建KDD则新建
    const tmpKDDR = await DBTables.KDD.findOrCreate({
      where: {
        code: KDDCode,
      },
      defaults: {
        code: KDDCode,
      },
      transaction,
    });
    // end 如需新建KDD则新建
    const tmpKDD = tmpKDDR[0];

    // KDXEWMs绑上KDDId, 转为状态FH
    await DBTables.KDX.update(
      {
        status: DBTables.KDXStatus.FH,
        KDDId: tmpKDD.id,
      },
      {
        where: {
          EWM: {
            $in: KDXEWMs.map(item => JSON.stringify(item)),
          },
        },
        transaction,
      },
    );
    // end KDXEWMs绑上KDDId, 转为状态FH

    // 新建相关KDXCZ
    const tmpKDXCZs = tmpKDXs.map(item => ({
      KDXId: item.id,
      status: DBTables.KDXStatus.FH,
      UserId: user.id,
    }));
    await DBTables.KDXCZ.bulkCreate(tmpKDXCZs, {
      transaction,
    });
    // end 新建相关KDXCZ

    const tmpWYWLSql = `
    SELECT
      a.id id
    FROM
      WYWL a
    JOIN
      KDX b
    ON
      a.KDXId = b.id
    AND
      b.EWM in (:KDXEWMs);
  `;
    const tmpWYWLCZSqlR = await DBTables.sequelize.query(tmpWYWLSql, {
      transaction,
      replacements: { KDXEWMs: tmpKDXEWMStrings },
    });
    const tmpWYWLIds = tmpWYWLCZSqlR[0];

    // 更改相关WYWL状态为FH
    await DBTables.WYWL.update(
      {
        status: DBTables.WYWLStatus.FH,
      },
      {
        where: {
          id: {
            $in: tmpWYWLIds.map(item => item.id),
          },
        },
        transaction,
      },
    );
    // end 更改相关WYWL状态为FH

    // 新建相关WYWLCZ
    const tmpWYWLCZs = tmpWYWLIds.map(item => ({
      WYWLId: item.id,
      status: DBTables.WYWLStatus.FH,
      UserId: user.id,
    }));
    await DBTables.WYWLCZ.bulkCreate(tmpWYWLCZs, {
      transaction,
    });
    // end 新建相关WYWLCZ

    const tmpWYDPSql = `
    SELECT
      a.id
    FROM
      WYDP a
    JOIN
      KDX b
    ON
      a.KDXId = b.id
    AND
      b.EWM in (:KDXEWMs);
  `;
    const tmpWYDPCZSqlR = await DBTables.sequelize.query(tmpWYDPSql, {
      transaction,
      replacements: { KDXEWMs: tmpKDXEWMStrings },
    });
    const tmpWYDPIds = tmpWYDPCZSqlR[0];

    // 更改相关WYDP状态为FH
    await DBTables.WYDP.update(
      {
        status: DBTables.WYDPStatus.FH,
      },
      {
        where: {
          id: {
            $in: tmpWYDPIds.map(item => item.id),
          },
        },
        transaction,
      },
    );
    // end 更改相关WYDP状态为FH

    // 新建相关WYDPCZ
    const tmpWYDPCZs = tmpWYDPIds.map(item => ({
      WYDPId: item.id,
      status: DBTables.WYDPStatus.FH,
      UserId: user.id,
    }));
    await DBTables.WYDPCZ.bulkCreate(tmpWYDPCZs, {
      transaction,
    });
    // end 新建相关WYDPCZ

    // end 新建相关记录
  }
}
