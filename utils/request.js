import config from '../config/env.js'

const BASE_URL = config.baseUrl
const ACCESS_TOKEN_KEY = config.storageKeys.accessToken
const REFRESH_TOKEN_KEY = config.storageKeys.refreshToken

// Token管理
// 注意：此处不设任何兜底 token。未登录时必须为空字符串，
// 由后端返回 401 触发跳转登录页，而非以固定身份静默访问。
const getToken = () => uni.getStorageSync(ACCESS_TOKEN_KEY) || ''
const getRefreshToken = () => uni.getStorageSync(REFRESH_TOKEN_KEY) || ''
const saveTokens = (accessToken, refreshToken) => {
  uni.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}
const clearTokens = () => {
  uni.removeStorageSync(ACCESS_TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
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
        timeout: config.timeout,
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