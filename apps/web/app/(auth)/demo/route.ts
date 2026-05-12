import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/dashboard`);
  response.cookies.set('demo_access', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 h
  });
  return response;
}
