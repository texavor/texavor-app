import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Add your logic to re-send the verification email
    console.log(body);
    return NextResponse.json({ message: 'Verification email sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while sending the verification email' }, { status: 500 });
  }
}
