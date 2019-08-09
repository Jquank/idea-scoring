//app.js
App({
    onLaunch: function() {
        wx.onSocketOpen(res => {
            console.log('socket连接成功！')
            this.globalData.wsConn = true
        })
        wx.onSocketError(res => {
            console.log('socket连接出错！')
            this.globalData.wsConn = false
            this.globalData.wsErrorCount++
            var t = wx.getStorageSync('Token')
            if (this.globalData.wsErrorCount < 3) {
                wx.connectSocket({
                    url: `wss://pingfen.cxmx90.com/HandlerSocket.ashx?userKey=${t}`
                })
            }
        })
        wx.onSocketClose(res => {
            console.log('socket断开连接')
            this.globalData.wsConn = false
            this.globalData.wsCloseCount++
            var t = wx.getStorageSync('Token')
            if (this.globalData.wsCloseCount < 3) {
                wx.connectSocket({
                    url: `wss://pingfen.cxmx90.com/HandlerSocket.ashx?userKey=${t}`
                })
            }
        })
    },
    onHide() {
        if (this.globalData.wsConn) {
            wx.closeSocket({
                resson: '退出程序，关闭socket'
            })
        }
    },
    onError() {
        if (this.globalData.wsConn) {
            wx.closeSocket({
                resson: '程序出错，关闭socket'
            })
        }
    },
    globalData: {
        userInfo: {},
        wsErrorCount: 0,
        wsCloseCount: 0
    }
})
