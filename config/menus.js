
export default {
  "系统管理员":[
    { name: '首页', key: '/dashboard' },
    { name: '我的账户', key: '/me' },
    { name: '账户管理', key: '/user' },
    { name: '品牌管理', key: '/pp' },
    { name: '柜台管理', key: '/gt' },
    { name: '供应商管理', key: '/gys' },
    { name: '安装公司管理', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位库', key: '/dw' },
        { name: '灯片库', key: '/' }
      ]
    },
  ],
  "品牌经理":[
    { name: '首页', key: '/dashboard' },
    { name: '我的账户', key: '/me' },
    { name: '账户管理', key: '/user' },
    { name: '柜台管理', key: '/gt' },
    { name: '供应商查询', key: '/gys' },
    { name: '安装公司查询', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位库', key: '/dw' },
        { name: '灯片库', key: '/' }
      ]
    },
  ],
  "客服经理":[
    { name: '首页', key: '/dashboard' },
    { name: '我的账户', key: '/me' },
    { name: '账户管理', key: '/user' },
    { name: '柜台管理', key: '/gt' },
    { name: '供应商查询', key: '/gys' },
    { name: '安装公司查询', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' }
      ]
    },
  ],
  "供应商管理员":[
    { name: '首页', key: '/dashboard' },
    { name: '我的账户', key: '/me' },
    { name: '账户管理', key: '/user' }
  ],
  "安装公司管理员":[
    { name: '首页', key: '/dashboard' },
    { name: '我的账户', key: '/me' },
    { name: '账户管理', key: '/user' }
  ]
};