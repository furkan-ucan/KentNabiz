import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessorService } from './image-processor.service';
import * as sharp from 'sharp';
import type { Sharp } from 'sharp';

// Mock tipi: Partial<Sharp> ile gerçek Sharp instance'ının gereksinimlerini kısmen karşılıyoruz
type MockSharp = Partial<Sharp> & {
  metadata: jest.Mock;
  resize: jest.Mock;
  jpeg: jest.Mock;
  png: jest.Mock;
  webp: jest.Mock;
  avif: jest.Mock;
  toBuffer: jest.Mock;
};

// Mock sharp
jest.mock('sharp', () => {
  // Mock metadata ve diğer sharp metotları
  const mockSharpInstance: MockSharp = {
    metadata: jest.fn().mockResolvedValue({
      width: 1000,
      height: 800,
      format: 'jpeg',
      size: 1024,
    }),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    avif: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data')),
  };

  // Verilen input ile mockSharpInstance döndüren mock fonksiyon
  return jest.fn(() => mockSharpInstance);
});

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessorService],
    }).compile();

    service = module.get<ImageProcessorService>(ImageProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processImage', () => {
    it('should process an image with default options', async () => {
      const buffer = Buffer.from('test-image-data');
      const originalname = 'test-image.jpg';
      const mimetype = 'image/jpeg';

      const result = await service.processImage(buffer, originalname, mimetype);

      // Check that sharp was called with the input buffer
      expect(sharp).toHaveBeenCalledWith(buffer);

      // Get the sharp instance using jest.mocked with shallow mock
      const mockedSharp = jest.mocked(sharp, { shallow: true });
      const sharpInstance = mockedSharp.mock.results[0].value as MockSharp;

      // Check that resize was called with default options
      expect(sharpInstance.resize).toHaveBeenCalledWith({
        width: 1200,
        height: undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Check that jpeg was called with default quality
      expect(sharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });

      // Check that toBuffer was called
      expect(sharpInstance.toBuffer).toHaveBeenCalled();

      // Check the returned result
      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('width', 1000);
      expect(result.metadata).toHaveProperty('height', 800);
      expect(result.metadata).toHaveProperty('format', 'jpeg');
    });

    it('should process an image with custom resize options', async () => {
      const buffer = Buffer.from('test-image-data');
      const originalname = 'test-image.jpg';
      const mimetype = 'image/jpeg';

      // Doğru yapılandırılmış options nesnesi:
      const options = {
        resize: { width: 500, height: 400 },
        quality: 90,
        format: 'webp' as const,
      };

      const result = await service.processImage(buffer, originalname, mimetype, options);

      const mockedSharp = jest.mocked(sharp, { shallow: true });
      const sharpInstance = mockedSharp.mock.results[0].value as MockSharp;

      // Şimdi, özel değerlerle çağrım beklentisi sağlanmalı:
      expect(sharpInstance.resize).toHaveBeenCalledWith({
        width: 500,
        height: 400,
        fit: 'inside',
        withoutEnlargement: true,
      });

      expect(sharpInstance.webp).toHaveBeenCalledWith({ quality: 90 });

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('width', 1000);
      expect(result.metadata).toHaveProperty('height', 800);
    });

    it('should handle errors during image processing', async () => {
      const buffer = Buffer.from('test-image-data');
      const originalname = 'test-image.jpg';
      const mimetype = 'image/jpeg';

      // Simüle edilen hata
      const mockError = new Error('Image processing failed');
      (sharp as jest.MockedFunction<typeof sharp>).mockImplementationOnce(() => {
        throw mockError;
      });

      await expect(service.processImage(buffer, originalname, mimetype)).rejects.toThrow(
        'Image processing failed',
      );
    });
  });

  describe('generateThumbnail', () => {
    it('should generate a thumbnail with default options', async () => {
      const buffer = Buffer.from('test-image-data');

      const result = await service.generateThumbnail(buffer);

      expect(sharp).toHaveBeenCalledWith(buffer);

      const mockedSharp = jest.mocked(sharp, { shallow: true });
      const sharpInstance = mockedSharp.mock.results[0].value as MockSharp;

      expect(sharpInstance.resize).toHaveBeenCalledWith({
        width: 200,
        height: 200,
        fit: 'cover',
        position: 'centre',
      });

      expect(sharpInstance.jpeg).toHaveBeenCalledWith({ quality: 70 });
      expect(sharpInstance.toBuffer).toHaveBeenCalled();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should generate a thumbnail with custom options', async () => {
      const buffer = Buffer.from('test-image-data');

      // Options nesnesini interface kullanarak tanımlıyoruz
      interface ThumbnailOptions {
        width: number;
        height: number;
        quality: number;
        format: 'png';
      }

      const options: ThumbnailOptions = {
        width: 150,
        height: 150,
        quality: 60,
        format: 'png',
      };

      const result = await service.generateThumbnail(buffer, options);

      // Get the sharp instance using jest.mocked with shallow option and type assertion to MockSharp
      const mockedSharp = jest.mocked(sharp, { shallow: true });
      const sharpInstance = mockedSharp.mock.results[0].value as MockSharp;

      // Verify that resize was called correctly
      expect(sharpInstance.resize).toHaveBeenCalledWith({
        width: 150,
        height: 150,
        fit: 'cover',
        position: 'centre',
      });

      // quality değerini destructure ederek hesaplıyoruz
      const { quality } = options;
      const expectedPngQuality: number = (quality / 100) * 9;

      expect(sharpInstance.png).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          quality: expect.closeTo(expectedPngQuality, 0.1),
        }),
      );

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('getImageDimensions', () => {
    it('should return the dimensions of an image', async () => {
      const buffer = Buffer.from('test-image-data');

      const result = await service.getImageDimensions(buffer);

      expect(sharp).toHaveBeenCalledWith(buffer);

      const mockedSharp = jest.mocked(sharp, { shallow: true });
      const sharpInstance = mockedSharp.mock.results[0].value as MockSharp;

      expect(sharpInstance.metadata).toHaveBeenCalled();

      expect(result).toHaveProperty('width', 1000);
      expect(result).toHaveProperty('height', 800);
    });

    it('should throw an error if dimensions cannot be determined', async () => {
      const buffer = Buffer.from('test-image-data');

      // Partial mock: metadata dönen değer, genişlik ve yükseklik içermiyor
      const partialMock: Partial<MockSharp> = {
        metadata: jest.fn().mockResolvedValue({
          format: 'jpeg',
          size: 1024,
        }),
      };
      (sharp as jest.MockedFunction<typeof sharp>).mockReturnValueOnce(
        partialMock as unknown as Sharp,
      );

      await expect(service.getImageDimensions(buffer)).rejects.toThrow(
        'Could not determine image dimensions',
      );
    });
  });

  describe('isImage', () => {
    it('should return true for image mimetypes', () => {
      expect(service.isImage('image/jpeg')).toBe(true);
      expect(service.isImage('image/png')).toBe(true);
      expect(service.isImage('image/gif')).toBe(true);
    });

    it('should return false for non-image mimetypes', () => {
      expect(service.isImage('application/pdf')).toBe(false);
      expect(service.isImage('text/plain')).toBe(false);
      expect(service.isImage('video/mp4')).toBe(false);
    });
  });
});
