import { Role } from './common/enums/role.enum';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: Role;
      createdAt: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
