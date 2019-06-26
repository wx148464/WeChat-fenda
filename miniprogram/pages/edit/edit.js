// miniprogram/pages/edit/edit.js
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    image: "",
    text: ''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  toSubmit() {
    wx.cloud.init()
    let _this = this
    let path = this.data.image
    let timestamp = Date.parse(new Date());
    const cloudPath = 'images'+timestamp + path.match(/\.[^.]+?$/)[0]
    let fileID = ''
    wx.cloud.uploadFile({
      cloudPath,
      filePath: path, // 文件路径
    }).then(res => {
      // get resource ID
      console.log(res.fileID)
      let voice = wx.cloud.database().collection('my-voice')
      voice.add({
        data: {
          date: wx.cloud.database().serverDate(),
          image: res.fileID,
          text: _this.data.text
        },
        success: res => {
          console.log(res)
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }).catch(error => {
      console.log(error)
      // handle error
    })
  },

  upLoadImage() {
    let that = this
    wx.chooseImage({
      success: function(res) {
        console.log(res)
        count: 9;
        console.log(res.tempFilePaths)
        that.setData({
          image: res.tempFilePaths[0],
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  start: function () {
    //开始录音
    var options = {
      duration: 10000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    }
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },
  stop: function () {
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const { tempFilePath } = res
    })
  },
  play: function () {
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
})