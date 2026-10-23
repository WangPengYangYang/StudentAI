<template>
  <view class="agreement-container">
    <!-- 顶部导航栏 -->
    <view class="page-header page-header--sticky">
      <text class="page-header__title">{{ pageTitle }}</text>
    </view>

    <scroll-view class="agreement-content page-content" scroll-y="true">
      <view class="content-card">
        <text class="doc-title">{{ pageTitle }}</text>
        <text class="doc-meta">更新日期：2026 年 10 月 23 日</text>
        <text class="doc-meta">生效日期：2026 年 10 月 23 日</text>

        <view class="doc-body">
          <text class="doc-paragraph">{{ content }}</text>
        </view>

        <view class="doc-footer">
          <text class="doc-paragraph">如对本协议有任何疑问，可通过「我的 - 意见反馈」与我们联系。</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
/**
 * 用户协议 / 隐私政策页面
 *
 * 通过路由参数 type 区分：
 *   /pages/agreement/agreement?type=user      → 用户协议
 *   /pages/agreement/agreement?type=privacy   → 隐私政策
 *
 * 当前正文为占位内容，正式发布前需替换为经法务确认的完整条款。
 */
const DOCUMENTS = {
  user: {
    title: '用户协议',
    content: `【占位内容 · 发布前必须替换】

一、协议的接受
在使用本小程序前，请您仔细阅读本协议全部内容。您开始使用本小程序，即表示您已充分理解并同意本协议的全部条款。

二、服务内容
本小程序为用户提供留学选校相关的信息查询、选校方案生成、选校报告生成等服务。具体服务内容以小程序实际提供的功能为准。

三、账号与使用规范
1. 您应妥善保管账号信息，因您自身原因导致账号被他人使用所产生的后果由您自行承担。
2. 您不得利用本小程序从事任何违法违规活动。
3. 您不得以任何方式干扰本小程序的正常运行。

四、知识产权
本小程序内的文字、图片、界面设计、程序代码等内容的知识产权归开发者所有，未经许可不得擅自使用。

五、免责声明
本小程序提供的院校信息、排名数据、选校建议等仅供参考，不构成任何录取承诺。最终录取结果以院校官方决定为准。

六、协议的变更
我们可能根据业务调整或法律法规变化修改本协议，修改后将在小程序内公布。

七、联系我们
如您对本协议有任何疑问，可通过「我的 - 意见反馈」与我们联系。`
  },

  privacy: {
    title: '隐私政策',
    content: `【占位内容 · 发布前必须替换】

我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。本政策说明我们如何收集、使用、存储和保护您的个人信息。

一、我们收集的信息

1. 微信账号信息
当您使用微信一键登录时，我们会获取您的微信 OpenID，用于识别您的账号身份。我们不会获取您的微信昵称、头像等资料，除非您主动授权。

2. 您主动填写的个人信息
在完善个人画像时，您可能会主动填写以下信息：
- 学业背景：就读院校、专业、GPA、年级
- 语言成绩：雅思、托福、GRE、GMAT 分数
- 科研与实习经历
- 留学意向：目标国家、目标专业、预算范围
上述信息用于为您生成个性化的选校方案。

3. 您主动上传的图片
当您更换头像时，我们会读取您从相册选择或拍摄的图片。该图片仅用于展示您的头像。

4. 设备与日志信息
为保障服务稳定运行，我们会记录必要的服务日志，包括访问时间、请求接口、错误信息等。这些日志不包含您的个人身份信息。

二、我们如何收集信息

1. 选中的照片或视频：当您更换头像时，我们会请求访问您的相册，以便您选择图片。
2. 摄像头：当您更换头像时，我们会请求使用摄像头，以便您拍摄照片。
3. 相册（仅写入）：当您长按页面中的图片时，可将图片保存至您的相册。
4. 剪贴板：当您点击「访问官网」时，我们会将院校官网链接复制到您的剪贴板，方便您在浏览器中访问。

我们仅在上述功能被您主动触发时请求相应权限，不会在您未使用相关功能时获取上述信息。

三、我们如何使用信息

1. 为您提供选校方案与选校报告服务
2. 根据您的画像信息进行院校匹配
3. 改进和优化我们的服务
4. 保障账号与服务安全

我们不会将您的个人信息用于上述目的之外的用途。

四、信息的存储

1. 存储地点：您的个人信息存储于中华人民共和国境内的服务器。
2. 存储期限：我们仅在实现本政策所述目的所必需的期限内保留您的个人信息，超出期限后将予以删除或匿名化处理。

五、信息的共享与披露

我们不会主动共享或转让您的个人信息至任何第三方。如存在确需共享的情形，我们会事先征得您的单独同意。

六、您的权利

1. 查阅：您可以在「我的」页面查看您填写的个人信息。
2. 更正：您可以随时修改您填写的画像信息。
3. 删除：您可以通过「我的 - 意见反馈」联系我们删除您的个人信息。
4. 撤回授权：您可以通过小程序右上角「…」-「设置」管理授权信息。

七、未成年人保护

若您是未满 14 周岁的未成年人，请在监护人的陪同和同意下使用本服务。我们不会主动收集未成年人的个人信息。

八、政策更新

我们可能适时更新本政策，更新后的政策将在小程序内公布。若变更可能导致您在本政策下的权利实质性减少，我们会以显著方式通知您。

九、联系我们

如您对本政策有任何疑问、意见或建议，可通过「我的 - 意见反馈」与我们联系。`
  }
}

export default {
  data() {
    return {
      type: 'privacy',
      pageTitle: '隐私政策',
      content: ''
    }
  },

  onLoad(options) {
    const type = (options && options.type) === 'user' ? 'user' : 'privacy'
    const doc = DOCUMENTS[type]
    this.type = type
    this.pageTitle = doc.title
    this.content = doc.content

    // 动态设置导航栏标题
    uni.setNavigationBarTitle({ title: doc.title })
  }
}
</script>

<style scoped>
.agreement-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.agreement-content {
  flex: 1;
  padding: 24rpx 32rpx 60rpx;
  box-sizing: border-box;
}

.content-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.doc-title {
  display: block;
  font-size: 38rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20rpx;
}

.doc-meta {
  display: block;
  font-size: 24rpx;
  color: #999999;
  line-height: 1.8;
}

.doc-body {
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #eeeeee;
}

.doc-paragraph {
  display: block;
  font-size: 28rpx;
  color: #444444;
  line-height: 1.9;
  white-space: pre-wrap;
  word-break: break-word;
}

.doc-footer {
  margin-top: 40rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #eeeeee;
}
</style>
