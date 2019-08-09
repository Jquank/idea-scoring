const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        imgPath: ''
    },
    createImg() {
        var that = this
        console.log(3333333)
        wx.getSetting({
            success(res) {
                console.log(444444)
                wx.saveImageToPhotosAlbum({
                    filePath: that.data.imgPath,
                    success(res) {
                        wx.showModal({
                            content: '图片已保存到相册，赶紧晒一下吧~',
                            showCancel: false,
                            confirmText: '好的',
                            confirmColor: '#333'
                        })
                    },
                    fail(res) {
                        console.log(res)
                    }
                })
                if (res.authSetting['scope.writePhotosAlbum']) {
                    console.log(555555)
                }
            }
        })
    },
    viewRecord() {
        wx.navigateTo({
            url: '/pages/person/record/index'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            userInfo: app.globalData.userInfo
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this
        var ctx = wx.createCanvasContext('canvas')
        wx.downloadFile({
            url: 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png',
            success: function(res) {
                console.log(res)
                if (res.statusCode === 200) {
                    var img = res.tempFilePath
                    console.log(1111111)
                    console.log(img)
                    ctx.drawImage(img, 0, 0, 250, 100)
                    ctx.draw()
                    setTimeout(() => {
                        wx.canvasToTempFilePath({
                            x: 0,
                            y: 0,
                            width: 350,
                            height: 250,
                            destWidth: 100,
                            destHeight: 100,
                            canvasId: 'canvas',
                            success(res) {
                                console.log(2222222)
                                console.log(res.tempFilePath)
                                that.data.imgPath = res.tempFilePath
                            },
                            fail(res) {
                                console.log(res)
                            }
                        })
                    }, 1000)
                } else {
                    wx.showToast({
                        title: '头像下载失败！',
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail(res) {
                console.log(res)
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(options) {
        var shareObj = {
            title: '开发大赛评分',
            path: '/pages/index/index'
        }
        return shareObj
    }
})
