export class AppError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
