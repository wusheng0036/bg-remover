export async function onRequestPost({ request, env }) {
  try {
    const { orderId, payerEmail } = await request.json();

    const clientId = env.PAYPAL_CLIENT_ID;
    const secret = env.PAYPAL_SECRET;

    if (!clientId || !secret) {
      return new Response(
        JSON.stringify({ error: 'PayPal credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      return new Response(
        JSON.stringify({ error: 'Failed to get PayPal access token' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed', status: orderData.status }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取支付金额和积分
    const amount = orderData.purchase_units?.[0]?.amount?.value || '0';
    const currency = orderData.purchase_units?.[0]?.amount?.currency_code || 'USD';
    const payerPaypalEmail = orderData.payer?.email_address || payerEmail || '';

    // 套餐配置
    const PACKAGES = {
      '4.99': { credits: 10 },
      '12.99': { credits: 30 },
      '29.99': { credits: 80 },
      '7.99': { credits: 30 },
      '15.99': { credits: 80 },
    };

    const packageInfo = PACKAGES[amount] || { credits: 0 };

    return new Response(
      JSON.stringify({
        success: true,
        status: orderData.status,
        credits: packageInfo.credits,
        transactionId: orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to capture order', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
