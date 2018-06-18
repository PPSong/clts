import bCrypt from 'bcryptjs';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateKFJL extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.PPJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { username, password, PPId, name, mail, phone } = req.body;
    if (name) name = name.trim();
    if (mail) mail = mail.trim();
    if (phone) phone = phone.trim();
    username = username.trim();

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    const tmpPP = await user.checkPPId(PPId, transaction);
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 重置PP的KFJL
    const KFJLs = await DBTables.sequelize.query(`
      SELECT 
        *
      FROM
        User
      WHERE 
        id in (SELECT UserId as id FROM KFJL_PP WHERE PPId = ${PPId})
    `, {
      type: DBTables.sequelize.QueryTypes.SELECT,
    });

    // 新建用户
    let tmpUser = await DBTables.User.create(
      {
        username,
        password: bCrypt.hashSync(password, DBTables.PASSWORD_SALT),
        JS: DBTables.JS.KFJL,
        name: name || '',
        mail: mail || '',
        phone: phone || ''
      },
      { transaction },
    );

    tmpUser = tmpUser.toJSON();

    KFJLs.push(tmpUser);

    await DBTables.KFJL_PP.create({ UserId:tmpUser.id, PPId }, { transaction });

    // end 新建用户
    // await tmpPP.setKFJLs(KFJLs, { transaction });
    // end 重置PP的KFJL
  }
}
