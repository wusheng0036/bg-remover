import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'USD', description } = await request.json();

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

    // 创建订单
    const orderResponse = await fetch(
      `${baseUrl}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
              description: description,
            },
          ],
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (!orderData.id) {
      throw new Error('Failed to create PayPal order');
    }

    return NextResponse.json({ orderId: orderData.id });
  } catch (error) {
    console.error('PayPal create-order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
