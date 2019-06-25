// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID,
    APPID,
    UNIONID,
    ENV,
  } = cloud.getWXContext()
  const userCollection = cloud.database().collection('user')
  const userInfo = event.userInfo
  const result = userCollection.where({
    openid: OPENID,
  })

  // 判断用户是否存在
  try{
    await userCollection.where({
      openid: OPENID,
    }).get({
      success: res => {
        if (res.length > 0) {
          // 不存在则添加用户
          userCollection.add({
            data: {
              avatarUrl: userInfo.avatarUrl,
              desc: userInfo.desc,
              fan_list: [],
              fan_num: 0,
              follow_list: [],
              follow_num: 0,
              nickName: userInfo.nickName,
              openid: OPENID
            }, success: res => {
              console.log(res)
            }, fail: err => {
              console.log(err)
            }
          })
        }
      }
    }
    )
  } catch(e){
    console.error(e)
  }
  
  return {
    event,
    openid: OPENID,
    appid: APPID,
    unionid: UNIONID,
  }
}