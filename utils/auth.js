/**
 * 登录态工具
 *
 * 用于"免登录浏览 + 按需引导登录"模式：
 * - 未登录用户可以浏览公开内容
 * - 触发需要登录的功能时，才提示并跳转登录页
 */

import config from '../config/env.js'

const TOKEN_KEY = config.storageKeys.accessToken

/** 是否已登录 */
export function isLoggedIn() {
  return !!uni.getStorageSync(TOKEN_KEY)
}

/**
 * 是否需要登录才能继续。
 * 未登录时弹出确认框，用户确认后跳转登录页。
 *
 * @param {string} message 提示文案，说明为什么需要登录
 * @returns {boolean} true = 已登录，可继续；false = 未登录，已引导
 */
export function requireLogin(message = '该功能需要登录后使用') {
  if (isLoggedIn()) return true

  uni.showModal({
    title: '需要登录',
    content: message,
    confirmText: '去登录',
    cancelText: '再看看',
    confirmColor: '#07C160',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/index/index' })
      }
    }
  })

  return false
}

export default {
  isLoggedIn,
  requireLogin
}
