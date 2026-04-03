// pages/index/index.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    today: '',
    weekday: '',
    progress: 0,
    completed: 0,
    total: 0,
    pendingMedicines: [],
    completedMedicines: []
  },

  onLoad: function () {
    this.initDate();
    this.loadTodayData();
  },

  onShow: function () {
    this.loadTodayData();
  },

  onPullDownRefresh: function () {
    this.loadTodayData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  initDate: function () {
    const now = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    this.setData({
      today: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
      weekday: `星期${weekdays[now.getDay()]}`
    });
  },

  loadTodayData: async function () {
    try {
      const today = this.formatDate(new Date());
      
      // 查询今日所有药品
      const medicinesRes = await db.collection('medicines')
        .where({ enabled: true })
        .get();
      
      // 查询今日服药记录
      const recordsRes = await db.collection('records')
        .where({
          scheduledTime: _.gte(today + ' 00:00:00')
            .and(_.lte(today + ' 23:59:59'))
        })
        .get();
      
      const medicines = medicinesRes.data;
      const records = recordsRes.data;
      
      // 计算进度
      let totalTimes = 0;
      let completedTimes = 0;
      const pending = [];
      const completed = [];
      
      const now = new Date();
      
      medicines.forEach(med => {
        med.times.forEach(time => {
          totalTimes++;
          const scheduledTime = new Date(`${today} ${time}`);
          
          // 查找是否有记录
          const record = records.find(r => 
            r.medicineId === med._id && 
            r.scheduledTime.startsWith(today)
          );
          
          if (record) {
            completedTimes++;
            completed.push({
              ...med,
              actualTime: record.actualTime,
              recordId: record._id
            });
          } else {
            // 判断状态
            let status = 'pending';
            if (now > scheduledTime) {
              status = 'overdue';
            }
            if (Math.abs(now - scheduledTime) < 15 * 60 * 1000) {
              status = 'current';
            }
            
            pending.push({
              ...med,
              scheduledTime: time,
              status
            });
          }
        });
      });
      
      this.setData({
        progress: totalTimes > 0 ? Math.round(completedTimes / totalTimes * 100) : 0,
        completed: completedTimes,
        total: totalTimes,
        pendingMedicines: pending,
        completedMedicines: completed
      });
      
    } catch (err) {
      console.error('加载数据失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  onCheckIn: function (e) {
    const { medicineid, time } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认服药',
      content: '确认已按时服药？',
      success: (res) => {
        if (res.confirm) {
          this.doCheckIn(medicineid, time);
        }
      }
    });
  },

  doCheckIn: async function (medicineId, scheduledTime) {
    try {
      const today = this.formatDate(new Date());
      const fullTime = `${today} ${scheduledTime}`;
      
      await wx.cloud.callFunction({
        name: 'checkIn',
        data: {
          medicineId,
          scheduledTime: fullTime
        }
      });
      
      wx.showToast({ title: '打卡成功', icon: 'success' });
      this.loadTodayData();
      
    } catch (err) {
      console.error('打卡失败:', err);
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },

  onAddTemp: function () {
    wx.navigateTo({
      url: '/pages/medicine/add?type=temp'
    });
  }
});
