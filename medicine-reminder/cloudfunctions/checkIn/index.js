// 云函数：checkIn - 服药打卡
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { medicineId, scheduledTime, photo } = event;
  
  if (!medicineId || !scheduledTime) {
    return { success: false, error: '参数错误' };
  }
  
  const now = new Date();
  
  try {
    // 检查是否已打卡
    const existingRecord = await db.collection('records')
      .where({
        _openid: OPENID,
        medicineId,
        scheduledTime
      })
      .get();
    
    if (existingRecord.data.length > 0) {
      return { success: false, error: '已打卡' };
    }
    
    // 获取药品信息
    const medicine = await db.collection('medicines')
      .where({ _id: medicineId })
      .get();
    
    if (medicine.data.length === 0) {
      return { success: false, error: '药品不存在' };
    }
    
    // 创建服药记录
    const record = await db.collection('records').add({
      data: {
        _openid: OPENID,
        medicineId,
        medicineName: medicine.data[0].name,
        scheduledTime,
        actualTime: now.toISOString(),
        status: 'completed',
        photo: photo || '',
        note: '',
        isMakeup: false,
        createdAt: Date.now()
      }
    });
    
    // 检查是否延迟服药，通知家属
    const scheduled = new Date(scheduledTime);
    const diffMinutes = (now - scheduled) / 60000;
    
    if (diffMinutes > 30) {
      await notifyFamilyMembers(OPENID, medicine.data[0], 'late');
    }
    
    return { 
      success: true, 
      id: record._id,
      isLate: diffMinutes > 0
    };
    
  } catch (err) {
    console.error('打卡失败:', err);
    return { success: false, error: err.message };
  }
};

// 通知家属
async function notifyFamilyMembers(patientOpenid, medicine, type) {
  try {
    const families = await db.collection('families')
      .where({
        patientOpenid,
        status: 'active',
        notifyOnMissed: true
      })
      .get();
    
    if (families.data.length === 0) {
      return;
    }
    
    const now = new Date();
    const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    for (const family of families.data) {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: family.caregiverOpenid,
          templateId: 'FAMILY_NOTIFY_TEMPLATE_ID', // 需要替换为实际模板 ID
          data: {
            thing1: { value: family.patientName || '家人' },
            thing2: { value: medicine.name },
            thing3: { value: type === 'missed' ? '漏服' : '延迟服药' },
            time4: { value: timeStr }
          }
        });
      } catch (err) {
        console.error('发送通知失败:', err);
      }
    }
  } catch (err) {
    console.error('通知家属失败:', err);
  }
}
