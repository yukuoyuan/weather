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
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: 14,
    nowWeather: "多云",
    nowWeatherBackground: "/images/sunny-bg.png",
    hourWeather: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWeatherData();
  },
  getWeatherData: function (callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      method: "GET",
      data: {
        city: "北京"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        wx.stopPullDownRefresh()
        if (res.statusCode == 200) {
          this.setNow(res);
          this.setHourlyWeather(res);
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
  }
})