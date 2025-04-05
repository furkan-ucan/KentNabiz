import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  // Keep the module instance accessible if needed for multiple tests
  let app: TestingModule;

  beforeEach(async () => {
    // Initialize the module once for the describe block
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  // Use the module instance created in beforeEach
  it('should be defined', () => {
    // Get the controller instance from the pre-compiled module
    const controller = app.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  // Add more tests here, reusing the 'app' instance
  // it('should return "Hello World!"', () => {
  //   const controller = app.get<AppController>(AppController);
  //   expect(controller.getHello()).toBe('Hello World!');
  // });
});
