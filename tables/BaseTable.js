import debug from 'debug';
import moment from 'moment';

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

  checkDeleteRight() {
    throw new Error('checkDeleteRight should be overrided.');
  }

  checkEditRight() {
    throw new Error('checkEditRight should be overrided.');
  }

  checkListRight() {
    throw new Error('checkListRight should be overrided.');
  }

  checkDisableRight() {
    throw new Error('checkDisableRight should be overrided.');
  }

  checkEnableRight() {
    throw new Error('checkEnableRight should be overrided.');
  }

  checkFindOneRight() {
    throw new Error('checkFindOneRight should be overrided.');
  }

  async checkUserAccess() {
    throw new Error('checkUserAccess should be overrided.');
  }

  getLikeSearchFields() {
    throw new Error('getLikeSearchFields should be overrided.');
  }

  async getQueryOption() {
    throw new Error('getQueryOption should be overrided.');
  }

  filterEditFields(fields) {
    // 默认不过滤, 如需过滤可以override这个方法
    const filteredFields = {
      ...fields,
    };
    return filteredFields;
  }

  async create(fields) {
    this.checkCreateRight();

    const newRecord = await this.getTable().build(fields);

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

  async edit(id, fields) {
    // todo: 考虑用乐观锁
    this.checkEditRight();

    const record = await this.getTable().findOne({ where: { id } });

    // 查看update前是否在用户权限范围
    await this.checkUserAccess(record);
    // end 查看update前是否在用户权限范围

    const filteredFields = this.filterEditFields(fields);

    const r = await record.update(filteredFields);

    // 查看update后是否在用户权限范围
    await this.checkUserAccess(r);
    // end 查看update后是否在用户权限范围

    if (!r) {
      throw new Error('更新记录失败!');
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async getList(queryObj) {
    this.checkListRight();

    const curPage = parseInt(queryObj.curPage) || 0;
    const perPage = parseInt(queryObj.perPage) || 10;
    const { keyword } = queryObj;

    const option = await this.getQueryOption(keyword);

    option.limit = perPage;
    option.offset = perPage * curPage;

    const r = await this.getTable().findAndCountAll(option);
    return {
      code: 1,
      data: r.rows.map(item => item.toJSON()),
      total: r.count,
    };
  }

  async disable(id) {
    // todo: 考虑用乐观锁
    this.checkDisableRight();

    const record = await this.getTable().findOne({ where: { id, disabledAt: null } });

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看disable前是否在用户权限范围
    await this.checkUserAccess(record);
    // end 查看disable前是否在用户权限范围

    const r = await record.update({
      disabledAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    });

    if (!r[0]) {
      throw new Error('更新记录失败!');
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async enable(id) {
    // todo: 考虑用乐观锁
    this.checkEnableRight();

    const record = await this.getTable().findOne({ where: { id, disabledAt: { $ne: null } } });

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看enable前是否在用户权限范围
    await this.checkUserAccess(record);
    // end 查看enable前是否在用户权限范围

    const r = await record.update({
      disabledAt: null,
    });

    if (!r[0]) {
      throw new Error('更新记录失败!');
    }

    return {
      code: 1,
      data: 'ok',
    };
  }

  async findOne(id) {
    this.checkFindOneRight();

    const record = await this.getTable().findOne({ where: { id } });

    if (!record) {
      throw new Error('没有找到对应记录!');
    }

    // 查看否在用户权限范围
    await this.checkUserAccess(record);

    return {
      code: 1,
      data: record.toJSON(),
    };
  }
}
