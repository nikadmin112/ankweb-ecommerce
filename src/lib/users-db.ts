import { getServiceClient } from './supabase';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

function toDbUser(user: any): any {
  return {
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    first_name: user.firstName,
    last_name: user.lastName,
    is_admin: user.isAdmin,
  };
}

function fromDbUser(dbUser: any): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    passwordHash: dbUser.password_hash,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    isAdmin: dbUser.is_admin,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) return null;
  return fromDbUser(data);
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isAdmin: boolean = false
): Promise<User> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  // Check if user already exists
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    isAdmin,
  };

  const dbUser = toDbUser(userData);
  const { data, error } = await supabase
    .from('users')
    .insert([dbUser] as any)
    .select()
    .single();

  if (error) throw error;
  return fromDbUser(data);
}

export async function validateUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(fromDbUser);
}
