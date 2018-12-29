// pages/course/buyCourse/productsList/productsList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '购买课程'
    },
    productsList: '',
    selectedIndex: 0,
    orderPrice: 0.00,
    courselistItem: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var products = JSON.parse(options.products);
    var courselistItem = JSON.parse(options.courselistItem);
    var price;
    for (var i = 0; i < products.list.length; i++) {
      price = products.list[i].price;
      products.list[i].price = price.substr(0, price.indexOf(".") + 3);
      if (i == 0) {
        products.list[i]['show'] = false;
      } else {
        products.list[i]['show'] = true;
      }
    }
    this.setData({ orderPrice: products.list[0].price });
    this.setData({ productsList: products.list });
    this.setData({ courselistItem: courselistItem });
  },

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
  classTypeClick(e) {
    var index = e.currentTarget.dataset.index;
    if (this.data.selectedIndex != index) {
      var productsList = this.data.productsList;
      for (var i = 0; i < productsList.length; i++) {
        if (i == index) {
          productsList[i].show = false;
        } else {
          productsList[i].show = true;
        }
      }
      this.setData({ selectedIndex: index });
      this.setData({ orderPrice: productsList[index].price });
      this.setData({ productsList: productsList });
    }
  },
  sureOrderClick() {
    var index = this.data.selectedIndex;
    var commodityid = this.data.productsList[index].id;
    var courselistItem = this.data.courselistItem;
    var productsList = this.data.productsList;
    var coursePackage = {
      coursename: courselistItem.title,
      courseid: courselistItem.id,
      categoryid: courselistItem.categoryid,
      coursetype: productsList[index].banxing,
      price: productsList[index].price,
      studytime: productsList[index].studytime
    };
    var classType = this.data.productsList[index].title;
    var price = this.data.productsList[index].price;
    var url = '../buyCourse?commodityid=' + commodityid + '&coursePackage=' + JSON.stringify(coursePackage) + '&classType=' + classType + '&price=' + price;
    swan.navigateTo({
      url: url
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});