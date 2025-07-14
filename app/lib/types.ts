export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
}
