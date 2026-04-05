export interface User {
  id: string;
  type: "user";
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  userEmail: string;
}
