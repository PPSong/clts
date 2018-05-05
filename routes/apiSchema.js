import * as DBTables from '../models/Model';

export const normalApiSchema = {
  // 常规API
  //----------------
  // DPCreate
  DPCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 图片链接
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'PPId', 'GYSId'],
  },
  // DPEdit
  DPEdit: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // 图片链接
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'imageUrl'],
  },
  // DWCreate
  DWCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 材质
      CZ: {
        type: 'string',
      },
      // 尺寸
      CC: {
        type: 'string',
      },
    },
    required: ['name', 'GTId', 'CZ', 'CC'],
  },
  // DWEdit
  DWEdit: {
    type: 'object',
    properties: {
      // DPId
      DPId: {
        type: 'number',
      },
      // 材质
      CZ: {
        type: 'string',
      },
      // 尺寸
      CC: {
        type: 'string',
      },
    },
    required: ['CZ', 'CC'],
  },
  // FGTesterCreate
  FGTesterCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // Code
      Code: {
        type: 'object',
        properties: {
          Code1: {
            type: 'string',
          },
          Code2: {
            type: 'string',
          },
          Code3: {
            type: 'string',
          },
          Code4: {
            type: 'string',
          },
          Code5: {
            type: 'string',
          },
        },
        oneOf: [
          { required: ['Code1'] },
          { required: ['Code2'] },
          { required: ['Code3'] },
          { required: ['Code4'] },
          { required: ['Code5'] },
        ],
      },
    },
    required: ['name', 'PPId', 'Code'],
  },
  // FGTesterEdit
  FGTesterEdit: {
    type: 'object',
    properties: {
      // FGtester名称
      name: {
        type: 'number',
      },
      Code: {
        type: 'object',
        properties: {
          Code1: {
            type: 'string',
          },
          Code2: {
            type: 'string',
          },
          Code3: {
            type: 'string',
          },
          Code4: {
            type: 'string',
          },
          Code5: {
            type: 'string',
          },
        },
        oneOf: [
          { required: ['Code1'] },
          { required: ['Code2'] },
          { required: ['Code3'] },
          { required: ['Code4'] },
          { required: ['Code5'] },
        ],
      },
    },
    required: ['name', 'Code'],
  },
  // GYSCreate
  GYSCreate: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // GYS类型
      type: {
        type: 'string',
      },
    },
    required: ['name', 'type'],
  },
  // GYSEdit
  GYSEdit: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // GYS类型
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'type'],
  },
  // PPCreate
  PPCreate: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // UserCreate
  UserCreate: {
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
    },
    required: ['username', 'password'],
  },
  // UserEdit
  UserEdit: {
    type: 'object',
    properties: {
      // 密码
      password: {
        type: 'string',
      },
    },
    required: ['password'],
  },
  // WLCreate
  WLCreate: {
    type: 'object',
    properties: {
      // WL名称
      name: {
        type: 'string',
      },
      // 物料code
      code: {
        type: 'string',
      },
      // 物料level
      level: {
        type: 'number',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // GYSId
      GYSId: {
        type: 'number',
      },
      // imageUrl
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['name', 'code', 'level', 'PPId', 'GYSId'],
  },
  // WLEdit
  // fftd：WL供应商暂未确定是否能修改
  WLEdit: {
    type: 'object',
    properties: {
      // WL名称
      name: {
        type: 'string',
      },
      // imageUrl
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['name'],
  },
};

export const apiSchema = {
  // business_apis
  //----------------
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
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WYDP反馈
      WYDPPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
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

  // 新建KFJL [PPJL]
  createKFJL: {
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
      // PPId
      PPId: {
        type: 'number',
      },
    },
    required: ['username', 'password', 'PPId'],
  },
  // 新建GT, GTBA [KFJL]
  createGTWithGTBA: {
    type: 'object',
    properties: {
      // PPId
      PPId: {
        type: 'number',
      },
      // 柜台名称
      name: {
        type: 'string',
      },
      // GTcode
      code: {
        type: 'string',
      },
      // 区域
      QY: {
        type: 'string',
      },
      // 城市
      CS: {
        type: 'string',
      },
    },
    required: ['PPId', 'name', 'code', 'QY', 'CS'],
  },
  // 编辑GT图 [KFJL]
  setGTImage: {
    type: 'object',
    properties: {
      // GTId
      id: {
        type: 'number',
      },
      // 柜台图
      imageUrl: {
        type: 'string',
      },
    },
    required: ['id', 'imageUrl'],
  },
  // 创建GZ [KFJL]
  createGZ: {
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
      // PPId
      PPId: {
        type: 'number',
      },
    },
    required: ['username', 'password', 'PPId'],
  },
  // 配置GZ负责GT [KFJL]
  setGZGTs: {
    type: 'object',
    properties: {
      // GZ的userid
      GZUserId: {
        type: 'number',
      },
      // GTIds
      GTIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GZUserId', 'GTIds'],
  },
  // 新建GYS, GLY[KFJL]
  createGYSWithGLY: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // GYS类型
      type: {
        type: 'string',
      },
    },
    required: ['name', 'username', 'password', 'type'],
  },
  // 新建AZGS, GLY [KFJL]
  createAZGSWithGLY: {
    type: 'object',
    properties: {
      // AZGS名称
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
    },
    required: ['name', 'username', 'password'],
  },
  // 配置DP到DWs [KFJL]
  setDPDWs: {
    type: 'object',
    properties: {
      // DPId
      id: {
        type: 'number',
      },
      // DWIds
      DWIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['id', 'DWIds'],
  },
  // 创建EJZH [KFJL]
  createEJZH: {
    type: 'object',
    properties: {
      // PPId
      PPId: {
        type: 'number',
      },
      // 二级组合name
      name: {
        type: 'string',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 二级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // FGTesters
      FGTesters: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // FGTesters id
            id: {
              type: 'number',
            },
            // FGTesters number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // SJWLs
      SJWLs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // SJWLs id
            id: {
              type: 'number',
            },
            // SJWLs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['PPId', 'name', 'WLId', 'imageUrl', 'XGTs', 'SJWLs'],
  },
  // 编辑EJZH [KFJL]
  editEJZH: {
    type: 'object',
    properties: {
      // EJZHid
      id: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 二级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // FGTesters
      FGTesters: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // FGTesters id
            id: {
              type: 'number',
            },
            // FGTesters number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // SJWLs
      SJWLs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // SJWLs id
            id: {
              type: 'number',
            },
            // SJWLs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['id', 'WLId', 'imageUrl', 'XGTs', 'FGTesters', 'SJWLs'],
  },
  // 创建YJZH [KFJL]
  createYJZH: {
    type: 'object',
    properties: {
      // PPId
      PPId: {
        type: 'number',
      },
      // 一级组合name
      name: {
        type: 'string',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 一级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // EJZHs
      EJZHs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // EJZHs id
            id: {
              type: 'number',
            },
            // EJZHs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number', 'EJZHs'],
        },
      },
    },
    required: ['PPId', 'name', 'WLId', 'imageUrl', 'XGTs'],
  },
  // 编辑YJZH [KFJL]
  editYJZH: {
    type: 'object',
    properties: {
      // YJZHId
      Id: {
        type: 'number',
      },
      // YJWLId
      WLId: {
        type: 'number',
      },
      // 一级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // EJZHs
      EJZHs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // EJZHs id
            id: {
              type: 'number',
            },
            // EJZHs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number', 'EJZHs'],
        },
      },
    },
    required: ['id', 'WLId', 'imageUrl', 'XGTs'],
  },
  // 配置YJZH_GTs [KFJL]
  setYJZHGTs: {
    type: 'object',
    properties: {
      // YJZHId
      Id: {
        type: 'number',
      },
      // GTs
      GTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // GTs id
            id: {
              type: 'number',
            },
            // GTs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['id', 'GTs'],
  },
  // 生成DD [KFJL]
  createDD: {
    type: 'object',
    properties: {
      // PPId
      PPId: {
        type: 'number',
      },
      // DD名称
      name: {
        type: 'string',
      },
    },
    required: ['name', 'PPId'],
  },
  // 重新生成DD [KFJL]
  reCreateDD: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
    },
    required: ['DDId'],
  },
  // 设置PP_GTFXs [KFJL]
  setPPGTFXs: {
    type: 'object',
    properties: {
      // PPId
      id: {
        type: 'number',
      },
      // GTIds
      GTIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['id', 'GTIds'],
  },
  // 批量设置DD_GT_WL的AZGS [PPJL]
  setDDGTWLs0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // DD_GT_WLIds
      DD_GT_WLIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'DD_GT_WLIds'],
  },
  // 批量设置DD_DW_DP的AZGS [PPJL]
  setDDDWDPs0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // DD_DW_DPIds
      DD_DW_DPIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'DD_DW_DPIds'],
  },
  // 审批通过DD [PPJL]
  approveDD: {
    type: 'object',
    properties: {
      // DDId
      id: {
        type: 'number',
      },
    },
    required: ['id'],
  },
  // 批量设置DD_GT_WL的发货GYS [GYSGLY]
  setDDGTWLs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // DD_GT_WLIds
      DD_GT_WLIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'DD_GT_WLIds'],
  },
  // 批量设置DD_DW_DP的发货GYS [GYSGLY]
  setDDDWDPs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // DD_DW_DPIds
      DD_DW_DPIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'DD_DW_DPIds'],
  },
  // 批量设置DD_GT_WL的AZG [AZGSGLY]
  setDDGTWLs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // DD_GT_WLIds
      DD_GT_WLIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'DD_GT_WLIds'],
  },
  // 批量设置DD_DW_DP的AZG [AZGSGLY]
  setDDDWDPs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // DD_DW_DPIds
      DD_DW_DPIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'DD_DW_DPIds'],
  },
  // 批量入库WL [ZHY]
  piLiangRuKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 批量出库WL [ZHY]
  piLiangChuKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 批量消库WL [ZHY]
  piLiangXiaoKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 订单批量装箱DDWL [ZHY]
  piLiangZhuangXiangDDWL: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['DDId', 'GTId', 'WLEWMs', 'KDXEWM'],
  },
  // 订单批量装箱DDDP [ZHY]
  piLiangZhuangXiangDDDP: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['DDId', 'GTId', 'DPEWMs', 'KDXEWM'],
  },
  // 订单批量装箱BHWL [ZHY]
  piLiangZhuangXiangBuHuoWL: {
    type: 'object',
    properties: {
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 补货物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['YJZXTime', 'GTId', 'WLEWMs', 'KDXEWM'],
  },
  // 订单批量装箱BHDP [ZHY]
  piLiangZhuangXiangBuHuoDP: {
    type: 'object',
    properties: {
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 补货灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['YJZXTime', 'GTId', 'DPEWMs', 'KDXEWM'],
  },
  // 出箱WL [ZHY]
  chuXiangWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 出箱DP [ZHY]
  chuXiangDP: {
    type: 'object',
    properties: {
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 关联快递 [ZHY]
  guanLianKuaiDi: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
      // 快递单code
      KDDCode: {
        type: 'string',
      },
    },
    required: ['EWMs', 'KDDCode'],
  },
  // 解除关联快递 [ZHY]
  jieChuGuanLianKuaiDi: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收箱 [GTBA]
  shouXiang: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收货WL [GTBA, AZG]
  shouHuoWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收货DP [GTBA, AZG]
  shouHuoDP: {
    type: 'object',
    properties: {
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 安装反馈DDWL状态 [GTBA, AZG]
  anZhuangFanKuiDDWLZhuangTai: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WYWL反馈
      WYWLPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // WYWLId
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
    required: ['DDId', 'GTId', 'WYWLPayloads'],
  },
  // 安装反馈全景WL图片 [GTBA, AZG]
  anZhuangFanKuiQuanJingWLTuPian: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 柜台WL全景图:
      imageUrls: {
        type: 'array',
        minItems: 1,
        // uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
    required: ['DDId', 'GTId', 'imageUrls'],
  },
  // 安装反馈全景DP图片 [GTBA, AZG]
  anZhuangFanKuiQuanJingDPTuPian: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 柜台DP全景图:
      imageUrls: {
        type: 'array',
        minItems: 1,
        // uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
    required: ['DDId', 'GTId', 'imageUrls'],
  },
  // 申请上市WLBH [GZ, GTBA, AZG]
  shenQingShangShiWLBH: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 物料补货图片
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['DDId', 'GTId', 'WLId', 'imageUrl'],
  },
  // 申请上市DPBH [GZ, GTBA, AZG]
  shenQingShangShiDPBH: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // DWId
      DWId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 灯片补货图片
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['DDId', 'DWId', 'DPId', 'imageUrl'],
  },
  // 申请日常WLBH [GZ, GTBA]
  shenQingRiChangWLBH: {
    type: 'object',
    properties: {
      // GTId
      GTId: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 补货图片
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['GTId', 'WLId', 'imageUrl'],
  },
  // 申请日常DPBH [GZ, GTBA]
  shenQingRiChangDPBH: {
    type: 'object',
    properties: {
      // DWId
      DWId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 灯片补货图片
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['DWId', 'DPId', 'imageUrl'],
  },
  // 批量审批通过WLBHa [KFJL]
  piLiangShenPiTongGuoWLBHa: {
    type: 'object',
    properties: {
      // 物料补货ids:
      // fftd:从这个API开始的的物料ids与“SetWLBHs0AZG”中的的物料ids未统一写法
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids'],
  },
  // 批量审批通过DPBHa [KFJL]
  piLiangShenPiTongGuoDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货ids:
      // fftd:从这个API开始的的灯片ids与“SetDPBHs0AZG”中的的灯片ids未统一写法
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids'],
  },
  // 单独审批通过WLBHa [KFJL]
  danDuShenPiTongGuoWLBHa: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      // fftd：API中此处的KFJLNote应为非必填项
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批通过DPBHa [KFJL]
  danDuShenPiTongGuoDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      // fftd：API中此处的KFJLNote应为非必填项
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批驳回WLBHa [KFJL]
  danDuShenPiBoHuiWLBHa: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'KFJLNote'],
  },
  // 单独审批驳回DPBHa [KFJL]
  danDuShenPiBoHuiDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'KFJLNote'],
  },
  // 为WLBH分配AZGS [PPJL]
  setWLBH0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // WLBHIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 为DPBH分配AZGS [PPJL]
  setDPBH0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // DPBHIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 批量审批通过WLBHb [PPJL]
  piLiangShenPiTongGuoWLBHb: {
    type: 'object',
    properties: {
      // 物料补货ids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids'],
  },
  // 批量审批通过DPBHb [PPJL]
  piLiangShenPiTongGuoDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货ids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids'],
  },
  // 单独审批通过WLBHb [PPJL]
  danDuShenPiTongGuoWLBHb: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批通过DPBHb [PPJL]
  danDuShenPiTongGuoDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批驳回WLBHb [PPJL]
  danDuShenPiBoHuiWLBHb: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'PPJLNote'],
  },
  // 单独审批驳回DPBHb [PPJL]
  danDuShenPiBoHuiDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'PPJLNote'],
  },
  // setWLBHYJZXTime [生产GYSGLY]
  setWLBHs0YJZXTime: {
    type: 'object',
    properties: {
      // WLBHids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJZX时间
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJZXTime'],
  },
  // setDPBHYJZXTime [生产GYSGLY]
  setDPBHs0YJZXTime: {
    type: 'object',
    properties: {
      // DPBHids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJZX时间:
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJZXTime'],
  },
  // 为WLBH分配发货GYS [生产GYS]
  fenPeiWLBHFaHuoGYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 物料补货Ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids'],
  },
  // 为DPBH分配发货GYS [生产GYS]
  fenPeiDPBHFaHuoGYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 灯片补货ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids'],
  },
  // 分配WLBH的AZG [AZGSGLY]
  setWLBHs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // 物料补货Ids
      WLBHIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'WLBHIds'],
  },
  // 分配DPBH的AZG [AZGSGLY]
  setDPBHs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // 灯片补货Ids
      DPBHIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'DPBHIds'],
  },
};
