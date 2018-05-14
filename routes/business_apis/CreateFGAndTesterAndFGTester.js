import _ from 'lodash';
import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class CreateFGAndTesterAndFGTester extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.KFJL];
  }

  static async mainProcess(req, res, next, user, transaction) {
    // FG:
    // {
    //   name: 'FG_T',
    //   note: 'note_T',
    //   Testers: ['Tester_T1', 'Tester_T2'],
    // }
    const { PPId, FG } = req.body;
    const { name } = FG;

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
      if (tmpFG.disabledAt !== null) {
        throw new Error(`${tmpFG}在屏蔽状态!`);
      }
    }
    // end 检查FG如果在对应PP中已存在, 应该是enable状态

    // 检查Testers如果在对应PPId已存在, 应该是enable状态
    const { Testers } = FG;
    for (let i = 0; i < Testers.length; i++) {
      const tmpTester = await DBTables.Tester.findOne({
        where: {
          PPId,
          name: Testers[i].name,
        },
        transaction,
      });

      if (tmpTester) {
        if (tmpTester.disabledAt !== null) {
          throw new Error(`${tmpTester}在屏蔽状态!`);
        }
      }
    }
    // end 检查Testers如果在对应PPId已存在, 应该是enable状态
    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // 如不存在则创建FG
    if (!tmpFG) {
      tmpFG = await DBTables.FG.create(
        {
          name: FG.name,
          PPId,
          note: FG.note,
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

    // 获取需要新添加的TesterIds
    const curTesters = await tmpFG.getTesters({ transaction });
    const curTesterIds = curTesters.map(item => item.id);
    const needToAddTesterIds = _.difference(TesterIds, curTesterIds);
    // end 获取需要新添加的TesterIds

    // 添加新的FG对应的Testers
    await tmpFG.addTesters(needToAddTesterIds, { through: { PPId }, transaction });
    // end 添加新的FG对应的Testers
  }
}
