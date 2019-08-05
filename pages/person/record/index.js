import { get } from '../../../utils/http'
import { config } from '../../../config'
// pages/person/record/index.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        url: config.api_url
    },
    getRecord() {
        get('api/WxOpen/GetProjectAllScore').then(res => {
            if (res.flag) {
                get('api/WxOpen/GetProjectList', { page: 1, rows: 50, searchtxt: '' }).then(res => {
                    if (res.flag) {
                        var d = res.msg
                        d.sort((a, b) => b.Score - a.Score)
                        this.setData({
                            list: d
                        })
                    }
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getRecord()
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
