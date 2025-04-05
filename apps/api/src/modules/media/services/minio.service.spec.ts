import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import * as Minio from 'minio';
import { MulterFile } from '../interfaces/multer-file.interface';

// Jest tiplemeleri için tanım
type JestMockCalls = Array<unknown[]>; // Change any[] to unknown[]
// Minio istemcisi için arayüz tanımı, mock metotlarının özellikleriyle birlikte
interface MockMinioClient {
  bucketExists: jest.Mock & { mock: { calls: JestMockCalls } };
  makeBucket: jest.Mock & { mock: { calls: JestMockCalls } };
  setBucketPolicy: jest.Mock & { mock: { calls: JestMockCalls } };
  putObject: jest.Mock & { mock: { calls: JestMockCalls } };
  presignedGetObject: jest.Mock & { mock: { calls: JestMockCalls } };
  removeObject: jest.Mock & { mock: { calls: JestMockCalls } };
  getObject: jest.Mock & { mock: { calls: JestMockCalls } };
}

// Mock the Minio client
jest.mock('minio', () => {
  const mockClient: MockMinioClient = {
    bucketExists: jest.fn(),
    makeBucket: jest.fn(),
    setBucketPolicy: jest.fn(),
    putObject: jest.fn(),
    presignedGetObject: jest.fn(),
    removeObject: jest.fn(),
    getObject: jest.fn(),
  };

  return {
    Client: jest.fn(() => mockClient),
  };
});

// Stream için arayüz tanımı
interface MockDataStream {
  on: jest.Mock<MockDataStream, [string, (arg?: unknown) => void]>;
}

describe('MinioService', () => {
  let service: MinioService;
  let minioClient: MockMinioClient;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: unknown): unknown => {
      const config: Record<string, unknown> = {
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: 9000,
        MINIO_USE_SSL: false,
        MINIO_ACCESS_KEY: 'minioadmin',
        MINIO_SECRET_KEY: 'minioadmin',
        MINIO_REGION: 'us-east-1',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);

    // "Unsafe member access [0] on an `any` value" hatasını çözme
    // Prettier uyarısını gidermek için parantezleri kaldırıyoruz
    const mockedMinioClient = Minio.Client as unknown as jest.Mock<MockMinioClient>;
    // Güvenli bir şekilde tip ataması yapıyoruz
    minioClient = mockedMinioClient.mock.results[0].value as MockMinioClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should ensure buckets exist', async () => {
      minioClient.bucketExists.mockResolvedValue(false);
      minioClient.makeBucket.mockResolvedValue(undefined);
      minioClient.setBucketPolicy.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(minioClient.bucketExists).toHaveBeenCalledTimes(2);
      expect(minioClient.bucketExists).toHaveBeenCalledWith('public');
      expect(minioClient.bucketExists).toHaveBeenCalledWith('private');

      expect(minioClient.makeBucket).toHaveBeenCalledTimes(2);

      // mock.calls için güvenli erişim tiplemesi
      const setBucketPolicyCalls = minioClient.setBucketPolicy.mock.calls as string[][];
      expect(setBucketPolicyCalls[0][0]).toBe('public');
    });

    it('should not create buckets if they already exist', async () => {
      minioClient.bucketExists.mockResolvedValue(true);

      await service.onModuleInit();

      expect(minioClient.bucketExists).toHaveBeenCalledTimes(2);
      expect(minioClient.makeBucket).not.toHaveBeenCalled();
      expect(minioClient.setBucketPolicy).not.toHaveBeenCalled();
    });

    it('should throw an error if bucket creation fails', async () => {
      minioClient.bucketExists.mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('uploadFile', () => {
    it('should upload a file and return its URL', async () => {
      const mockFile = {
        originalname: 'test-image.jpg',
        buffer: Buffer.from('test image data'),
        size: 1024,
        mimetype: 'image/jpeg',
      } as MulterFile;

      minioClient.putObject.mockResolvedValue(undefined);

      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

      const result = await service.uploadFile(mockFile);

      expect(minioClient.putObject).toHaveBeenCalledWith(
        'public',
        '1234567890-123456789.jpg',
        mockFile.buffer,
        mockFile.size,
        { 'Content-Type': mockFile.mimetype }
      );

      expect(result).toBe('http://localhost:9000/public/1234567890-123456789.jpg');

      dateSpy.mockRestore();
      randomSpy.mockRestore();
    });

    it('should use provided objectName if specified', async () => {
      const mockFile = {
        originalname: 'test-document.pdf',
        buffer: Buffer.from('test document data'),
        size: 2048,
        mimetype: 'application/pdf',
      } as MulterFile;

      minioClient.putObject.mockResolvedValue(undefined);
      minioClient.presignedGetObject.mockResolvedValue('https://presigned-url.example.com');

      await service.uploadFile(mockFile, 'private', 'custom-name.pdf');

      expect(minioClient.putObject).toHaveBeenCalledWith(
        'private',
        'custom-name.pdf',
        mockFile.buffer,
        mockFile.size,
        { 'Content-Type': mockFile.mimetype }
      );
      expect(minioClient.presignedGetObject).toHaveBeenCalled();
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = {
        originalname: 'test-image.jpg',
        buffer: Buffer.from('test image data'),
        size: 1024,
        mimetype: 'image/jpeg',
      } as MulterFile;

      minioClient.putObject.mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('getFileUrl', () => {
    it('should return direct URL for public bucket', async () => {
      const result = await service.getFileUrl('public', 'test-image.jpg');

      expect(result).toBe('http://localhost:9000/public/test-image.jpg');
      expect(minioClient.presignedGetObject).not.toHaveBeenCalled();
    });

    it('should return presigned URL for private bucket', async () => {
      minioClient.presignedGetObject.mockResolvedValue('https://presigned-url.example.com');

      const result = await service.getFileUrl('private', 'test-document.pdf');

      expect(minioClient.presignedGetObject).toHaveBeenCalledWith(
        'private',
        'test-document.pdf',
        3600
      );
      expect(result).toBe('https://presigned-url.example.com');
    });
  });

  describe('getPresignedUrl', () => {
    it('should generate a presigned URL with default expiry', async () => {
      minioClient.presignedGetObject.mockResolvedValue('https://presigned-url.example.com');

      const result = await service.getPresignedUrl('private', 'test-document.pdf');

      expect(minioClient.presignedGetObject).toHaveBeenCalledWith(
        'private',
        'test-document.pdf',
        3600
      );
      expect(result).toBe('https://presigned-url.example.com');
    });

    it('should generate a presigned URL with custom expiry', async () => {
      minioClient.presignedGetObject.mockResolvedValue('https://presigned-url.example.com');

      const result = await service.getPresignedUrl('private', 'test-document.pdf', 1800);

      expect(minioClient.presignedGetObject).toHaveBeenCalledWith(
        'private',
        'test-document.pdf',
        1800
      );
      expect(result).toBe('https://presigned-url.example.com');
    });

    it('should throw an error if presign fails', async () => {
      minioClient.presignedGetObject.mockRejectedValue(new Error('Presign failed'));

      await expect(service.getPresignedUrl('private', 'test-document.pdf')).rejects.toThrow(
        'Presign failed'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      minioClient.removeObject.mockResolvedValue(undefined);

      await service.deleteFile('public', 'test-image.jpg');

      expect(minioClient.removeObject).toHaveBeenCalledWith('public', 'test-image.jpg');
    });

    it('should throw an error if deletion fails', async () => {
      minioClient.removeObject.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteFile('public', 'test-image.jpg')).rejects.toThrow('Delete failed');
    });
  });

  describe('getObject', () => {
    it('should retrieve a file as buffer', async () => {
      const mockDataStream: MockDataStream = {
        on: jest.fn((event: string, callback: (arg?: unknown) => void): MockDataStream => {
          if (event === 'data') {
            callback(Buffer.from('test data 1'));
            callback(Buffer.from('test data 2'));
          } else if (event === 'end') {
            callback();
          }
          return mockDataStream;
        }),
      };

      minioClient.getObject.mockResolvedValue(mockDataStream);

      const result = await service.getObject('public', 'test-image.jpg');

      expect(minioClient.getObject).toHaveBeenCalledWith('public', 'test-image.jpg');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('test data 1test data 2');
    });

    it('should throw an error if stream emits error', async () => {
      const mockDataStream: MockDataStream = {
        on: jest.fn((event: string, callback: (arg?: unknown) => void): MockDataStream => {
          if (event === 'error') {
            callback(new Error('Stream error'));
          }
          return mockDataStream;
        }),
      };

      minioClient.getObject.mockResolvedValue(mockDataStream);

      await expect(service.getObject('public', 'test-image.jpg')).rejects.toThrow('Stream error');
    });
  });

  describe('getBucketName', () => {
    it('should return public bucket name by default', () => {
      const result = service.getBucketName();
      expect(result).toBe('public');
    });

    it('should return public bucket name when isPublic is true', () => {
      const result = service.getBucketName(true);
      expect(result).toBe('public');
    });

    it('should return private bucket name when isPublic is false', () => {
      const result = service.getBucketName(false);
      expect(result).toBe('private');
    });
  });
});
