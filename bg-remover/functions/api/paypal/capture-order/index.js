export async function onRequestPost({ request, env }) {
  try {
    const { orderId } = await request.json();

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

    return new Response(
      JSON.stringify({
        success: true,
        status: captureData.status,
        transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to capture order' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
