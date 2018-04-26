import _ from 'lodash';
import * as DBTables from '../../models/Model';

export async function createDDKDXAndZhuangXiang({
  EWM,
  GTId,
  HWType,
  user,
  transaction,
  DDId = null,
  YJZXTime = null,
}) {
  // EWM: { type: 'KDX'. typeId: 15, uuid: '123456'}

  // 新建KDX
  const tmpKDX = await DBTables.KDX.create(
    {
      EWM: JSON.stringify(EWM),
      GTId,
      status: DBTables.KDXStatus.ZX,
      DDId,
      YJZXTime,
      HWType,
    },
    { transaction },
  );
  // end 新建WYWL

  // 新建KDXCZ
  await DBTables.KDXCZ.create(
    {
      KDXId: tmpKDX.id,
      status: tmpKDX.status,
      UserId: user.id,
    },
    { transaction },
  );
  // end 新建KDXCZ
}

export async function createWYWLAndRuKu(EWM, user, GYSId, transaction) {
  // EWM: { type: 'WL'. typeId: 15, uuid: '123456'}

  // 新建WYWL
  const tmpWYWL = await DBTables.WYWL.create(
    {
      EWM: JSON.stringify(EWM),
      status: DBTables.WYWLStatus.RK,
      WLId: EWM.typeId,
      GYSId,
    },
    { transaction },
  );
  // end 新建WYWL

  // 新建WYWLCZ
  await DBTables.WYWLCZ.create(
    {
      WYWLId: tmpWYWL.id,
      status: tmpWYWL.status,
      UserId: user.id,
    },
    { transaction },
  );
  // end 新建WYWLCZ
}

export async function changeWYWLStatusOnGYS(
  tmpWYWL,
  status,
  user,
  GYSId,
  transaction,
) {
  // EWM: { type: 'WL'. typeId: 15, uuid: '123456'}

  // 修改状态
  await tmpWYWL.update(
    {
      status,
      GYSId,
    },
    { transaction },
  );
  // end 修改状态

  // 新建WYWLCZ
  await DBTables.WYWLCZ.create(
    {
      WYWLId: tmpWYWL.id,
      status,
      UserId: user.id,
    },
    { transaction },
  );
  // end 新建WYWLCZ
}

export async function createWYDPAndRuKu(EWM, user, GYSId, transaction) {
  // EWM: { type: 'DP'. typeId: 15, uuid: '123456'}

  // 新建WYDP
  const tmpWYDP = await DBTables.WYDP.create(
    {
      EWM: JSON.stringify(EWM),
      status: DBTables.WYDPStatus.RK,
      DPId: EWM.typeId,
      GYSId,
    },
    { transaction },
  );
  // end 新建WYDP

  // 新建WYDPCZ
  await DBTables.WYDPCZ.create(
    {
      WYDPId: tmpWYDP.id,
      status: tmpWYDP.status,
      UserId: user.id,
    },
    { transaction },
  );
  // end 新建WYDPCZ
}

export async function changeWYDPStatusOnGYS(
  tmpWYDP,
  status,
  user,
  GYSId,
  transaction,
) {
  // EWM: { type: 'DP'. typeId: 15, uuid: '123456'}

  // 修改状态
  await tmpWYDP.update(
    {
      status,
      GYSId,
    },
    { transaction },
  );
  // end 修改状态

  // 新建WYDPCZ
  await DBTables.WYDPCZ.create(
    {
      WYDPId: tmpWYDP.id,
      status,
      UserId: user.id,
    },
    { transaction },
  );
  // end 新建WYDPCZ
}

export async function changeWYWLsStatus({
  ids,
  status,
  user,
  transaction,
  GYSId = null,
  DDGTWLId = null,
  WLBHId = null,
  AZFKType = null,
  imageUrl = null,
}) {
  let updateObj = {
    status,
  };
  if (GYSId) {
    updateObj = {
      ...updateObj,
      GYSId,
    };
  }
  if (DDGTWLId) {
    updateObj = {
      ...updateObj,
      DDGTWLId,
    };
  }
  if (WLBHId) {
    updateObj = {
      ...updateObj,
      DDGTWLId,
    };
  }
  if (AZFKType) {
    updateObj = {
      ...updateObj,
      AZFKType,
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
  GYSId = null,
  DDDWDPId = null,
  AZFKType = null,
  imageUrl = null,
) {
  let updateObj = {
    status,
  };
  if (GYSId) {
    updateObj = {
      ...updateObj,
      GYSId,
    };
  }
  if (DDDWDPId) {
    updateObj = {
      ...updateObj,
      DDDWDPId,
    };
  }
  if (AZFKType) {
    updateObj = {
      ...updateObj,
      AZFKType,
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

export async function checkEWMsExistanceAndGetRecords(
  tableName,
  EWMs,
  transaction,
) {
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

export async function checkIdsExistanceAndGetRecords(
  tableName,
  ids,
  transaction,
) {
  const tmpRecords = await DBTables[tableName].findAll({
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });
  const tmpIds = tmpRecords.map(item => item.id);
  const diffIds = _.difference(ids, tmpIds);
  if (diffIds.length > 0) {
    throw new Error(`${diffIds}不存在!`);
  }

  return tmpRecords;
}

export async function changeWYWLsInKDXsStatus(
  KDXEWMs,
  status,
  user,
  transaction,
) {
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

export async function changeWYDPsInKDXsStatus(
  KDXEWMs,
  status,
  user,
  transaction,
) {
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

export async function changeKDXsStatus({
  ids,
  status,
  user,
  transaction,
  KDDId = null,
}) {
  let updateObj = {
    status,
  };
  if (KDDId) {
    updateObj = {
      ...updateObj,
      KDDId,
    };
  }

  await DBTables.KDX.update(updateObj, {
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });

  // 新建相关KDXCZ
  const tmpKDXCZs = ids.map(item => ({
    KDXId: item,
    status,
    UserId: user.id,
  }));
  await DBTables.KDXCZ.bulkCreate(tmpKDXCZs, {
    transaction,
  });
  // end 新建相关KDXCZ
}

export async function createWLBH(
  GTId,
  WLId,
  imageUrl,
  note,
  user,
  transaction,
  DDId = null,
) {
  const tmpWLBH = await DBTables.WLBH.create(
    {
      GTId,
      WLId,
      imageUrl,
      note,
      DDId,
      status: DBTables.WLBHStatus.CS,
      ZXNumber: 0,
    },
    { transaction },
  );

  // 新建相关WLBHCZ
  await DBTables.WLBHCZ.create(
    {
      WLBHId: tmpWLBH.id,
      status: tmpWLBH.status,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关WLBHCZ
}

export async function changeWLBHsStatus(
  ids,
  status,
  user,
  transaction,
  KFJLNote = null,
  PPJLNote = null,
) {
  let updateObj = {
    status,
  };
  if (KFJLNote) {
    updateObj = {
      ...updateObj,
      KFJLNote,
    };
  }
  if (PPJLNote) {
    updateObj = {
      ...updateObj,
      PPJLNote,
    };
  }
  await DBTables.WLBH.update(updateObj, {
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });

  // 新建相关WLBHCZ
  const tmpWLBHCZs = ids.map(item => ({
    WLBHId: item,
    status,
    UserId: user.id,
  }));
  await DBTables.WLBHCZ.bulkCreate(tmpWLBHCZs, {
    transaction,
  });
  // end 新建相关WLBHCZ
}


export async function createDPBH(
  DWId,
  DPId,
  imageUrl,
  note,
  user,
  transaction,
  DDId = null,
) {
  const tmpDPBH = await DBTables.DPBH.create(
    {
      DWId,
      DPId,
      imageUrl,
      note,
      DDId,
      status: DBTables.DPBHStatus.CS,
      ZXNumber: 0,
    },
    { transaction },
  );

  // 新建相关DPBHCZ
  await DBTables.DPBHCZ.create(
    {
      DPBHId: tmpDPBH.id,
      status: tmpDPBH.status,
      UserId: user.id,
    },
    {
      transaction,
    },
  );
  // end 新建相关DPBHCZ
}

export async function changeDPBHsStatus(
  ids,
  status,
  user,
  transaction,
  KFJLNote = null,
  PPJLNote = null,
) {
  let updateObj = {
    status,
  };
  if (KFJLNote) {
    updateObj = {
      ...updateObj,
      KFJLNote,
    };
  }
  if (PPJLNote) {
    updateObj = {
      ...updateObj,
      PPJLNote,
    };
  }
  await DBTables.DPBH.update(updateObj, {
    where: {
      id: {
        $in: ids,
      },
    },
    transaction,
  });

  // 新建相关DPBHCZ
  const tmpDPBHCZs = ids.map(item => ({
    DPBHId: item,
    status,
    UserId: user.id,
  }));
  await DBTables.DPBHCZ.bulkCreate(tmpDPBHCZs, {
    transaction,
  });
  // end 新建相关DPBHCZ
}
