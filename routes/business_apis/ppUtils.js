import _ from 'lodash';
import * as DBTables from '../../models/Model';

export async function checkEWMsExistanceAndGetRecords(tableName, EWMs, transaction) {
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

export async function checkRecordsStatus(
  records,
  targetStatus,
  errorMsg = '操作不能继续',
  transaction,
) {
  const tmpFailedStatusRecords = records.filter(item => item.status !== targetStatus);

  // todo: arr toString()
  if (tmpFailedStatusRecords.length > 0) {
    throw new Error(`${tmpFailedStatusRecords}不在${targetStatus}状态, ${errorMsg}!`);
  }
}

export async function checkSameGTAndGetGTId(
  records,
  errorMsg = '记录不属于同一个柜台, 操作不能继续',
  transaction,
) {
  const tmpGTs = records.map(item => item.GTId);
  const tmpUniqueGTs = [...new Set(tmpGTs)];
  if (tmpUniqueGTs.length !== 1) {
    throw new Error(`${errorMsg}!`);
  }

  return tmpUniqueGTs[0];
}

export async function changeWYWLsInKDXsStatus(KDXEWMs, status, user, transaction) {
  const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));
  // 对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败
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
        b.EWM in (:KDXEWMs)
      WHERE
        a.AZFKType IS NULL;
    `;
  // end 对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败
  const tmpWYWLCZSqlR = await DBTables.sequelize.query(tmpWYWLSql, {
    transaction,
    replacements: { KDXEWMs: KDXEWMStrings },
  });
  const tmpWYWLIds = tmpWYWLCZSqlR[0].map(item => item.id);

  // 更改相关WYWL状态为FH, 新建相关WYWLCZ
  await changeWYWLsStatus(tmpWYWLIds, status, user, transaction);
  // end 更改相关WYWL状态为FH, 新建相关WYWLCZ
}

export async function changeWYDPsInKDXsStatus(KDXEWMs, status, user, transaction) {
  const KDXEWMStrings = KDXEWMs.map(item => JSON.stringify(item));
  // 对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败
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
        b.EWM in (:KDXEWMs)
      WHERE
        a.AZFKType IS NULL;
    `;
  // end 对于已经有AZFKType的记录不用处理, 有可能在这一步之前WYWL/WYDP已被反馈失败
  const tmpWYDPCZSqlR = await DBTables.sequelize.query(tmpWYDPSql, {
    transaction,
    replacements: { KDXEWMs: KDXEWMStrings },
  });
  const tmpWYDPIds = tmpWYDPCZSqlR[0].map(item => item.id);

  // 更改相关WYWL状态为FH, 新建相关WYWLCZ
  await changeWYDPsStatus(tmpWYDPIds, status, user, transaction);
  // end 更改相关WYWL状态为FH, 新建相关WYWLCZ
}

export async function changeWYWLsStatus(
  ids,
  status,
  user,
  transaction,
  AZFK = null,
  imageUrl = null,
) {
  let updateObj = {
    status,
  };
  if (AZFK) {
    updateObj = {
      ...updateObj,
      AZFK,
    };
  }
  if (imageUrl) {
    updateObj = {
      ...updateObj,
      imageUrl,
    };
  }

  await DBTables.WYWL.update(updateObj, {
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });

  // 新建相关WYWLCZ
  const tmpWYWLCZs = ids.map(item => ({
    WYWLId: item,
    status,
    UserId: user.id,
  }));
  await DBTables.WYWLCZ.bulkCreate(tmpWYWLCZs, {
    transaction,
  });
  // end 新建相关WYWLCZ
}

export async function changeWYDPsStatus(
  ids,
  status,
  user,
  transaction,
  AZFK = null,
  imageUrl = null,
) {
  let updateObj = {
    status,
  };
  if (AZFK) {
    updateObj = {
      ...updateObj,
      AZFK,
    };
  }
  if (imageUrl) {
    updateObj = {
      ...updateObj,
      imageUrl,
    };
  }
  await DBTables.WYDP.update(updateObj, {
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });
  // end 更改相关WYDP状态为FH

  // 新建相关WYDPCZ
  const tmpWYDPCZs = ids.map(item => ({
    WYDPId: item,
    status,
    UserId: user.id,
  }));
  await DBTables.WYDPCZ.bulkCreate(tmpWYDPCZs, {
    transaction,
  });
  // end 新建相关WYDPCZ
}

export function checkSameEWMTypeAndGetTheType(EWMs) {
  const tmpTypes = EWMs.map(item => item.type);
  const tmpUniqueTypes = [...new Set(tmpTypes)];

  if (tmpUniqueTypes.length === 1) {
    return tmpUniqueTypes[0];
  }

  return false;
}
