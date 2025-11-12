import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // In a real application, you would save this data to your database.
    console.log(body);
    return NextResponse.json({ message: 'Onboarding data saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ message: 'An error occurred while saving onboarding data' }, { status: 500 });
  }
}
