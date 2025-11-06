/**
 * User Persistence Model
 */
export interface UserModel {
  id: string;
  email: string;
  password: string; // In production: hashed password
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
