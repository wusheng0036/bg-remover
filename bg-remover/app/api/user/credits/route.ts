import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserCredits } from '@/lib/db';

export const runtime = 'edge';

/**
 * 获取用户积分
 * 通过 PayPal 邮箱查询用户积分
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const user: any = await getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({
        exists: false,
        credits: 0,
      });
    }

    const credits = await getUserCredits(user.email || 'default-user');

    return NextResponse.json({
      exists: true,
      email: user.email,
      credits: credits || 0,
    });

  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json(
      { error: 'Failed to get credits' },
      { status: 500 }
    );
  }
}
