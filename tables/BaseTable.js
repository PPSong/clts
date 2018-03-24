export default class BaseTable {
  constructor(user) {
    this.user = user;
  }

  getTable() {
    throw new Error('getTable should be overrided.');
  }

  getEditableFields(r) {
    throw new Error('getEditableFields should be overrided.');
  }

  getDetailFields() {
    throw new Error('getDetailFields should be overrided.');
  }

  getQueryOption() {
    throw new Error('getQueryOption should be overrided.');
  }

  async edit(id, editFields) {
    const r = await this.getTable().findOne({
      where: {
        id,
      },
    });

    if (r) {
      this.getEditableFields(r).forEach((f) => {
        r[f] = editFields[f];
      });

      await r.save();
      return {
        code: 1,
        data: r.toJSON(),
      };
    }
    return {
      code: 0,
      msg: '无此记录!',
    };
  }

  async findOne(id) {
    const r = await this.getTable().findOne({
      where: {
        id,
      },
    });

    if (r) {
      return {
        code: 1,
        data: r.toJSON(),
      };
    }
    return {
      code: 0,
      msg: '无此记录!',
    };
  }

  async getList(queryObj) {
    const curPage = parseInt(queryObj.curPage) || 0;
    const perPage = parseInt(queryObj.perPage) || 10;
    const { keyword } = queryObj;

    const option = this.getQueryOption(keyword);
    if (!option) {
      throw new Error('无此权限!');
    }
    option.limit = perPage;
    option.offset = perPage * curPage;

    console.log(option);

    const r = await this.getTable().findAndCountAll(option);
    return {
      code: 1,
      data: r.rows.map(item => item.toJSON()),
      total: r.count,
    };
  }
}
