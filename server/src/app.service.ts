import { Injectable } from '@nestjs/common';

@Injectable()
/**
 * 应用服务负责提供系统级别的基础状态数据。
 */
export class AppService {
  /**
   * 返回服务探活信息与当前服务端时间。
   */
  getHello() {
    return {
      message: 'service alive',
      timestamp: new Date().toISOString(),
    };
  }
}
