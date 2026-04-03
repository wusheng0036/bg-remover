// 云函数：addMedicine - 添加药品
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { medicine } = event;
  
  if (!medicine || !medicine.name || !medicine.times || medicine.times.length === 0) {
    return { success: false, error: '药品名称和服药时间必填' };
  }
  
  try {
    // 创建药品记录
    const result = await db.collection('medicines').add({
      data: {
        _openid: OPENID,
        name: medicine.name,
        dosage: medicine.dosage || 1,
        unit: medicine.unit || '片',
        frequency: medicine.frequency || 'daily',
        times: medicine.times,
        instruction: medicine.instruction || '',
        note: medicine.note || '',
        reminderAdvance: medicine.reminderAdvance || 15,
        enabled: true,
        startDate: medicine.startDate || new Date().toISOString().split('T')[0],
        endDate: medicine.endDate || null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    });
    
    // 创建提醒任务
    await createReminderTasks(OPENID, result._id, medicine);
    
    return { success: true, id: result._id };
    
  } catch (err) {
    console.error('添加药品失败:', err);
    return { success: false, error: err.message };
  }
};

// 创建提醒任务（未来 7 天）
async function createReminderTasks(openid, medicineId, medicine) {
  const tasks = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);
    
    for (const time of medicine.times) {
      const scheduledTime = `${dateStr} ${time}`;
      const sendTime = new Date(scheduledTime);
      sendTime.setMinutes(sendTime.getMinutes() - (medicine.reminderAdvance || 15));
      
      tasks.push({
        _openid: openid,
        medicineId,
        scheduledTime,
        sendTime: sendTime.toISOString(),
        status: 'pending',
        retryCount: 0,
        createdAt: Date.now()
      });
    }
  }
  
  if (tasks.length > 0) {
    await db.collection('reminder_tasks').add({ data: tasks });
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
