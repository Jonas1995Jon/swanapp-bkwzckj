// pages/me/wechatService/wechatService.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '客服微信'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  copyTextClick: function (event) {
    var text = event.currentTarget.dataset.hi;
    swan.setClipboardData({
      data: text,
      success: function (res) {
        swan.showToast({
          title: '复制成功！',
          icon: 'succes',
          duration: 1000,
          mask: true
        });
      }
    });
  },

  saveWechatImage: function () {
    swan.downloadFile({
      url: 'https://imgcdn.cnbkw.com/ws_wechat.png',
      type: 'image',
      success: function (res) {
        let tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        swan.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            swan.showToast({
              title: '保存图片成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            // wx.scanCode({
            //   success: (res) => {
            //     console.log(res)
            //   }
            // });
            // // 允许从相机和相册扫码
            // wx.scanCode({
            //   success: (res) => {
            //     console.log(res)
            //   }
            // })
          },
          fail: function (res) {
            swan.getSetting({
              success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                  swan.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success() {
                      console.log('授权成功');
                    }
                  });
                }
              }
            });
            console.log("保存图片失败");
            console.log(res);
          }
        });
        console.log("download success");
      },
      fail: function (res) {
        console.log(res);
      }
    });
    // wx.chooseImage({
    //   success: function (res) {
    //     var tempFilePaths = res.tempFilePaths
    //     wx.saveImageToPhotosAlbum({
    //       filePath: tempFilePaths[0],
    //       success: function (res) {

    //       }
    //     })
    //   }
    // })
    // wx.onUserCaptureScreen(function (res) {
    //   console.log('用户截屏了')
    //   // 允许从相机和相册扫码
    //   wx.scanCode({
    //     success: (res) => {
    //       console.log("截屏 success");
    //       console.log(res)
    //     },
    //     fail: function (res) {
    //       console.log("截屏 fail");
    //     },
    //   })

    // })
    // wx.downloadFile({
    //   url: 'http://imgcdn.cnbkw.com/mainmaster/pageimg/index/new_bkwlogo.94440c52.png',
    //   type: 'image',
    //   success: function (res) {
    //     let tempFilePath = res.tempFilePath;
    //     console.log(tempFilePath)
    //     wx.saveImageToPhotosAlbum({
    //       filePath: '../../../image/me/ws_wechat.png',
    //       success(res) {
    //         // 允许从相机和相册扫码
    //         wx.scanCode({
    //           success: (res) => {
    //             console.log(res)
    //           }
    //         })
    //       },
    //       fail: function (res) {
    //         console.log("保存图片失败");
    //       }
    //     })
    //     console.log("download success");
    //   },
    //   fail: function (res) {
    //     console.log("download fail");
    //   },
    //   complete: function (res) {
    //     console.log("download complete");
    //   }
    // })

    // // 只允许从相机扫码
    // wx.scanCode({
    //   onlyFromCamera: true,
    //   success: (res) => {
    //     console.log(res)
    //   }
    // })
    // wx.showToast({
    //   title: '长按事件响应成功',
    //   icon: 'succes',
    //   duration: 1000,
    //   mask: true
    // })
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});