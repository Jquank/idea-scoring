//index.js
import { get, post } from '../../utils/http'
import { config } from '../../config'
//获取应用实例
const app = getApp()
Page({
    data: {
        url: config.api_url,
        time: 900,
        timer: null,
        isStart: false,
        adminAuth: false,
        scoreStatus: {
            wait: '还未开始，请等待...',
            active: '点击开始评分'
        },
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        startBtn: false,
        closeBtn: false,
        showList: true,
        proList: [],
        proId: '', // admin选择
        isJoin: false,
        projectId: '' // 评委获取
    },
    handleClickStart() {
        wx.navigateTo({
            url: '../score/index'
        })
    },
    rpx(num) {
        return (num * app.globalData.windowWidth) / 375 || num
    },
    // 绘制圆圈
    drawCircle(ctx, x, y, r, s, e, color, lineWidth) {
        ctx.beginPath()
        ctx.arc(x, y, r, s, e)
        ctx.setFillStyle(color)
        ctx.fill()
        if (lineWidth) {
            ctx.setLineWidth(lineWidth)
            ctx.setStrokeStyle('#fff')
            ctx.stroke()
        }
    },
    // 绘制文本
    drawText(ctx, text) {
        ctx.beginPath()
        ctx.setFontSize(20)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')
        ctx.fillText(text, 0, 0)
    },
    // 绘制倒计时
    countDown(ctx, num, time, interval, starDeg, deg) {
        this.data.timer = setInterval(() => {
            num++
            this.data.time--
            this.drawCircle(ctx, 0, 0, 38, starDeg + num * deg, starDeg + (num + 1) * deg, '#fff', 8)
            this.drawCircle(ctx, 0, 0, 30, 0, 2 * Math.PI, 'blue', 0)
            this.drawText(ctx, this.data.time)
            ctx.draw(true)
            if (this.data.time === 0) {
                var _this = this
                get('api/WxOpen/GetProjectScore', { peojectoid: this.data.proId }).then(res => {
                    wx.showModal({
                        content: '投票倒计时结束',
                        showCancel: false,
                        success(res) {
                            if (res.confirm) {
                                _this.getProList()
                                this.getTicketTime()
                                ctx.clearRect(-_this.rpx(100), -_this.rpx(100), _this.rpx(200), _this.rpx(200))
                                _this.setData({
                                    showList: true,
                                    startBtn: false
                                })
                            }
                        }
                    })
                })
                clearInterval(this.data.timer)
            }
        }, interval)
    },
    // 开始绘制
    initDraw(flag) {
        var num = -1
        var time = this.data.time
        var starDeg = 1.5 * Math.PI
        var deg = (2 * Math.PI) / time
        var interval = 1000
        const ctx = wx.createCanvasContext('canvas')
        ctx.translate(this.rpx(100), this.rpx(100))
        this.drawCircle(ctx, 0, 0, 50, 0, 2 * Math.PI, 'yellow', 0)
        this.drawCircle(ctx, 0, 0, 46, 0, 2 * Math.PI, 'red', 0)
        this.drawCircle(ctx, 0, 0, 30, 0, 2 * Math.PI, 'blue', 0)
        this.drawText(ctx, time)
        ctx.draw()
        if (flag) {
            this.countDown(ctx, num, time, interval, starDeg, deg)
        }
    },
    // 管理员点击开始评分
    adminStart() {
        if (app.globalData.wsConn) {
            post('api/WxOpen/PostStar', { ProjiectOid: this.data.proId, Minutes: 15 }).then(res => {
                if (res.flag) {
                    this.setData({
                        startBtn: true
                    })
                    var msg = {
                        msg: '开始评分',
                        proId: this.data.proId
                    }
                    var d = JSON.stringify(msg)
                    wx.sendSocketMessage({
                        data: d
                    })
                    this.initDraw(true)
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        } else {
            wx.showToast({
                title: 'socket连接出错',
                icon: 'none',
                duration: 2000
            })
        }
    },
    adminEnd() {
        var that = this
        wx.showModal({
            title: '确定结束此项目评分',
            success(res) {
                if (res.confirm) {
                    get('api/WxOpen/GetEndStar', { peojectoid: that.data.proId }).then(res => {
                        if (res.flag) {
                            this.getTicketTime()
                            clearInterval(that.data.timer)
                            that.initDraw(false)
                            wx.showToast({
                                title: '已结束',
                                icon: 'none',
                                duration: 2000,
                                mast: true
                            })
                            var msg = {
                                msg: '结束评分'
                            }
                            var d = JSON.stringify(msg)
                            wx.sendSocketMessage({
                                data: d
                            })
                            setTimeout(() => {
                                that.getProList()
                                that.setData({
                                    showList: true
                                })
                            }, 1000)
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    // 获取项目列表
    getProList() {
        var params = {
            page: 1,
            rows: 50,
            searchtxt: ''
        }
        get('api/WxOpen/GetProjectList', params).then(res => {
            if (res.flag) {
                this.setData({
                    proList: res.msg
                })
            }
        })
    },
    // 获取投票时间
    getTicketTime() {
        get('api/WxOpen/GetTime').then(res => {
            if (res.flag) {
                this.setData({
                    time: Number(res.msg.Value) * 60
                })
            }
        })
    },
    // 获取当前正在投票项目信息
    getDoingProject() {
        get('api/WxOpen/GetDoingProject').then(res => {
            if (res.msg) {
                this.setData({
                    isStart: true
                })
                app.globalData.proId = res.msg.Oid
            } else {
                this.setData({
                    isStart: false
                })
            }
        })
    },
    // 选择项目
    radioChange(e) {
        this.data.proId = e.detail.value
    },
    confirmSelPro() {
        if (!this.data.proId) {
            wx.showToast({
                title: '请选择一个项目',
                icon: 'none',
                duration: 2000
            })
            return
        }
        this.setData({
            showList: false
        })
        setTimeout(() => {
            this.initDraw(false)
        }, 100)
    },
    // 刷新得分
    calcScore() {
        get('api/WxOpen/GetProjectAllScore').then(res => {
            if (res.flag) {
                this.getProList()
            }
        })
    },
    onLoad: function() {
        this.getTicketTime()
        wx.getSystemInfo({
            success: res => {
                app.globalData.windowWidth = res.windowWidth
                wx.login({
                    success: res => {
                        var code = res.code
                        wx.getSetting({
                            success: res => {
                                if (res.authSetting['scope.userInfo']) {
                                    wx.getUserInfo({
                                        success: res => {
                                            var params = Object.assign({}, res.userInfo, { Code: code })
                                            this.getToken(params, res.userInfo)
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
    },
    // 返回此页面，不会触发onReady
    onReady: function() {
        console.log('触发onready')
        this.initDraw()
    },
    onShow: function() {
        this.getDoingProject()
        wx.onSocketMessage(res => {
            console.log(res.data)
            var d = res.data
            var index1 = d.search(/群发消息：{/) + 5
            var index2 = d.search(/,当前时间/)
            var val = JSON.parse(d.slice(index1, index2))
            if (val.msg === '开始评分') {
                this.setData({
                    isStart: true,
                    projectId: val.proId
                })
                app.globalData.proId = val.proId
            }
        })
    },
    getToken(params, obj) {
        post('api/Public/Postopenid', params).then(res => {
            console.log(res)
            if (res.flag) {
                console.log(22222222222)
                console.log(res)
                wx.setStorageSync('Token', res.msg)
                this.getDoingProject()
                if (app.globalData.wsConn) {
                    wx.closeSocket({
                        resson: '连接之前，关闭socket'
                    })
                }
                wx.connectSocket({
                    url: `wss://pingfen.cxmx90.com/HandlerSocket.ashx?userKey=${res.msg}`
                })
                get('api/WxOpen/GetUserinf').then(res => {
                    if (res.flag) {
                        app.globalData.userInfo = Object.assign({}, obj, res.msg)
                        this.setData({
                            userInfo: app.globalData.userInfo,
                            adminAuth: app.globalData.userInfo.voterole === 3,
                            hasUserInfo: true
                        })
                        get('api/QyMpList/GetUpdateQyUserDetail', { openid: res.msg.openid })
                            .then(res => {
                                console.log(33333333)
                                console.log(res)
                                get('api/WxOpen/GetUserinf').then(res => {
                                    console.log(res)
                                    app.globalData.userInfo = Object.assign({}, obj, res.msg)
                                    this.setData({
                                        userInfo: app.globalData.userInfo,
                                        adminAuth: app.globalData.userInfo.voterole === 3,
                                        hasUserInfo: true
                                    })
                                })
                            })
                            .catch(err => {
                                get('api/WxOpen/GetUserinf').then(res => {
                                    app.globalData.userInfo = Object.assign({}, obj, res.msg)
                                    this.setData({
                                        userInfo: app.globalData.userInfo,
                                        adminAuth: app.globalData.userInfo.voterole === 3,
                                        hasUserInfo: true
                                    })
                                })
                            })
                    }
                })
                this.getProList()
            } else {
                wx.setStorageSync('Token', '')
            }
        })
    },
    bindGetUserInfo: function(e) {
        console.log(e)
        var data = e.detail.userInfo
        if (!data) {
            return
        }
        app.globalData.userInfo = data
        this.setData({
            userInfo: data,
            hasUserInfo: true
        })
        wx.login({
            success: res => {
                var code = res.code
                wx.getSetting({
                    success: res => {
                        if (res.authSetting['scope.userInfo']) {
                            wx.getUserInfo({
                                success: res => {
                                    var params = Object.assign({}, res.userInfo, { Code: code })
                                    this.getToken(params, res.userInfo)
                                }
                            })
                        }
                    }
                })
            }
        })
    }
})
