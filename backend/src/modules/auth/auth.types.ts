// If you were using an ORM like Prisma or TypeORM, your models would be defined there.
// Since you are using raw PostgreSQL, we define TypeScript interfaces to represent our database models.

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// You can also define specific request/response DTOs (Data Transfer Objects) here
export interface RegisterUserDTO {
  email: string;
  passwordHash: string;
  name: string;
}
