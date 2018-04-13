import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateFGAndTesterAndFGTester extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    const { PPId, FGPayload } = req.body;
    const { name } = FGPayload;
    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态
    await user.checkPPId(PPId, transaction);

    // 检查FG如果在对应PP中已存在, 应该是enable状态
    let tmpFG = await DBTables.FG.findOne({
      where: {
        PPId,
        name,
      },
      transaction,
    });

    if (tmpFG) {
      if (tmpFG.disabledAt != null) {
        throw new Error(`${tmpFG}记录状态不正确!`);
      }
    }
    // end 检查FG如果在对应PP中已存在, 应该是enable状态

    // 检查Testers如果在对应PPId已存在, 应该是enable状态
    const { Testers } = FGPayload;
    for (let i = 0; i < Testers.length; i++) {
      const tmpTester = await DBTables.Tester.findOne({
        where: {
          PPId,
          name: Testers[i].name,
        },
        transaction,
      });

      if (tmpTester) {
        if (tmpTester.disabledAt != null) {
          throw new Error(`${tmpTester}记录状态不正确!`);
        }
      }
    }
    // end 检查Testers如果在对应PPId已存在, 应该是enable状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 如不存在则创建FG
    if (!tmpFG) {
      tmpFG = await DBTables.FG.create(
        {
          name: FGPayload.name,
          PPId,
          note: FGPayload.note,
        },
        { transaction },
      );
    }
    // end 如不存在则创建FG

    // 如不存在则创建Tester
    const TesterIds = [];
    for (let i = 0; i < Testers.length; i++) {
      let tmpTester = await DBTables.Tester.findOne({
        where: {
          PPId,
          name: Testers[i],
        },
        transaction,
      });

      if (!tmpTester) {
        tmpTester = await DBTables.Tester.create(
          {
            name: Testers[i],
            PPId,
          },
          { transaction },
        );
      }

      TesterIds.push(tmpTester.id);
    }
    // end 如不存在则创建Tester

    // 把Testers配置到FG上
    await tmpFG.setTesters(TesterIds, { through: { PPId }, transaction });
    // end 把Testers配置到FG上
  }
}
