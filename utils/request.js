/**
 * 网络请求封装
 * 基于 uni.request 封装，支持 Promise 和拦截器
 */

// 基础配置
// 开发环境使用代理路径，生产环境使用完整URL
let BASE_URL = '/api/v1'

// 检测开发环境（HBuilderX运行到H5时）
const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

if (!isDevelopment) {
    // 生产环境使用完整URL
    BASE_URL = 'http://62.234.174.126/api/v1'
}

const TIMEOUT = 30000

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加认证 token
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOjEsInRpZXIiOiJmcmVlIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwiaXNzIjoic3R1ZHktYXNzaXN0YW50LXN0YWdpbmciLCJpYXQiOjE3NzY1OTQxOTMsImV4cCI6MTgwODEzMDE5M30.JE_s0mTvhY3tl-kTOpBckgoE3sp6mdvXs83JLFWlHh8'
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }

  // 添加基础 header
  config.header = {
    'Content-Type': 'application/json',
    ...config.header
  }
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response

  if (statusCode === 200) {
    // 统一处理业务逻辑
    if (data.code === 0) {
      return Promise.resolve(data)
    } else {
      // 业务错误处理
      return Promise.reject({
        code: data.code,
        message: data.message,
        data: data.data
      })
    }
  } else {
    // HTTP 错误处理
    return Promise.reject({
      code: statusCode,
      message: `HTTP错误: ${statusCode}`,
      data: null
    })
  }
}

// 错误处理
const errorHandler = (error) => {
  console.error('请求错误:', error)

  // Token 过期处理
  if (error.code === 1003 || error.code === 1002) {
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    })
    // 跳转到登录页
    uni.navigateTo({
      url: '/pages/login/index'
    })
  }

  return Promise.reject(error)
}

// 核心请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 应用请求拦截器
    const config = requestInterceptor(options)
    
    const fullUrl = BASE_URL + config.url
    console.log('API请求:', {
      url: fullUrl,
      method: config.method,
      data: config.data,
      headers: config.header
    })

    uni.request({
      url: fullUrl,
      method: config.method || 'GET',
      data: config.data,
      header: config.header,
      timeout: TIMEOUT,
      // 添加跨域相关配置
      withCredentials: false, // 不携带cookie，避免CORS问题
      success: (response) => {
        console.log('API响应:', {
          statusCode: response.statusCode,
          data: response.data,
          header: response.header
        })
        responseInterceptor(response)
          .then(resolve)
          .catch(reject)
      },
      fail: (error) => {
        console.error('API请求失败:', error)
        errorHandler(error).catch(reject)
      }
    })
  })
}

// SSE 流式请求（用于AI对话）
const sseRequest = (url, data, onMessage, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    // 应用请求拦截器（包含写死的token）
    const config = requestInterceptor({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'Accept': 'text/event-stream' // 使用SSE格式
      }
    })
    
    uni.request({
      url: BASE_URL + url,
      method: 'POST',
      data: data,
      header: config.header,
      success: (response) => {
        if (response.statusCode === 200) {
          // 处理SSE流式响应
          if (typeof onMessage === 'function') {
            // 解析SSE格式的响应
            const sseEvents = parseSSEResponse(response.data)
            let fullResponse = ''
            
            // 处理每个token事件
            sseEvents.forEach(event => {
              if (event.event === 'token' && event.data && event.data.content) {
                // 累积内容
                fullResponse += event.data.content
                // 实时更新显示
                onMessage(fullResponse)
              }
            })
            
            // 查找done事件获取完整数据
            const doneEvent = sseEvents.find(event => event.event === 'done')
            const finalData = doneEvent ? doneEvent.data : { full_response: fullResponse }
            
            if (typeof onComplete === 'function') {
              onComplete(finalData)
            }
            resolve(finalData)
          } else {
            resolve(response.data.data)
          }
        } else {
          reject(new Error(`HTTP错误: ${response.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

// 解析SSE响应格式
const parseSSEResponse = (responseData) => {
  const events = []
  
  // 如果是字符串，解析SSE格式
  if (typeof responseData === 'string') {
    const lines = responseData.split('\n')
    let currentEvent = {}
    
    for (const line of lines) {
      if (line.startsWith('event:')) {
        // 新事件开始
        if (currentEvent.event) {
          events.push(currentEvent)
        }
        currentEvent = { event: line.substring(6).trim() }
      } else if (line.startsWith('data:') && currentEvent.event) {
        const dataStr = line.substring(5).trim()
        if (dataStr) {
          try {
            currentEvent.data = JSON.parse(dataStr)
          } catch (e) {
            console.warn('SSE数据解析失败:', e, dataStr)
          }
        }
      } else if (line.trim() === '' && currentEvent.event) {
        // 空行表示事件结束
        if (currentEvent.event) {
          events.push(currentEvent)
          currentEvent = {}
        }
      }
    }
    
    // 添加最后一个事件
    if (currentEvent.event) {
      events.push(currentEvent)
    }
  }
  
  return events
}

// 流式聊天请求（简化版，直接返回完整响应）
const streamChat = async (url, data) => {
  try {
    const response = await request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return response
  } catch (error) {
    throw error
  }
}

// 导出请求方法
export default {
  // 基础请求方法
  get: (url, params = {}) => request({ url, method: 'GET', data: params }),
  post: (url, data = {}) => request({ url, method: 'POST', data }),
  put: (url, data = {}) => request({ url, method: 'PUT', data }),
  delete: (url, data = {}) => request({ url, method: 'DELETE', data }),

  // SSE 请求
  sse: sseRequest,

  // 工具方法
  setBaseUrl: (url) => { BASE_URL = url },
  getBaseUrl: () => BASE_URL,
  
  // 开发环境设置代理
  setDevProxy: () => {
    // 在HBuilder中运行时设置代理路径
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      BASE_URL = '/api'
    }
  }
}