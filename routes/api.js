import express from 'express';
import bCrypt from 'bcryptjs';
import debug from 'debug';
import _ from 'lodash';
import Ajv from 'ajv';
import { apiSchema } from './apiSchema';
import { errorResponse } from '../routes/business_apis/ppUtils';

/* eslint-disable */
import * as tables from '../tables';
import * as businessApis from './business_apis';
/* eslint-enable */
import { sequelize } from '../models/Model';

const router = express.Router();

// const ppLog = debug('ppLog');
const ppLog = (obj) => {
  console.log('ppLog', obj); 
};

export const ajv = Ajv({ allErrors: true });

function validateParams(schema) {
  return function (req, res, next) {
    if (!ajv.validate(schema, req.body)) {
      throw new Error(errorResponse(ajv.errors));
    }

    next(); 
  }; 
}

function upperCaseHead(str) {
  return str[0].toUpperCase() + str.slice(1);
}

for (const key in apiSchema) {
  let name = upperCaseHead(key);
  // console.log('ppt', key, name);
  router.post(
    `/${key}`,
    validateParams(apiSchema[key]),
    businessApis[name].getApi()
  );
}

// 常规RESTFUL API
router.post('/:table', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).create(req.body, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.get('/:table', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).getList(req.query, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.get('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).findOne(req.params.id, transaction);
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.put('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).edit(
      req.params.id,
      req.body,
      transaction,
    );
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.post('/disable/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).disable(
      req.params.id,
      transaction,
    );
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.post('/enable/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).enable(
      req.params.id,
      transaction,
    );
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

router.delete('/:table/:id', async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).delete(
      req.params.id,
      req.body,
      transaction,
    );
    await transaction.commit();
    res.json(r);
  } catch (err) {
    // Rollback
    await (transaction && transaction.rollback());
    ppLog(err);
    next(err);
  }
});

export default router;
