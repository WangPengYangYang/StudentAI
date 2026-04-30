
// const BASE_URL = '/api/v1'  // H5环境使用代理
const BASE_URL = 'https://pre.schoolmate.website/api/v1'  // 小程序等环境使用完整域名
// #endif
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOjEsInRpZXIiOiJmcmVlIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwiaXNzIjoic3R1ZHktYXNzaXN0YW50LXN0YWdpbmciLCJpYXQiOjE3NzY1OTQxOTMsImV4cCI6MTgwODEzMDE5M30.JE_s0mTvhY3tl-kTOpBckgoE3sp6mdvXs83JLFWlHh8'

const request = (options) => {
  return new Promise((resolve, reject) => {
    const config = {
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        ...options.header
      },
      timeout: 30000
    }

    uni.request({
      ...config,
      success: (response) => {
        if (response.statusCode === 200 && response.data.code === 0) {
          resolve(response.data)
        } else {
          reject(response.data || { code: response.statusCode, message: '请求失败' })
        }
      },
      fail: reject
    })
  })
}

// SSE流式请求
const sseRequest = (url, data, onMessage, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    const config = {
      url: BASE_URL + url,
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'text/event-stream'
      }
    }

    uni.request({
      ...config,
      success: (response) => {
        if (response.statusCode === 200) {
          try {
            // 解析SSE格式响应
            const events = parseSSEResponse(response.data)
            let fullResponse = ''
            
            events.forEach(event => {
              if (event.event === 'token' && event.data && event.data.content) {
                fullResponse += event.data.content
                onMessage && onMessage(fullResponse)
              }
            })
            
            const doneEvent = events.find(event => event.event === 'done')
            const finalData = doneEvent ? doneEvent.data : { full_response: fullResponse }
            
            onComplete && onComplete(finalData)
            resolve(finalData)
          } catch (error) {
            onError && onError(error)
            reject(error)
          }
        } else {
          const error = new Error(`HTTP错误: ${response.statusCode}`)
          onError && onError(error)
          reject(error)
        }
      },
      fail: (error) => {
        onError && onError(error)
        reject(error)
      }
    })
  })
}

// 解析SSE响应
const parseSSEResponse = (responseData) => {
  const events = []
  if (typeof responseData === 'string') {
    const lines = responseData.split('\n')
    let currentEvent = {}
    
    for (const line of lines) {
      if (line.startsWith('event:')) {
        if (currentEvent.event) events.push(currentEvent)
        currentEvent = { event: line.substring(6).trim() }
      } else if (line.startsWith('data:') && currentEvent.event) {
        const dataStr = line.substring(5).trim()
        if (dataStr) {
          try {
            currentEvent.data = JSON.parse(dataStr)
          } catch (e) {
            console.warn('SSE数据解析失败:', e)
          }
        }
      } else if (line.trim() === '' && currentEvent.event) {
        if (currentEvent.event) {
          events.push(currentEvent)
          currentEvent = {}
        }
      }
    }
    if (currentEvent.event) events.push(currentEvent)
  }
  return events
}

export default {
  get: (url, params) => request({ url, data: params }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
  sse: sseRequest
}