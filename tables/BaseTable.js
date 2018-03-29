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

  async checkUserAccess() {
    throw new Error('checkUserAccess should be overrided.');
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

    const filteredFields = this.filterFields(fields);

    const newRecord = await this.getTable().build(filteredFields);

    await this.checkUserAccess(newRecord);

    const r = await newRecord.save();

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

    const record = await this.getTable().findOne({
      where: {
        id,
      },
    });

    await this.checkUserAccess(record);

    const r = await record.destroy();

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

    const record = await this.getTable().findOne({ where: { id }, paranoid: false });

    await this.checkUserAccess(record);

    if (record && record.deletedAt) {
      record.setDataValue('deletedAt', null);
      await record.save();

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

    const record = await this.getTable().findOne({ where: { id }, paranoid: false });

    // 查看update前是否在用户权限范围
    await this.checkUserAccess(record);

    const r = await record.update(filteredFields);

    // 查看update后是否在用户权限范围
    // todo: check r还是record是更新后的值
    await this.checkUserAccess(record);

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

    const record = await this.getTable().findOne({ where: { id }, paranoid: false });

    // 查看update前是否在用户权限范围
    await this.checkUserAccess(record);

    return {
      code: 1,
      data: record.toJSON(),
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
