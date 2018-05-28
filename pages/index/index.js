const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
};
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
};
const wxMapKey = 'A47BZ-CQP66-RQUSO-ETKT4-JHDYZ-ZPBQ2';
var QQMapWX = require('../..//libs/qqmap-wx-jssdk.js');
var qqmapsdk;
const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: 14,
    nowWeather: "多云",
    nowWeatherBackground: "/images/sunny-bg.png",
    hourWeather: [],
    todayDate: '',
    todayTemp: 0,
    city: '上海市',
    locationAuthType: UNPROMPTED
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: wxMapKey
    });
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation'];
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if (auth)
          this.getCityAndWeather();
        else
          this.getWeatherData();
      }
    })
  },
  /**
   * 获取天气数据
   */
  getWeatherData: function (callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      method: "GET",
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        wx.stopPullDownRefresh()
        if (res.statusCode == 200) {
          this.setNow(res);
          this.setHourlyWeather(res);
          this.setToday(res);
        }
      },
      fail: function (error) {
        console.log(error);
      },
      complete: function () {
        callback && callback()
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getWeatherData(() => {
      wx.stopPullDownRefresh()
    });
  },
  /**
   * 设置当前的数据
   */
  setNow: function (res) {
    let temp = res.data.result.now.temp;
    let weather = res.data.result.now.weather;

    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png',
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })
  },
  /**
   * 设置未来几小时的数据
   */
  setHourlyWeather: function (res) {
    let forecast = res.data.result.forecast;
    let hourWeather = [];
    let nowHousr = new Date().getHours();
    for (let i = 0; i < 8; i++) {
      hourWeather.push({
        time: ((i + nowHousr) % 24) + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourWeather[0].time = "现在";
    this.setData({
      hourWeather: hourWeather
    })
  },
  /**
   * 设置今天的数据
   */
  setToday: function (res) {
    let date = new Date();
    this.setData({
      todayTemp: `${res.data.result.today.minTemp}° ~ ${res.data.result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    });
  },
  /**
   * 跳转列表界面
   */
  onTabDayWeather: function () {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTabLocation: function () {
    if (this.data.locationAuthType == UNPROMPTED) {
      this.getCityAndWeather();
    } else {
      /**
       * 打开设置
       */
      wx.openSetting({
        success: (res) => {
          let auth = res.authSetting = ["scope.userLocation"];
          if (auth) {
            this.getCityAndWeather();
          }
        }
      })
    }
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.reverseGeocoder(res);
      },
      fail: res => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  },
  /**
   * 根据经纬度获取城市名
   */
  reverseGeocoder(res) {
    // 调用接口
    this.qqmapsdk.reverseGeocoder({
      location: {
        latitude: res.latitude,
        longitude: res.longitude
      },
      success: res => {
        let city = res.result.address_component.city;
        this.setData({
          city: city,
          locationAuthType: AUTHORIZED
        })
        this.getWeatherData();
      }
    })
  }
})