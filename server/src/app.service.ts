import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'service alive',
      timestamp: new Date().toISOString(),
    };
  }
}
