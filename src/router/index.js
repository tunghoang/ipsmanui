import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout/index.vue'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','student']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    name: 'Login',
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/about',
    hidden: true,
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/about/index'),
        name: 'Documentation',
        meta: { title: 'about', icon: 'documentation', affix: true }
      }
    ]
  },
  // {
  //   path: '/guide',
  //   component: Layout,
  //   redirect: '/guide/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/guide/index'),
  //       name: 'Guide',
  //       meta: { title: 'guide', icon: 'guide', noCache: true }
  //     }
  //   ]
  // },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [

  /** when your routing map is too long, you can split it into small modules **/
  // componentsRouter,
  // chartsRouter,
  // nestedRouter,
  // tableRouter,


  // {
  //   path: '/student',
  //   component: Layout,
  //   meta: {
  //     roles: ['admin'] // you can set roles in root nav
  //   },
  //   children: [
  //   {
  //     path: 'index',
  //     component: () => import('@/views/student/index'),
  //     name: 'Student',
  //     meta: { title: 'student', icon: 'peoples' }
  //   }
  //   ]
  // },
  // {
  //   path: '/universities',
  //   component: Layout,
  //   meta: {
  //     roles: ['admin'] // you can set roles in root nav
  //   },
  //   children: [
  //   {
  //     path: 'index',
  //     component: () => import('@/views/universities/index'),
  //     name: 'University',
  //     meta: { title: 'university', icon: 'table' }
  //   }
  //   ]
  // },
  {
    path: '/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'profile', icon: 'user' }
      }
    ]
  },
  {
    path: '/ips-managerment',
    component: Layout,
    redirect: '/ips-managerment/node',
    alwaysShow: true, // will always show the root menu
    name: 'EngineManagerment',
    meta: {
      title: 'ips_managerment',
      icon: 'engines',
      roles: ['admin', 'superadmin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'node',
        component: () => import('@/views/node-managerment/node-list'),
        name: 'NodeList',
        meta: {
          title: 'node_list',
          icon: 'tree',
          roles: ['admin', 'superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'engine-type',
        component: () => import('@/views/node-managerment/engine-type-list'),
        name: 'EngineTypeList',
        meta: {
          title: 'engine_type_list',
          icon: 'engine-type',
          roles: ['admin', 'superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'engine',
        component: () => import('@/views/node-managerment/engine-list'),
        name: 'EngineList',
        meta: {
          title: 'engine_list',
          icon: 'server',
          roles: ['admin', 'superadmin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/rules-managerment',
    component: Layout,
    redirect: '/rules-managerment/role',
    alwaysShow: true,
    name: 'RoleManagerment',
    meta: {
      title: 'rules_managerment',
      icon: 'rules-managerment',
      roles: ['admin', 'superadmin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'role',
        component: () => import('@/views/rules-managerment/role-list'),
        name: 'RoleList',
        meta: {
          title: 'role_list',
          icon: 'roles',
          roles: ['admin', 'superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'role/:id/users',
        component: () => import('@/views/rules-managerment/users-of-role'),
        name: 'UsersOfRole',
        hidden: true,
        meta: {
          icon: 'user',
          title: 'users_of_role',
          roles: ['admin', 'superadmin']
        }
      },
      {
        path: 'role/:id/permissions',
        component: () => import('@/views/permission-managerment/index'),
        name: 'PermissionOfRole',
        hidden: true,
        meta: {
          title: 'permission_managerment',
          icon: 'permissions',
          roles: ['superadmin']
        }
      },
      {
        path: 'models',
        component: () => import('@/views/rules-managerment/anomaly-models'),
        name: 'AnomalyModels',
        meta: {
          icon: 'anomalies',
          title: 'anomaly_models',
          roles: ['admin', 'superadmin']
        }
      },
      {
        path: 'specifics',
        component: () => import('@/views/rules-managerment/specifics'),
        name: 'Specifics',
        meta: {
          icon: 'specifics',
          title: 'specifics',
          roles: ['admin', 'superadmin']
        }
      },
    ]
  },
  {
    path: '/intrusion-managerment',
    component: Layout,
    redirect: '/intrusion-managerment/intrusion',
    alwaysShow: true, // will always show the root menu
    name: 'IntrusionManagerment',
    meta: {
      title: 'intrusion_managerment',
      icon: 'intrusion-management',
      roles: ['admin', 'superadmin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'intrusion',
        component: () => import('@/views/intrusion-managerment/intrusion-monitoring'),
        name: 'IntrusionMonitoring',
        meta: {
          title: 'intrusion_monitoring',
          icon: 'intrusion-monitoring',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'alarm',
        component: () => import('@/views/intrusion-managerment/alarm'),
        name: 'Alarm',
        meta: {
          title: 'alarm',
          icon: 'alarm',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'anomalies',
        component: () => import('@/views/intrusion-managerment/anomaly-events'),
        name: 'Anomalies',
        meta: {
          title: 'anomaly_vents',
          icon: 'anomalies',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'impact-analysis',
        component: () => import('@/views/intrusion-managerment/impact-analysis'),
        name: 'ImpactAnalysis',
        meta: {
          title: 'impact-analysis',
          icon: 'impact-analysis',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'search',
        component: () => import('@/views/intrusion-managerment/search'),
        name: 'Search',
        meta: {
          title: 'search',
          icon: 'search',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'statistics',
        component: () => import('@/views/intrusion-managerment/statistics'),
        name: 'Statistics',
        meta: {
          title: 'statistics',
          icon: 'statistics',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
    ]
  },
  {
    path: '/system-managerment',
    component: Layout,
    redirect: '/system-managerment/user-list',
    alwaysShow: true, // will always show the root menu
    name: 'SystemManagerment',
    meta: {
      title: 'system_managerment',
      icon: 'setting',
      roles: ['admin', 'superadmin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'user-list',
        component: () => import('@/views/system-managerment/user-list'),
        name: 'UserList',
        meta: {
          title: 'user_list',
          icon: 'peoples',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'user/:id/roles',
        component: () => import('@/views/system-managerment/role-of-user'),
        name: 'RoleOfUser',
        hidden: true,
        meta: {
          icon: 'role',
          title: 'roles_of_user',
          roles: ['superadmin']
        }
      },
      {
        path: 'organisation-list',
        component: () => import('@/views/system-managerment/organisation-list'),
        name: 'OrganisationList',
        meta: {
          title: 'organisation_list',
          icon: 'organization',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'siem',
        component: () => import('@/views/system-managerment/siem'),
        name: 'SiemInterconnection',
        meta: {
          title: 'siem',
          icon: 'siem',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'settings',
        component: () => import('@/views/system-managerment/settings'),
        name: 'Settings',
        meta: {
          title: 'settings',
          icon: 'settings',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'monitor',
        component: () => import('@/views/system-managerment/monitor'),
        name: 'Monitor',
        meta: {
          title: 'monitor',
          icon: 'monitor',
          roles: ['superadmin'] // or you can only set roles in sub nav
        }
      },
    ]
  },
  // {
  //   path: '/permission-managerment',
  //   component: Layout,
  //   redirect: '/permission-managerment/:id',
  //   name: 'Permission',
  //   hidden: true,
  //   children: [
  //     {
  //       path: ':id',
  //       component: () => import('@/views/permission-managerment/index'),
  //       name: 'PermissionOfRole',
  //       meta: {
  //         title: 'permission_managerment',
  //         icon: 'permissions',
  //         roles: ['admin', 'superadmin']
  //       }
  //     }
  //   ]
  // },

  // {
  //   path: '/error',
  //   component: Layout,
  //   redirect: 'noRedirect',
  //   name: 'ErrorPages',
  //   meta: {
  //     title: 'Error Pages',
  //     icon: '404'
  //   },
  //   children: [
  //     {
  //       path: '401',
  //       component: () => import('@/views/error-page/401'),
  //       name: 'Page401',
  //       meta: { title: '401', noCache: true }
  //     },
  //     {
  //       path: '404',
  //       component: () => import('@/views/error-page/404'),
  //       name: 'Page404',
  //       meta: { title: '404', noCache: true }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
