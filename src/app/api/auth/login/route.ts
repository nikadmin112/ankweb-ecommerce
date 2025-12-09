import { NextRequest, NextResponse } from 'next/server';
import { validateUserCredentials } from '@/lib/users-db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Special case: Check for admin credentials
    if (email.toLowerCase() === 'admin') {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
      if (password === adminPassword) {
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin-' + Date.now(),
            email: 'admin@ankweb.com',
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid admin password' },
          { status: 401 }
        );
      }
    }

    // Validate credentials
    const user = await validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password. User does not exist or password is incorrect.' },
        { status: 401 }
      );
    }

    // Return user data (excluding password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
