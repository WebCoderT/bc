import { Role } from './common/enums/role.enum';

declare global {
  namespace Express {
    /**
     * 挂载到 Express 用户对象上的安全用户信息。
     */
    interface User {
      id: number;
      username: string;
      role: Role;
      createdAt: string;
    }

    /**
     * 扩展请求对象，允许守卫和拦截器注入当前用户。
     */
    interface Request {
      user?: User;
    }
  }
}

export {};
