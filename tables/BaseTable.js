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

  checkSearchRight() {
    // 默认可以被任何登录用户查询
  }

  getCreateFields() {
    // 默认可以创建所有列
    return 'ALL';
  }

  filterCreateFields(createFields) {
    if (this.getCreateFields === 'ALL') {
      const filteredCreateFields = {
        ...createFields,
      };
      delete filteredCreateFields.id;
      return filteredCreateFields;
    }

    const filteredCreateFields = {};

    this.getCreateFields().forEach((item) => {
      filteredCreateFields[item] = createFields[item];
    });

    return filteredCreateFields;
  }

  getEditFields() {
    // 默认可以编辑所有列, 除了id
    return 'ALL';
  }

  filterEditFields(editFields) {
    if (this.getEditFields === 'ALL') {
      const filteredEditFields = {
        ...editFields,
      };
      delete filteredEditFields.id;
      return filteredEditFields;
    }

    const filteredEditFields = {};

    this.getEditFields().forEach((item) => {
      filteredEditFields[item] = editFields[item];
    });

    return filteredEditFields;
  }

  getEditShowFields() {
    // 默认编辑时可以显示所有列
    return 'ALL';
  }

  getListField() {
    // 默认list所有列
    return 'ALL';
  }

  getListDetailField() {
    // 默认list所有列
    return 'ALL';
  }

  getQueryOption() {
    throw new Error('getQueryOption should be overrided.');
  }

  async create(createFields) {
    this.checkCreateRight();

    const filteredCreateFields = this.filterCreateFields(createFields);

    const r = await this.getTable().create(filteredCreateFields);

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

  async edit(id, editFields) {
    this.checkEditRight();

    const r = await this.getTable().findOne({
      where: {
        id,
      },
    });

    const filteredEditFields = this.filterEditFields(editFields);

    if (!r) {
      throw new Error('无此记录!');
    }

    this.getEditableFields(r).forEach((f) => {
      r[f] = filteredEditFields[f];
    });

    await r.save();
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
