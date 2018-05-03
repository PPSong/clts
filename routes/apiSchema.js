import * as DBTables from '../models/Model';

const apiSchema = {
  // 新建PPJL [ADMIN]
  createPPJL: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 品牌Id
      PPId: {
        type: 'number',
      },
    },
    required: ['username', 'password', 'PPId'],
  },
  // 安装反馈DDDP状态 [GTBA, AZG]
  anZhuangFanKuiDDDPZhuangTai: {
    type: 'object',
    properties: {
      // 品牌Id
      DDId: {
        type: 'number',
      },
      // 柜台Id
      GTId: {
        type: 'number',
      },
      // WYDP反馈
      WYDPPayloads: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            // WYDPId
            id: {
              type: 'number',
            },
            // 反馈类型
            AZFKType: {
              type: 'string',
              enum: Object.values(DBTables.AZFKType),
            },
            // 反馈图片地址
            imageUrl: {
              type: 'string',
            },
          },
          required: ['id', 'AZFKType', 'imageUrl'],
        },
      },
    },
    required: ['DDId', 'GTId', 'WYDPPayloads'],
  },
};

export default apiSchema;
