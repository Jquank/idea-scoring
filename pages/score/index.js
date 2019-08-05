import { get, post } from '../../utils/http'

const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        majorScore: true,
        projectScore: false,
        complete: 0,
        experience: 0,
        systemShow: 0,
        canVote: true,
        proInfo: {},
        endTime: '',
        timer: null
    },
    tow(n) {
        return n >= 0 && n < 10 ? '0' + n : '' + n
    },
    getDate(t) {
        var oDate = new Date()
        var oldTime = oDate.getTime()
        var newDate = new Date(t)
        var newTime = newDate.getTime()
        if (newTime - oldTime <= 0) {
            this.setData({
                canVote: false
            })
            clearInterval(this.data.timer)
            setTimeout(() => {
                wx.reLaunch({
                    url: '/pages/index/index'
                })
            }, 1000)
            return '投票时间已结束'
        }
        var second = Math.floor((newTime - oldTime) / 1000)
        var day = Math.floor(second / 86400)
        second = second % 86400
        var hour = Math.floor(second / 3600)
        second %= 3600
        var minute = Math.floor(second / 60)
        second %= 60
        var str = '剩余：' + this.tow(minute) + '分' + this.tow(second) + '秒'
        return str
    },
    submitScore: function() {
        var allPoints = this.data.complete + this.data.experience + this.data.systemShow
        wx.showModal({
            title: '确认提交此次评分？',
            success(res) {
                if (res.confirm) {
                    post('api/WxOpen/PostProjectCast', { Point: allPoints, ProjiectOid: app.globalData.proId }).then(
                        res => {
                            console.log(res)
                            if (res.flag) {
                                wx.showToast({
                                    title: '打分成功',
                                    icon: 'success',
                                    duration: 2000,
                                    mast: true
                                })
                                setTimeout(() => {
                                    wx.reLaunch({
                                        url: '/pages/index/index'
                                    })
                                }, 2000)
                            } else {
                                wx.showToast({
                                    title: res.msg,
                                    icon: 'none',
                                    duration: 2000,
                                    mast: true
                                })
                                setTimeout(() => {
                                    wx.reLaunch({
                                        url: '/pages/index/index'
                                    })
                                }, 2000)
                            }
                        }
                    )
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    change(e) {
        this.setData({
            [e.currentTarget.dataset.mark]: e.detail.value
        })
    },
    getProjiectDetail() {
        get('api/WxOpen/GetProjectDetail', { peojectoid: app.globalData.proId }).then(res => {
            // get('api/WxOpen/GetProjectDetail', { peojectoid: 9 }).then(res => {
            if (res.flag) {
                this.data.timer = setInterval(() => {
                    var str = this.getDate(res.msg.EndTime.replace(/-/g, '/'))
                    this.setData({
                        endTime: str
                    })
                }, 1000)
                this.setData({
                    proInfo: res.msg
                })
            }
        })
    },
    // 给TA投票
    vote() {
        post('api/WxOpen/PostProjectCast', { Point: 1, ProjiectOid: app.globalData.proId }).then(res => {
            if (res.flag) {
                wx.showToast({
                    title: '投票成功',
                    icon: 'success',
                    duration: 2000,
                    mast: true
                })
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    })
                }, 2000)
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 2000,
                    mast: true
                })
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    })
                }, 2000)
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getProjiectDetail()
        this.setData({
            majorScore: app.globalData.userInfo.voterole === 2 || app.globalData.userInfo.voterole === 1
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

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
    onShareAppMessage: function() {}
})
