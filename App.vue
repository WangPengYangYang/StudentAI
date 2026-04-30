<script>
	export default {
		globalData: {
			statusBarHeight: 20
		},
		onLaunch: function() {
			console.log('App Launch')
			// 设置状态栏高度
			this.initStatusBarHeight()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			initStatusBarHeight() {
				// 获取系统信息
				const systemInfo = uni.getSystemInfoSync()
				// 状态栏高度（单位：px）
				const statusBarHeight = systemInfo.statusBarHeight || 20
				// 安全区域顶部
				const safeAreaTop = systemInfo.safeArea?.top || statusBarHeight

				// 存储到全局变量
				this.globalData.statusBarHeight = Math.max(statusBarHeight, safeAreaTop)

				console.log('状态栏高度:', this.globalData.statusBarHeight, 'px')
			}
		}
	}
</script>

<style>
	/* 导入全局通用样式 */
	@import './styles/common.css';

	/* 每个页面公共css */
	page {
		/* 状态栏安全区域变量 - 默认47px适配iPhone X系列 */
		--status-bar-height: 47px;
		/* 安全区域顶部 */
		--safe-area-inset-top: env(safe-area-inset-top, 47px);
	}

	/* 针对小程序的额外适配 */
	/* #ifdef MP-WEIXIN */
	page {
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
	}
	/* #endif */
</style>
