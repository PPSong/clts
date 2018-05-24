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
  // 获取上传文件的token
  getUploadToken: {
    type: 'object',
    properties: {
      // 空间类型,公开public,私有private,默认私有
      type: {
        type: 'string',
      },
      // 文件类型,如png,txt,jpg
      ext: {
        type: 'string',
      },
      // 保存的文件名字,不设置则随机生成名字
      filename: {
        type: 'string',
      },
    },
    required: [],
  },

  // 修改当前已登录用户的密码
  userChangePassword: {
    type: 'object',
    properties: {
      // 新密码
      newPassword: {
        type: 'string',
      },
      // 旧密码
      oldPassword: {
        type: 'string',
      },
    },
    required: ['newPassword', 'oldPassword'],
  },
  // 获取当前登录用户的详细信息
  myUserInfo: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 检查品牌名称是否已经存在
  checkPPExists: {
    type: 'object',
    properties: {
      // 品牌名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查灯片名称是否已经存在
  checkDPExists: {
    type: 'object',
    properties: {
      // 灯片名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查灯位编号是否已经存在(在一个柜台中唯一)
  checkDWExists: {
    type: 'object',
    properties: {
      // 灯位编号
      name: {
        type: 'string',
      },
      // 柜台ID
      GTId: {
        type: 'number',
      },
    },
    required: ['name', 'GTId'],
  },
  // 检查物料名称是否已经存在(在一个品牌中唯一)
  checkWLNameExists: {
    type: 'object',
    properties: {
      // 物料名称
      name: {
        type: 'string',
      },
      // 品牌ID
      PPId: {
        type: 'number',
      },
    },
    required: ['name', 'PPId'],
  },
  // 检查物料编号是否已经存在
  checkWLCodeExists: {
    type: 'object',
    properties: {
      // 灯位编号
      code: {
        type: 'string',
      },
    },
    required: ['code'],
  },
  // 检查供应商名称是否已经存在
  checkGYSExists: {
    type: 'object',
    properties: {
      // 供应商名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查安装公司名称是否已经存在
  checkAZGSExists: {
    type: 'object',
    properties: {
      // 品牌名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查柜台名称是否已经存在,在一个品牌内名称唯一
  checkGTExists: {
    type: 'object',
    properties: {
      // 柜台名称
      name: {
        type: 'string',
      },
      // 品牌ID,客服经理角色可不传
      PPId: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查柜台编号是否已经存在,在全表内编号唯一
  checkGTCodeExists: {
    type: 'object',
    properties: {
      // 柜台编号
      code: {
        type: 'string',
      },
    },
    required: ['code'],
  },
  // 检查用户名是否已经存在
  checkUsernameExists: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
    },
    required: ['username'],
  },
  // ////////////

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
      // 姓名
      name: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
      // 手机号
      phone: {
        type: 'string',
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
    required: ['name', 'code', 'QY', 'CS'],
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
      // 姓名
      name: {
        type: 'string',
      },
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
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
  // 获取自己品牌下的所有柜长列表 [KFJL]
  getGZList: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 获取某一柜长的所有柜台列表 [ADMIN,PPJL,KFJL,GZ]
  getGZGTList: {
    type: 'object',
    properties: {
      // 柜长id,如果是柜长本人则不需要
      GZUserId: {
        type: 'string',
      },
      // 柜台属性,如"id,name,code",默认返回所有属性
      fields: {
        type: 'string',
      },
    },
    required: [],
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
  // 新建AZG [AZGSGLY]
  createAZG: {
    type: 'object',
    properties: {
      // 姓名
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
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  // 新建ZHY [GYSGLY]
  createZHY: {
    type: 'object',
    properties: {
      // 姓名
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
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
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
          required: ['id', 'number'],
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
          required: ['id', 'number'],
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
      WLEWMs: {
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
      DPEWMs: {
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
  // 安装反馈补货物料状态 [AZG, GTBA]
  anZhuangFanKuiBHWLZhuangTai: {
    type: 'object',
    properties: {
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
    required: ['WYWLPayloads'],
  },
  // 安装反馈补货灯片状态 [AZG, GTBA]
  anZhuangFanKuiBHDPZhuangTai: {
    type: 'object',
    properties: {
      // DPWL反馈
      WYDPPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // DPWLId
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
    required: ['WYDPPayloads'],
  },
  // 获取DDWL装箱任务 [ZHY]
  getDDWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取BHWL装箱任务 [ZHY]
  getBHWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取指定DDGT的DDWL装箱任务 [ZHY]
  getDDGT0DDWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL装箱任务 [ZHY]
  getYJZXTimeGT0BHWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取指定DDGT的DDWL已装箱WYWL [ZHY]
  getDDGT0DDWLYiZhuangXiangWYWLList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  getYJZXTimeGT0BHWLYiZhuangXiangWYWLList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  //------------
  // 获取DDDP装箱任务 [ZHY]
  getDDDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取BHDP装箱任务 [ZHY]
  getBHDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取指定DDGT的DDDP装箱任务 [ZHY]
  getDDGT0DDDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHDP装箱任务 [ZHY]
  getYJZXTimeGT0BHDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取指定DDGT的DDDP已装箱WYDP [ZHY]
  getDDGT0DDDPYiZhuangXiangWYDPList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  getYJZXTimeGT0BHDPYiZhuangXiangWYDPList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取GYS相关快递箱 [ZHY]
  getGYSXiangGuanKDXs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GYS的WYWL库存 [ZHY]
  getGYSWYWLKuCun: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的KDXs [GTBA]
  getGTKDXs: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取AZG的DD任务列表 [AZG]
  getAZGDDTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GTBA的DD任务列表 [GTBA]
  getGTBADDTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的DDWL安装列表 [GTBA, AZG]
  getGT0DDWLAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'GTId'],
  },
  // 获取GT的DDDP安装列表 [GTBA, AZG]
  getGT0DDDPAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'GTId'],
  },
  // 获取GT的BHWL安装列表 [GTBA, AZG]
  getGT0BHWLAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的BHDP安装列表 [GTBA, AZG]
  getGT0BHDPAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取当前用户详细信息,如所属品牌等 [PPJL, KFJL]
  getCurUserInfo: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 灯片关联的灯位, 柜台信息 [ADMIN, PPJL, KFJL]
  getDPDWsInfo: {
    type: 'object',
    properties: {
      // DPId
      DPId: {
        type: 'number',
      },
    },
    required: ['DPId'],
  },
};
