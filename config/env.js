/**
 * 环境配置
 *
 * 当前仅有一个环境（staging），正式版与测试版共用。
 * 后续接入生产环境时，在此追加 production 配置，并修改 CURRENT_ENV。
 *
 * 注意：
 * - 微信小程序要求所有请求域名必须在「公众平台 → 开发管理 → 服务器域名」中配置
 * - 更换域名后必须同步更新白名单，否则真机请求会被拦截
 */

const ENV_CONFIG = {
  // 开发/体验/正式 共用（暂无独立生产环境）
  staging: {
    baseUrl: 'https://pre.schoolmate.website/api/v1',
    name: '预发布环境'
  }

  // 未来接入生产环境时取消注释并修改 CURRENT_ENV：
  // production: {
  //   baseUrl: 'https://api.schoolmate.website/api/v1',
  //   name: '生产环境'
  // }
}

// 当前生效的环境
const CURRENT_ENV = 'staging'

const config = ENV_CONFIG[CURRENT_ENV]

if (!config) {
  throw new Error(`[config] 未找到环境配置: ${CURRENT_ENV}`)
}

export default {
  env: CURRENT_ENV,
  baseUrl: config.baseUrl,
  envName: config.name,

  // 请求超时（毫秒）
  // AI 对话链路后端最长可达 180s（Premium 层），前端需留足余量
  timeout: 120000,

  // 存储键名
  storageKeys: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    userProfile: 'userProfile'
  }
}
