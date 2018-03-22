import express from 'express';
import debug from 'debug';

/* eslint-disable */
import * as tables from '../tables';
/* eslint-enable */
import { PP, Op } from '../models/Model';

const ppLog = debug('ppLog');

const router = express.Router();

router.get('/:table', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).getList(req.query);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.get('/:table/:id', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).findOne(req.params.id);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

router.put('/:table/:id', async (req, res, next) => {
  try {
    const Table = tables[`${req.params.table}Table`];
    const r = await new Table(req.user).edit(req.params.id, req.body);
    res.json(r);
  } catch (err) {
    ppLog(err);
    next(err);
  }
});

export default router;
