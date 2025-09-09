import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getStatus', () => {
    it('should return a health status object from AppService', () => {
      const expectedStatus = { message: 'API funcionando!', init: true };

      jest
        .spyOn(appService, 'getStatus')
        .mockImplementation(() => expectedStatus);

      const result = appController.getStatus();

      expect(result).toBe(expectedStatus);
      expect(appService.getStatus).toHaveBeenCalled();
    });
  });
});
