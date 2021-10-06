
export const state = () => ({
  defaultAvatar: 'https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png',
  // defaultAvatar: 'https://yt3.ggpht.com/a/AGF-l7-CW8-2GpvXXS3KLULyJQsYxd1DHuv9e_q8TA=s900-c-k-c0xffffffff-no-rj-mo',
  token: localStorage.getItem('etl-user-token'),
  backendUrl: location.hostname === 'localhost' || location.hostname === 'altekloads.com' ? 'https://altekloads.com' : 'https://green-node.ru',
  backendSocketUrl: location.hostname === 'localhost' || location.hostname === 'altekloads.com' ? 'wss://altekloads.com' : 'https://green-node.ru',
  // backendUrl: 'https://altekloads.com',
  // backendSocketUrl: 'wss://altekloads.com',
  isUserActive: true,
  currentUser: {},
  loads: {},
  notifications: {},
  settings: {},
  toolbarData: {},
  users: {},
  telephony: {},
  messages: 0,
  BING_API_KEY: 'Aj8MghQBkTl8Ibq8cOjk_K3XsRt0XC4gdCajDwg1vAy4VgOPX8LlVXuOLpEVoDcU',
  GMAP_API_KEY: 'AIzaSyARqEL__oB6pdnUAbLBjRgPgNSpu5PPpgQ',
})

export const mutations = {
  setToken(state, token) {
    state.token = token
    localStorage.setItem('etl-user-token', token)
  },
  clearToken(state) {
    state.token = ''
    localStorage.setItem('etl-user-token', '')
    // localStorage.setItem('etl-user-actual', '')
  },
  setMessages(state, data) {
    state.messages = data
  },
  renewCurrentUser(state, newData) {
    Object.assign(state.currentUser, newData)
    // localStorage.setItem('etl-user-actual', JSON.stringify(state.currentUser))
  },
  renewNitifications(state, newData) {
    state.notifications = newData
  },
  renewSettings(state, newData) {
    state.settings = newData
  },
  updateUserActivityStatus(state, newData) {
    state.isUserActive = !!newData
  },
  updateToolbarData(state, data) {
    state.toolbarData = data
  },
  updateToolbarActions(state, actions) {
    let newData = {}
    if(state.toolbarData.title !== undefined) {
      newData.title = state.toolbarData.title
    }
    newData.actions = actions
    state.toolbarData = newData
  },
  deleteToolbarActions(state) {
    let newData = {}
    if(state.toolbarData.title !== undefined) {
      newData.title = state.toolbarData.title
    }
    newData.actions = []
    state.toolbarData = newData
  },
  updateUsers(state, data) {
    state.users = data
  },
  updateTelephonyData(state, data) {
    state.telephony = data
  }
}

export const actions = {
  login({commit}) {
    commit('setToken')
  },
  logout({commit}) {
    commit('clearToken')
    this.$router.push('/login/')
  }
}

export const getters = {
  hasToken: s => !!s.accesstoken,
  getToken: s => s.token,
  getCurrentUser: s => s.currentUser,
  getDefaultAvatar: s => s.defaultAvatar,
  getNotifications: s => s.notifications,
  getSettings: s => s.settings,
  getUserActivityStatus: s => s.isUserActive,
  getBingApiKey: s => s.BING_API_KEY,
  getGmapApiKey: s => s.GMAP_API_KEY,
  getToolbarData: s => s.toolbarData,
  getUsers: s => s.users,
  getTelephony: s => s.telephony,
  getMessages: s => s.messages
}
