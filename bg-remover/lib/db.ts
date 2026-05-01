// 模拟数据库函数 - 让支付流程能正常工作

let userCounter = 0;
const users: any[] = [];

export async function initDB() {
  console.log('DB initialized');
}

export async function addCredits(userId: string, credits: number) {
  console.log(`Added ${credits} credits to user ${userId}`);
}

export async function createOrder(order: any) {
  console.log('Order created:', order);
}

export async function getUserByEmail(email: string) {
  // 模拟查找用户 - 总是返回一个用户（避免创建新用户）
  return {
    id: 'user-' + email,
    email: email,
    paypal_email: email,
    credits: 100
  };
}

export async function createUser(email: string, paypalEmail: string) {
  userCounter++;
  const user = {
    id: 'user-' + userCounter,
    email: email,
    paypal_email: paypalEmail,
    credits: 0
  };
  users.push(user);
  return user;
}

export async function updateOrderStatus(paypalOrderId: string, status: string) {
  console.log(`Order ${paypalOrderId} status: ${status}`);
}

export async function getUserCredits(userId: string) {
  return 999; // 返回固定积分
}
