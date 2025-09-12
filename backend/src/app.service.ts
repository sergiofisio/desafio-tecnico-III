import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { message: string; init: boolean } {
    return {
      message: 'API funcionando!',
      init: true,
    };
  }
}
