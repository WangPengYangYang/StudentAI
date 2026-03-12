# API 接口使用说明

## 概述

本文件提供了留学选校Agent项目的网络接口使用说明，基于前端联调接口文档v1.0实现。

## 快速开始

### 1. 导入API模块

```javascript
import api from '@/api/index.js'
```

### 2. 配置基础URL

在项目启动时设置API基础URL：

```javascript
// 在 main.js 或 App.vue 中设置
api.utils.setBaseUrl('https://your-api-domain.com/api/v1')
```

### 3. 基本使用示例

```javascript
// 匿名登录
const authResult = await api.auth.anonymousLogin()

// 获取用户信息
const userInfo = await api.user.getUserInfo()

// 生成选校方案
const plan = await api.plan.generatePlan(null, {
  target_countries: ['US'],
  target_majors: ['Computer Science']
})
```

## 模块说明

### 认证模块 (authAPI)

- `anonymousLogin()` - 匿名登录
- `wechatLogin(code)` - 微信登录
- `refreshToken(refreshToken)` - Token刷新

### 用户画像模块 (profileAPI)

- `getProfile()` - 获取用户画像
- `updateEducation(data)` - 更新学术背景
- `updateLanguage(data)` - 更新语言标化
- `updateExperience(data)` - 更新科研实习
- `updatePreference(data)` - 更新意向偏好
- `getCompletion()` - 获取资料完成度

### AI对话模块 (chatAPI)

- `sendMessage(conversationId, message, onMessage, onError, onComplete)` - 发送消息(SSE)
- `getConversations(page, size)` - 获取会话列表
- `getHistory(conversationId, page, size)` - 获取历史消息
- `createConversation(title)` - 创建新会话
- `deleteConversation(conversationId)` - 删除会话

### 选校方案模块 (planAPI)

- `generatePlan(conversationId, preferences)` - 生成选校方案
- `getCurrentPlan()` - 获取当前方案
- `getPlanList(page, size)` - 获取历史方案列表
- `refinePlan(planId, conversationId, message)` - 微调方案

### 学校模块 (schoolAPI)

- `getSchoolDetail(schoolId)` - 获取学校详情
- `getSchoolList(params)` - 获取学校列表
- `favoriteSchool(schoolId)` - 收藏学校
- `unfavoriteSchool(schoolId)` - 取消收藏
- `getFavorites(page, size)` - 获取收藏列表

### 热门国家模块 (countryAPI)

- `getPopularCountries()` - 获取热门国家列表
- `getCountrySchools(countryCode, params)` - 获取国家学校列表

### 用户中心模块 (userAPI)

- `getUserInfo()` - 获取用户信息
- `updateUserInfo(data)` - 更新用户信息

### 报告模块 (reportAPI)

- `generateReport(planId)` - 生成选校报告
- `getReportList(page, size)` - 获取报告列表
- `getShareReport(shareCode)` - 查看分享报告

## 登录流程示例

### 微信登录流程

```javascript
// 1. 获取微信登录code
const loginRes = await new Promise((resolve, reject) => {
  uni.login({
    provider: 'weixin',
    success: resolve,
    fail: reject
  });
});

// 2. 调用后端微信登录接口
const result = await api.auth.wechatLogin(loginRes.code);

// 3. 保存认证信息
uni.setStorageSync('access_token', result.data.access_token);
uni.setStorageSync('refresh_token', result.data.refresh_token);
uni.setStorageSync('user_info', result.data.user);
```

### 匿名登录流程

```javascript
// 1. 匿名登录
const result = await api.auth.anonymousLogin();

// 2. 保存认证信息
uni.setStorageSync('access_token', result.data.access_token);
uni.setStorageSync('session_id', result.data.session_id);
```

## 错误处理

### 统一错误处理

```javascript
try {
  const result = await api.auth.wechatLogin(code);
} catch (error) {
  // 使用统一的错误消息处理
  const errorMessage = api.utils.getErrorMessage(error);
  uni.showToast({
    title: errorMessage,
    icon: 'none'
  });
  
  // 特殊错误处理
  if (error.code === 1003) { // Token过期
    // 跳转到登录页
    uni.navigateTo({ url: '/pages/index/index' });
  }
}
```

### Token自动管理

网络请求封装会自动处理Token的添加和刷新：

- 请求时自动添加 `Authorization: Bearer <token>` 头
- Token过期时自动跳转到登录页

## SSE流式响应处理

### AI对话流式响应

```javascript
// 发送消息并处理流式响应
await api.chat.sendMessage(
  conversationId,
  message,
  // onMessage回调 - 实时接收消息片段
  (content) => {
    console.log('收到消息片段:', content);
    // 实时更新UI显示
    this.updateChatContent(content);
  },
  // onError回调
  (error) => {
    console.error('SSE错误:', error);
  },
  // onComplete回调
  () => {
    console.log('消息接收完成');
  }
);
```

## 数据格式示例

### 用户画像数据格式

```javascript
// 学术背景数据
const educationData = {
  education_level: 'bachelor',
  school_name: '清华大学',
  major: '计算机科学与技术',
  gpa: 3.75,
  gpa_scale: '4.0'
};

// 语言标化数据
const languageData = {
  toefl: 105,
  ielts: 7.5,
  gre: 325,
  gmat: null
};

// 意向偏好数据
const preferenceData = {
  target_countries: ['US', 'UK', 'CA'],
  target_majors: ['Computer Science', 'Data Science'],
  target_degree: 'master',
  budget_range: '30-50w/year',
  career_goal: '互联网大厂技术专家'
};
```

### 选校偏好数据格式

```javascript
const preferences = {
  target_countries: ['US'],
  target_majors: ['Computer Science'],
  budget_range: '30-50w/year'
};
```

## 配置说明

### 环境配置

建议在不同环境中使用不同的API地址：

```javascript
// 开发环境
if (process.env.NODE_ENV === 'development') {
  api.utils.setBaseUrl('https://dev-api.example.com/api/v1');
} 
// 生产环境
else {
  api.utils.setBaseUrl('https://api.example.com/api/v1');
}
```

### 超时配置

默认超时时间为30秒，可在 `utils/request.js` 中修改：

```javascript
const TIMEOUT = 30000; // 30秒
```

## 常见问题

### Q: 如何测试API接口？
A: 使用 `api/test-api.js` 文件进行接口验证：

```javascript
import runAllTests from '@/api/test-api.js';
runAllTests();
```

### Q: Token过期如何处理？
A: 网络请求会自动检测Token过期并跳转到登录页，无需手动处理。

### Q: 如何查看完整的API文档？
A: 参考 `api/前端联调接口文档.md` 文件获取详细的接口说明。

### Q: SSE流式响应在uni-app中如何实现？
A: 由于uni-app对SSE支持有限，我们提供了兼容方案。实际使用时可能需要根据后端SSE实现进行调整。

## 文件结构

```
api/
├── index.js              # 主要API接口定义
├── usage-example.js      # 使用示例
├── test-api.js           # 测试验证
├── README.md             # 使用说明
└── 前端联调接口文档.md     # 接口规范

utils/
└── request.js            # 网络请求封装
```

## 技术支持

如有问题，请参考接口文档或联系开发团队。