export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: Date;
  updated_at?: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;
