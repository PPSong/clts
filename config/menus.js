
export default {
  "系统管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', key: '/user' },
    { name: '品牌管理', key: '/pp' },
    { name: '柜台管理', key: '/gt' },
    { name: '供应商管理', key: '/gys' },
    { name: '安装公司管理', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
        { name: '二级组合', key: '/ejzh' }
      ]
    },
  ],
  "品牌经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', key: '/user' },
    { name: '柜台管理', key: '/gt' },
    { name: '供应商管理', key: '/gys' },
    { name: '安装公司管理', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
        { name: '二级组合', key: '/ejzh' }
      ]
    },
  ],
  "客服经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    { name: '柜台管理', icon:'Archive', key: '/gt' },
    { name: '供应商管理', icon:'SplitObject', key: '/gys' },
    { name: '安装公司管理', icon:'Repair', key: '/azgs' },
    {
      name: '货品管理',
      icon:'Product', 
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
        { name: '二级组合', key: '/ejzh' }
      ]
    },
  ],
  "供应商管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', key: '/user' }
  ],
  "安装公司管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', key: '/user' }
  ]
};