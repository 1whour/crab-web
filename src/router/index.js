import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

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
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
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
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },
  {
    path: '/task',
    component: Layout,
    //redirect: '/example/table',
    children: [
      {
        path: 'index',
        //name: 'user-list',
        //component: () => import('@/views/table/index.vue'),
        component: () => import('@/views/task/task.vue'),
        meta: { title: '任务管理', icon: 'el-icon-user' },
      }
    ]
  },
  {
    path: '/cluster',
    component: Layout,
    //redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '集群状态',
      icon: 'el-icon-caret-right',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'runtime',
        component: () => import('@/views/cluster/runtime.vue'),
        name: 'PagePermission',
        meta: {
          icon: 'el-icon-date',
          title: 'runtime',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'gate',
        component: () => import('@/views/cluster/gate.vue'),
        name: 'PagePermission',
        meta: {
          icon: 'el-icon-date',
          title: 'gate',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
    ]
  },
  {
    path: '/result',
    component: Layout,
    //redirect: '/example/table',
    children: [
      {
        path: 'index',
        //name: 'user-list',
        component: () => import('@/views/result/result.vue'),
        meta: { title: '执行日志', icon: 'el-icon-camera' },
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    //redirect: '/example/table',
    children: [
      {
        path: 'index',
        //name: 'user-list',
        //component: () => import('@/views/table/index.vue'),
        component: () => import('@/views/user/userlist.vue'),
        meta: { title: '用户管理', icon: 'el-icon-user' },
      }
    ]
  },

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
