const getters = {
  /* app module */
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  language: state => state.app.language,
  /* tagview module */
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  /* user module */
  user: state => state.user.user,
  status: state => state.user.status,
  usersOnline: state => state.user.usersOnline,
  roles: state => state.user.roles,
  /* masterdata module */
  masterdata: state => state.data.masterdata,
  /* permission module */
  permission_routes: state => state.permission.routes,
}
export default getters
