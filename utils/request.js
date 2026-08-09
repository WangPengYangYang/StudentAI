const BASE_URL = 'https://pre.schoolmate.website/api/v1'

// Token管理
const getToken = () => uni.getStorageSync('access_token') || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOjEsInRpZXIiOiJmcmVlIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwiaXNzIjoic3R1ZHktYXNzaXN0YW50LXN0YWdpbmciLCJpYXQiOjE3NzY1OTQxOTMsImV4cCI6MTgwODEzMDE5M30.JE_s0mTvhY3tl-kTOpBckgoE3sp6mdvXs83JLFWlHh8'
const getRefreshToken = () => uni.getStorageSync('refresh_token') || ''
const saveTokens = (accessToken, refreshToken) => {
  uni.setStorageSync('access_token', accessToken)
  if (refreshToken) uni.setStorageSync('refresh_token', refreshToken)
}
const clearTokens = () => {
  uni.removeStorageSync('access_token')
  uni.removeStorageSync('refresh_token')
}

// 刷新状态管理
let isRefreshing = false
let subscribers = []

// 刷新token
const refreshToken = async () => {
  const refresh = getRefreshToken()
  if (!refresh) return null
  
  try {
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + '/auth/refresh',
        method: 'POST',
        data: { refresh_token: refresh },
        header: { 'Content-Type': 'application/json' },
        success: resolve,
        fail: reject
      })
    })
    
    if (res.statusCode === 200 && res.data.code === 0) {
      const { access_token, refresh_token } = res.data.data
      saveTokens(access_token, refresh_token)
      return access_token
    }
    return null
  } catch (e) {
    return null
  }
}

// 跳转登录
const toLogin = () => {
  clearTokens()
  uni.reLaunch({ url: '/pages/index/index' })
}

// 核心请求
const request = (options) => {
  return new Promise((resolve, reject) => {
    const doRequest = (token) => {
      uni.request({
        url: BASE_URL + options.url,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        timeout: 120000,
        success: async (res) => {
          const isExpired = res.statusCode === 401 || (res.data && res.data.code === 1003)
          
          if (isExpired && !options.url.includes('/auth/')) {
            if (isRefreshing) {
              subscribers.push((newToken) => {
                newToken ? doRequest(newToken) : reject(res.data || { code: 1003, message: '请重新登录' })
              })
              return
            }
            
            isRefreshing = true
            const newToken = await refreshToken()
            isRefreshing = false
            
            if (newToken) {
              subscribers.forEach(cb => cb(newToken))
              subscribers = []
              doRequest(newToken)
            } else {
              subscribers.forEach(cb => cb(null))
              subscribers = []
              toLogin()
              reject(res.data || { code: 1003, message: '请重新登录' })
            }
            return
          }
          
          res.statusCode === 200 && res.data.code === 0 ? resolve(res.data) : reject(res.data || { code: res.statusCode, message: '请求失败' })
        },
        fail: reject
      })
    }
    doRequest(getToken())
  })
}

export default {
  get: (url, params) => request({ url, data: params }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
  saveTokens,
  clearTokens,
  getToken,
  getRefreshToken
}