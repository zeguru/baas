import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Response } from 'express';
import { join } from 'path';

describe('AppController', () => {
  let controller: AppController;

  // mock response
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.sendFile = jest.fn();
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  // 🧪 getEditor
  it('should send editor.html file', () => {
    const res = mockResponse();

    controller.getEditor(res);

    expect(res.sendFile).toHaveBeenCalledWith(
      join(__dirname, '..', 'public', 'editor.html'),
    );
  });

  // 🧪 getWelcome
  it('should send welcome.html file', () => {
    const res = mockResponse();

    controller.getWelcome(res);

    expect(res.sendFile).toHaveBeenCalledWith(
      join(__dirname, '..', 'public', 'welcome.html'),
    );
  });

  // 🧪 getHello
  it('should return Hello World!', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });
});