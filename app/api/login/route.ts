import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Add your login logic here
    console.log(body);
    return NextResponse.json({ message: 'User logged in successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while logging in' }, { status: 500 });
  }
}
