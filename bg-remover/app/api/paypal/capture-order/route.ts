import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    // 获取 PayPal 凭证
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      );
    }

    // 判断是否为沙箱环境（沙箱 Client ID 通常较短，或以 Ae 开头）
    const isSandbox = clientId.startsWith('Ae') || clientId.length < 50;
    const baseUrl = isSandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    // 获取访问令牌
    const tokenResponse = await fetch(
      `${baseUrl}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${secret}`),
        },
        body: 'grant_type=client_credentials',
      }
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get PayPal access token');
    }

    // 捕获订单
    const captureResponse = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (captureData.status !== 'COMPLETED') {
      throw new Error('Payment not completed');
    }

    // TODO: 在这里添加你的业务逻辑
    // - 给用户账户添加积分
    // - 发送确认邮件
    // - 记录订单到数据库

    return NextResponse.json({
      success: true,
      status: captureData.status,
      transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    });
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    );
  }
}
