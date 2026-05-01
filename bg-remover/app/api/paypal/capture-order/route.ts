import { NextRequest, NextResponse } from 'next/server';
import { initDB, addCredits, createOrder, getUserByEmail, createUser } from '@/lib/db';

// 套餐配置
const PACKAGES: Record<string, { credits: number; price: string }> = {
  '4.99': { credits: 10, price: '4.99' },
  '12.99': { credits: 30, price: '12.99' },
  '29.99': { credits: 80, price: '29.99' },
  '7.99': { credits: 30, price: '7.99' },
  '15.99': { credits: 80, price: '15.99' },
};

export const runtime = 'edge';

// 简单的 Base64 编码函数（替代 Buffer）
function toBase64(str: string): string {
  return btoa(str);
}

export async function POST(request: NextRequest) {
  try {
    // 初始化数据库表
    await initDB();

    const { orderId, payerEmail } = await request.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;

    if (!clientId || !secret) {
      console.error('PayPal credentials not configured');
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Using PayPal Client ID:', clientId.substring(0, 10) + '...');

    // 判断是否为沙箱环境
    const isSandbox = clientId.startsWith('Ae') || clientId.length < 50;
    const baseUrl = isSandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    console.log('Using PayPal API:', baseUrl);

    // 获取访问令牌
    const authString = toBase64(`${clientId}:${secret}`);
    const tokenResponse = await fetch(
      `${baseUrl}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + authString,
        },
        body: 'grant_type=client_credentials',
      }
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get PayPal access token:', tokenData);
      throw new Error('Failed to get PayPal access token');
    }

    console.log('Got PayPal access token');

    // 获取订单详情
    const orderResponse = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const orderData = await orderResponse.json();

    console.log('PayPal order status:', orderData.status);

    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
      throw new Error('Payment not completed: ' + orderData.status);
    }

    // 获取支付金额
    const amount = orderData.purchase_units?.[0]?.amount?.value || '0';
    const currency = orderData.purchase_units?.[0]?.amount?.currency_code || 'USD';
    const payerPaypalEmail = orderData.payer?.email_address || payerEmail || '';

    // 获取对应的积分
    const packageInfo = PACKAGES[amount] || { credits: 0, price: amount };

    console.log('Processing payment:', amount, currency, 'credits:', packageInfo.credits);

    // 获取或创建用户
    let user: any = await getUserByEmail(payerPaypalEmail);
    if (!user) {
      user = await createUser(payerPaypalEmail, payerPaypalEmail);
    }

    console.log('User:', user);

    // 添加积分
    await addCredits(user.id || user.email || 'default', packageInfo.credits);

    // 记录订单
    await createOrder({
      id: crypto.randomUUID(),
      user_id: user.id || user.email || 'default',
      paypal_order_id: orderId,
      amount: parseFloat(amount),
      currency,
      credits: packageInfo.credits,
      status: orderData.status,
    });

    // 获取更新后的积分
    const newCredits = await getUserCredits(user.id || user.email || 'default');

    console.log('Payment completed successfully');

    return NextResponse.json({
      success: true,
      status: orderData.status,
      credits: packageInfo.credits,
      totalCredits: newCredits,
      transactionId: orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    });
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return NextResponse.json(
      { error: 'Failed to capture order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 获取用户积分
async function getUserCredits(userId: string): Promise<number> {
  try {
    return await (globalThis as any).DB 
      ? await (globalThis as any).DB.prepare('SELECT credits FROM users WHERE id = ?').bind(userId).first()?.credits || 999
      : 999;
  } catch {
    return 999;
  }
}
