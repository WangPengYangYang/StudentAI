import request from '../utils/request.js'
const BASE_PATH = ''

/**
 * 认证模块 API
 */
export const authAPI = {
  /**
   * 匿名登录
   * @returns {Promise}
   */
  anonymousLogin: () => request.post(`${BASE_PATH}/auth/anonymous`),

  /**
   * 微信登录
   * @param {string} code - 微信登录 code
   * @returns {Promise}
   */
  wechatLogin: (code) => request.post(`${BASE_PATH}/auth/wechat`, { code }),

  /**
   * Token 刷新
   * @param {string} refreshToken - 刷新 token
   * @returns {Promise}
   */
  refreshToken: (refreshToken) => request.post(`${BASE_PATH}/auth/refresh`, { refresh_token: refreshToken }),
}

/**
 * 用户画像模块 API
 */
export const profileAPI = {
  /**
   * 获取用户画像
   * @returns {Promise}
   */
  getProfile: () => request.get(`${BASE_PATH}/profile`),

  /**
   * 更新学术背景（Step 1）
   * @param {Object} data - 学术背景数据
   * @returns {Promise}
   */
  updateEducation: (data) => request.put(`${BASE_PATH}/profile/step/1`, data),

  /**
   * 更新语言标化（Step 2）
   * @param {Object} data - 语言标化数据
   * @returns {Promise}
   */
  updateLanguage: (data) => request.put(`${BASE_PATH}/profile/step/2`, data),

  /**
   * 更新科研实习（Step 3）
   * @param {Object} data - 科研实习数据
   * @returns {Promise}
   */
  updateExperience: (data) => request.put(`${BASE_PATH}/profile/step/3`, data),

  /**
   * 更新意向偏好（Step 4）
   * @param {Object} data - 意向偏好数据
   * @returns {Promise}
   */
  updatePreference: (data) => request.put(`${BASE_PATH}/profile/step/4`, data),

  /**
   * 获取资料完成度
   * @returns {Promise}
   */
  getCompletion: () => request.get(`${BASE_PATH}/profile/completion`)
}

/**
 * AI 对话模块 API
 */
export const chatAPI = {
  /**
   * 发送消息（SSE 流式）
   * @param {string|null} conversationId - 会话ID，首次传null
   * @param {string} message - 用户消息
   * @param {Function} onMessage - 消息回调
   * @param {Function} onError - 错误回调
   * @param {Function} onComplete - 完成回调
   * @returns {Promise}
   */
  sendMessage: (conversationId, message, onMessage, onError, onComplete) =>
    request.sse(`${BASE_PATH}/chat/send`, { conversation_id: conversationId, message }, onMessage, onError, onComplete),

  /**
   * 获取会话列表
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise}
   */
  getConversations: (page = 1, size = 20) => request.get(`${BASE_PATH}/chat/conversations`, { page, size }),

  /**
   * 获取历史消息
   * @param {string} conversationId - 会话ID
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise}
   */
  getHistory: (conversationId, page = 1, size = 50) => request.get(`${BASE_PATH}/chat/history/${conversationId}`, { page, size }),

  /**
   * 创建新会话
   * @param {string} title - 会话标题
   * @returns {Promise}
   */
  createConversation: (title) => request.post(`${BASE_PATH}/chat/conversations`, { title }),

  /**
   * 删除会话
   * @param {string} conversationId - 会话ID
   * @returns {Promise}
   */
  deleteConversation: (conversationId) => request.delete(`${BASE_PATH}/chat/conversations/${conversationId}`)
}

/**
 * 选校方案模块 API
 */
export const planAPI = {
  /**
   * 生成选校方案
   * @param {string|null} conversationId - 关联对话ID
   * @param {Object} preferences - 偏好设置
   * @returns {Promise}
   */
  generatePlan: (conversationId, preferences) => request.post(`${BASE_PATH}/plan/generate`, {
    conversation_id: conversationId,
    preferences
  }),

  /**
   * 获取当前方案
   * @returns {Promise}
   */
  getCurrentPlan: () => request.get(`${BASE_PATH}/plan/current`),

  /**
   * 获取历史方案列表
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise}
   */
  getPlanList: (page = 1, size = 10) => request.get(`${BASE_PATH}/plan/list`, { page, size }),

  /**
   * 微调方案
   * @param {string} planId - 方案ID
   * @param {string} conversationId - 会话ID
   * @param {string} message - 调整消息
   * @returns {Promise}
   */
  refinePlan: (planId, conversationId, message) => request.post(`${BASE_PATH}/plan/refine`, {
    plan_id: planId,
    conversation_id: conversationId,
    message
  })
}

/**
 * 学校模块 API
 */
export const schoolAPI = {
  /**
   * 获取热门院校列表（全球名校速递）
   * @param {number} limit - 返回数量，默认10，最大20
   * @returns {Promise}
   */
  getTrendingSchools: (limit = 10) => request.get(`${BASE_PATH}/schools/trending`, { limit }),

  /**
   * 获取学校详情
   * @param {number|string} schoolId - 学校ID
   * @returns {Promise}
   */
  getSchoolDetail: (schoolId) => request.get(`${BASE_PATH}/schools/${schoolId}`),

  /**
   * 获取学校列表
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getSchoolList: (params = {}) => request.get(`${BASE_PATH}/schools`, params),

  /**
   * 收藏学校
   * @param {number|string} schoolId - 学校ID
   * @returns {Promise}
   */
  favoriteSchool: (schoolId) => request.post(`${BASE_PATH}/schools/${schoolId}/favorite`),

  /**
   * 取消收藏学校
   * @param {number|string} schoolId - 学校ID
   * @returns {Promise}
   */
  unfavoriteSchool: (schoolId) => request.delete(`${BASE_PATH}/schools/${schoolId}/favorite`),

  /**
   * 获取收藏列表
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise}
   */
  getFavorites: (page = 1, size = 20) => request.get(`${BASE_PATH}/favorites`, { page, size })
}

/**
 * 热门国家模块 API
 */
export const countryAPI = {
  /**
   * 获取热门国家列表
   * @returns {Promise}
   */
  getPopularCountries: () => request.get(`${BASE_PATH}/countries/popular`),

  /**
   * 获取国家学校列表
   * @param {string} countryCode - 国家代码
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getCountrySchools: (countryCode, params = {}) => request.get(`${BASE_PATH}/countries/${countryCode}/schools`, params)
}

/**
 * 用户中心模块 API
 */
export const userAPI = {
  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo: () => request.get(`${BASE_PATH}/user/info`),

  /**
   * 更新用户信息
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  updateUserInfo: (data) => request.put(`${BASE_PATH}/user/info`, data)
}

/**
 * 报告模块 API
 */
export const reportAPI = {
  /**
   * 生成选校报告
   * @param {string} planId - 方案ID
   * @returns {Promise}
   */
  generateReport: (planId) => request.post(`${BASE_PATH}/plan/generate`, {  }),

  /**
   * 获取报告列表
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise}
   */
  getReportList: (page = 1, size = 10) => request.get(`${BASE_PATH}/reports`, { page, size }),

  /**
   * 查看分享报告
   * @param {string} shareCode - 分享码
   * @returns {Promise}
   */
  getShareReport: (shareCode) => request.get(`${BASE_PATH}/reports/share/${shareCode}`)
}

/**
 * 预约咨询模块 API（预留）
 */
export const consultationAPI = {
  /**
   * 预约咨询
   * @param {Object} data - 预约信息
   * @returns {Promise}
   */
  createConsultation: (data) => request.post(`${BASE_PATH}/consultations`, data)
}

/**
 * 工具函数
 */
export const apiUtils = {
  /**
   * 设置基础URL
   * @param {string} url - 基础URL
   */
  setBaseUrl: (url) => request.setBaseUrl(url),

  /**
   * 获取基础URL
   * @returns {string}
   */
  getBaseUrl: () => request.getBaseUrl(),

  /**
   * 处理错误信息
   * @param {Error} error - 错误对象
   * @returns {string} 错误消息
   */
  getErrorMessage: (error) => {
    if (error.message) {
      return error.message
    }
    if (error.code) {
      return `错误代码: ${error.code}`
    }
    return '网络请求失败，请检查网络连接'
  }
}

// 默认导出所有API
export default {
  auth: authAPI,
  profile: profileAPI,
  chat: chatAPI,
  plan: planAPI,
  school: schoolAPI,
  country: countryAPI,
  user: userAPI,
  report: reportAPI,
  consultation: consultationAPI,
  utils: apiUtils
}