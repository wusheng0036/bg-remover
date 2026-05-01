import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addCredits, createOrder, getUserByEmail, createUser, updateOrderStatus } from '@/lib/db';

// 套餐配置
const PACKAGES: Record<string, { credits: number; price: string }> = {
  '4.99': { credits: 10, price: '4.99' },
  '12.99': { credits: 30, price: '12.99' },
  '29.99': { credits: 80, price: '29.99' },
  '7.99': { credits: 30, price: '7.99' },
  '15.99': { credits: 80, price: '15.99' },
};

export const runtime = 'edge';

/**
 * PayPal Webhook 处理器
 * 当支付完成时，PayPal 会调用此接口通知网站
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paypal-transmission-id') || '';
    
    // TODO: 验证 Webhook 签名（生产环境必需）
    // 沙箱测试可以先跳过验证

    const eventType = request.headers.get('paypal-event-type') || '';
    
    console.log('PayPal Webhook received:', eventType);

    // 解析事件数据
    const event = JSON.parse(body);
    
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureData = event.resource || event;
      const orderId = captureData.supplemental_data?.related_ids?.order_id || captureData.order_id;
      const amount = captureData.amount?.value || '0';
      const currency = captureData.amount?.currency_code || 'USD';
      const status = captureData.status || 'COMPLETED';

      // 获取订单详情（需要访问令牌）
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const secret = process.env.PAYPAL_SECRET;

      if (!clientId || !secret) {
        return NextResponse.json({ error: 'Credentials not configured' }, { status: 500 });
      }

      const isSandbox = clientId.startsWith('Ae') || clientId.length < 50;
      const baseUrl = isSandbox 
        ? 'https://api-m.sandbox.paypal.com' 
        : 'https://api-m.paypal.com';

      // 获取访问令牌
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        },
        body: 'grant_type=client_credentials',
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // 获取订单详情
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const orderData = await orderResponse.json();
      const payerEmail = orderData.payer?.email_address || '';
      const packageInfo = PACKAGES[amount] || { credits: 0, price: amount };

      // 获取或创建用户
      let user: any = await getUserByEmail(payerEmail);
      if (!user) {
        user = await createUser(payerEmail, payerEmail);
      }

      // 添加积分
      await addCredits(user.id || 'default-user', packageInfo.credits);

      // 记录或更新订单
      await updateOrderStatus(orderId, status);

      console.log(`✅ Payment completed: ${payerEmail} received ${packageInfo.credits} credits`);

      return NextResponse.json({ success: true });
    }

    // 其他事件类型忽略
    return NextResponse.json({ acknowledged: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
