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
        })
        wx.onSocketClose(res => {
            console.log('socket断开连接')
            this.globalData.wsConn = false
        })
    },
    onHide() {
        wx.closeSocket({
            resson: '退出程序，关闭socket'
        })
    },
    onError() {
        wx.closeSocket({
            resson: '程序出错，关闭socket'
        })
    },
    globalData: {
        userInfo: {}
    }
})
