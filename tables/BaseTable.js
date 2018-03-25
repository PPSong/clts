import debug from 'debug';

const ppLog = debug('ppLog');

export default class BaseTable {
  constructor(user) {
    this.user = user;
  }

  getTable() {
    throw new Error('getTable should be overrided.');
  }

  checkCreateRight() {
    throw new Error('checkCreateRight should be overrided.');
  }

  checkEditRight() {
    throw new Error('checkEditRight should be overrided.');
  }

  checkDeleteRight() {
    throw new Error('checkDeleteRight should be overrided.');
  }

  checkRestoreRight() {
    throw new Error('checkRestoreRight should be overrided.');
  }

  checkSearchRight() {
    throw new Error('checkDeleteRight should be overrided.');
  }

  filterFields(fields) {
    const filteredFields = {
      ...fields,
    };
    // 防止指定id
    delete filteredFields.id;
    return filteredFields;
  }

  getQueryOption() {
    throw new Error('getQueryOption should be overrided.');
  }

  async create(fields) {
    this.checkCreateRight();

    const filteredFields = this.filterCreateFields(fields);

    const r = await this.getTable().create(filteredFields);

    if (!r) {
      throw new Error('创建失败!');
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async delete(id) {
    this.checkDeleteRight();

    const r = await this.getTable().destroy({
      where: {
        id,
      },
    });

    if (!r) {
      return {
        code: 0,
        msg: '此记录已删除!',
      };
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async restore(id) {
    this.checkRestoreRight();

    const r = await this.getTable().findOne({ where: { id }, paranoid: false });
    if (r && r.deletedAt) {
      r.setDataValue('deletedAt', null);
      await r.save();

      return {
        code: 1,
        msg: 'ok',
      };
    }

    return {
      code: -1,
      data: '没找到需要恢复的记录!',
    };
  }

  async edit(id, fields) {
    // todo: 考虑用乐观锁
    this.checkEditRight();

    const filteredFields = this.filterFields(fields);
    const option = await this.getQueryOption(null, id);
    const r = await this.getTable().update(filteredFields, option);

    ppLog(r);

    if (!r[0]) {
      throw new Error('更新记录失败!');
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async findOne(id) {
    this.checkSearchRight();

    const option = await this.getQueryOption(null, id);
    const r = await this.getTable().findOne(option);

    if (!r) {
      throw new Error('无此记录!');
    }

    return {
      code: 1,
      data: r.toJSON(),
    };
  }

  async getList(queryObj) {
    this.checkSearchRight();

    const curPage = parseInt(queryObj.curPage) || 0;
    const perPage = parseInt(queryObj.perPage) || 10;
    const { keyword } = queryObj;

    const option = await this.getQueryOption(keyword);

    option.limit = perPage;
    option.offset = perPage * curPage;

    ppLog(option);

    const r = await this.getTable().findAndCountAll(option);
    return {
      code: 1,
      data: r.rows.map(item => item.toJSON()),
      total: r.count,
    };
  }
}
