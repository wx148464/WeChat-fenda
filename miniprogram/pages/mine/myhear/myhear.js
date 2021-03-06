// miniprogram/pages/mine/hearme/hearme.js
let app = getApp()
let top20userInfo

Page({
  data: {
    hotMasters: [],
    isEmpty:true
  },

  onLoad: function () {
    wx.cloud.init()
    let _this = this
    const userCollection = wx.cloud.database().collection("user")
    const relationCollection = wx.cloud.database().collection("relation")
    const _ = wx.cloud.database().command
    var follow_info = []
    var follow_list = []

    // 获取粉丝列表
    userCollection.where({
      _openid: app.globalData.userInfo._openid
    }).get({
      success: res => {
        follow_list = res.data[0].follow_list
        // 添加页面数据
        userCollection.where({
          _openid: _.in(follow_list)
        }).get({
          success: res => {
            console.log(res)
            follow_info = res.data
            for (var idx in follow_info) {
              _this.setData({
                isEmpty:false
              })
              follow_info[idx].if_follow = true
              this.setData({
                ['hotMasters[' + idx + '].if_follow']: true,
              })
            }
            top20userInfo = follow_info
            _this.setData({
              hotMasters: follow_info
            })
          }
        })
      }
    })
  },

  //跳转函数
  toPerson: function (event) {
    console.log(event)
    var targetUrl = '/pages/person/person?_openid=' + top20userInfo[event.currentTarget.dataset.index]._openid;
    wx.navigateTo({
      url: targetUrl
    })
  },

  handleFollowTap: function (event) {
    // console.log(event)
    this.setData({
      ['hotMasters[' + event.target.dataset.followId + '].if_follow']: true,
      ['hotMasters[' + event.target.dataset.followId + '].fan_num']: this.data.hotMasters[event.target.dataset.followId].fan_num + 1
    })

    // 添加关注关系
    const relationCollection = wx.cloud.database().collection("relation")
    const userCollection = wx.cloud.database().collection("user")
    const _ = wx.cloud.database().command;

    var fan_id = app.globalData.userInfo._openid
    var follow_id = top20userInfo[event.currentTarget.dataset.followId]._openid
    relationCollection.where({
      fan: fan_id,
      follow: follow_id
    }).get().then(res => {
      if (res.data.length == 0) {
        relationCollection.add({
          data: {
            fan: fan_id,
            follow: follow_id
          },
          success: res => {
            console.log(res)
            userCollection.where({
              _openid: fan_id
            }).get().then(fd => {
              userCollection.doc(fd.data[0]._id).update({
                data: {
                  follow_list: _.push(follow_id),
                  follow_num: _.inc(1)
                },
                success: res => {
                  console.log(res)
                  wx.cloud.callFunction({
                    name: 'updateFanList',
                    data: {
                      userInfo: app.globalData.userInfo,
                      follow_id: follow_id
                    },
                    success: res => { console.log(res) }
                  })
                }
              })
            })
          }
        })
      }
    })
  },

  handleNotFollowTap: function (event) {
    // console.log("handle not follow");
    // 注意需要调动后端接口
    var _this = this;
    var _event = event;
    wx.showModal({
      content: '确定要取消关注 ' + event.target.dataset.followName + ' 吗？',
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定');
          _this.setData({
            ['hotMasters[' + event.target.dataset.followId + '].if_follow']: false,
            ['hotMasters[' + event.target.dataset.followId + '].fan_num']: _this.data.hotMasters[event.target.dataset.followId].fan_num - 1
          })
          // 调用服务器接口
          var fan_id = app.globalData.userInfo._openid
          var follow_id = top20userInfo[event.target.dataset.followId]._openid
          const relationCollection = wx.cloud.database().collection("relation")
          const userCollection = wx.cloud.database().collection("user")

          relationCollection.where({
            fan: fan_id,
            follow: follow_id
          }).get().then(res => {
            if (res.data.length > 0) {
              relationCollection.doc(res.data[0]._id).remove({
                success() {
                  console.log("删除relation记录成功")
                  var fan2follow_list = []
                  var fan2follow_num = 0
                  var fan2follow_id = 0
                  userCollection.where({
                    _openid: fan_id
                  }).get({
                    success: fd => {
                      fan2follow_id = fd.data[0]._id
                      fan2follow_list = fd.data[0].follow_list
                      fan2follow_num = fd.data[0].follow_num
                      var index = fan2follow_list.indexOf(follow_id);
                      if (index > -1) {
                        fan2follow_list.splice(index, 1);
                        fan2follow_num--
                        userCollection.doc(fan2follow_id).update({
                          data: {
                            follow_list: fan2follow_list,
                            follow_num: fan2follow_num
                          },
                          success() {
                            console.log("更新粉丝follow列表")
                            wx.cloud.callFunction({
                              name: 'updateFollowList',
                              data: {
                                userInfo: app.globalData.userInfo,
                                follow_id: follow_id
                              },
                              success: res => { console.log(res) }
                            })
                          }
                        })
                      }
                    },
                    fail: res => { console.log(res) }
                  })
                },
                fail() { console.log("数据库关注关系删除失败") }
              })
            }
            else {
              console.log("不存在关注关系")
            }
          })
        } else if (res.cancel) {
          // do nothing
          console.log('用户点击取消');
        }
      }
    })
  },

  onShow() { //返回显示页面状态函数
    //可以进行局部优化
    this.onLoad()//再次加载，实现返回上一页页面刷新
  }
})