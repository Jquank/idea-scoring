import { config } from '../config.js'

const baseRestUrl = config.api_url

export function request(params) {
    wx.showLoading({
        title: '加载中'
    })
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseRestUrl}${params.url}`,
            data: params.data,
            method: params.method || 'GET',
            header: {
                'content-type': 'application/json',
                Token: wx.getStorageSync('Token')
            },
            success: function(res) {
                // if (res.status === 0) {
                wx.hideLoading()
                resolve(res.data)
                // }
            },
            fail: function(err) {
                wx.hideLoading()
                reject(err)
            }
        })
    })
}

export function get(url, data) {
    return request({
        url,
        data
    })
}

export function post(url, data) {
    return request({
        url,
        data,
        method: 'POST'
    })
}
