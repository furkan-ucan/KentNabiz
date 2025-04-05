import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from '../services/media.service';
import { BadRequestException } from '@nestjs/common';
import { Media, MediaType } from '../entities/media.entity';
import { Readable } from 'stream';
import { MulterFile } from '../interfaces/multer-file.interface';

// Yardımcı: Mock dosya oluşturma fonksiyonu
const createMockFile = (options?: Partial<MulterFile>): MulterFile => {
  return {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test-image-data'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: {} as unknown as Readable, // Tip güvenliğini sağlamak için
    ...options,
  };
};

// MediaService için mock nesnesi
const mockMediaService = {
  uploadFile: jest.fn(),
  uploadMultipleFiles: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  getPresignedUrl: jest.fn(),
  remove: jest.fn(),
};

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;

  // Spy tanımlamaları
  let uploadFileSpy: jest.SpyInstance;
  let uploadMultipleFilesSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;
  let getPresignedUrlSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);

    // Metodları spy ile sarmala
    uploadFileSpy = jest.spyOn(mediaService, 'uploadFile');
    uploadMultipleFilesSpy = jest.spyOn(mediaService, 'uploadMultipleFiles');
    findAllSpy = jest.spyOn(mediaService, 'findAll');
    findOneSpy = jest.spyOn(mediaService, 'findOne');
    getPresignedUrlSpy = jest.spyOn(mediaService, 'getPresignedUrl');
    removeSpy = jest.spyOn(mediaService, 'remove');

    // Test başlamadan önce tüm mock'ları temizle
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a single file successfully', async () => {
      // Mock dosya oluştur
      const mockFile = createMockFile();

      // Beklenen MediaEntity örneği
      const mockMediaEntity: Media = {
        id: 1,
        filename: 'timestamp-123456789.jpg',
        originalname: 'test-image.jpg',
        url: 'https://minio-server/public/timestamp-123456789.jpg',
        mimetype: 'image/jpeg',
        type: MediaType.IMAGE,
        size: 1024,
        bucketName: 'public',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // MediaService.uploadFile metodunun mockMediaEntity döndürmesi sağlanıyor
      uploadFileSpy.mockResolvedValue(mockMediaEntity);

      // Controller metodunu çağır
      const result = await controller.uploadFile(mockFile, true);

      // Metodun doğru argümanlarla çağrıldığını doğrula
      expect(uploadFileSpy).toHaveBeenCalledWith(mockFile, true);
      // Sonuç beklenen media entity ile aynı olmalı
      expect(result).toEqual(mockMediaEntity);
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      // Tip uyumsuzluğunu gidermek için tanımsız dosyayı cast ediyoruz
      const undefinedFile = undefined as unknown as MulterFile;

      await expect(controller.uploadFile(undefinedFile, true)).rejects.toThrow(BadRequestException);

      // uploadFile metodunun çağrılmadığını doğrula
      expect(uploadFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      // Birden fazla mock dosya oluştur
      const mockFiles = [
        createMockFile({ originalname: 'test-image-1.jpg' }),
        createMockFile({ originalname: 'test-image-2.jpg' }),
      ];

      // Beklenen MediaEntity dizisi
      const mockMediaEntities: Media[] = [
        {
          id: 1,
          filename: 'timestamp-123456789.jpg',
          originalname: 'test-image-1.jpg',
          url: 'https://minio-server/public/timestamp-123456789.jpg',
          mimetype: 'image/jpeg',
          type: MediaType.IMAGE,
          size: 1024,
          bucketName: 'public',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          filename: 'timestamp-987654321.jpg',
          originalname: 'test-image-2.jpg',
          url: 'https://minio-server/public/timestamp-987654321.jpg',
          mimetype: 'image/jpeg',
          type: MediaType.IMAGE,
          size: 1024,
          bucketName: 'public',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // MediaService.uploadMultipleFiles metodunun mockMediaEntities döndürmesi sağlanıyor
      uploadMultipleFilesSpy.mockResolvedValue(mockMediaEntities);

      // Controller metodunu çağır
      const result = await controller.uploadMultipleFiles(mockFiles, true);

      expect(uploadMultipleFilesSpy).toHaveBeenCalledWith(mockFiles, true);
      expect(result).toEqual(mockMediaEntities);
    });

    it('should throw BadRequestException when no files are uploaded', async () => {
      const emptyFiles: MulterFile[] = [];

      await expect(controller.uploadMultipleFiles(emptyFiles, true)).rejects.toThrow(
        BadRequestException
      );
      expect(uploadMultipleFilesSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when files is undefined', async () => {
      const undefinedFiles = undefined as unknown as MulterFile[];

      await expect(controller.uploadMultipleFiles(undefinedFiles, true)).rejects.toThrow(
        BadRequestException
      );
      expect(uploadMultipleFilesSpy).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of media entities', async () => {
      const mockMediaEntities: Media[] = [
        {
          id: 1,
          filename: 'test-file-1.jpg',
          originalname: 'test-image-1.jpg',
          url: 'https://minio-server/public/test-file-1.jpg',
          mimetype: 'image/jpeg',
          type: MediaType.IMAGE,
          size: 1024,
          bucketName: 'public',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          filename: 'test-file-2.pdf',
          originalname: 'test-document.pdf',
          url: 'https://minio-server/public/test-file-2.pdf',
          mimetype: 'application/pdf',
          type: MediaType.DOCUMENT,
          size: 2048,
          bucketName: 'public',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      findAllSpy.mockResolvedValue(mockMediaEntities);

      const result = await controller.findAll();

      expect(findAllSpy).toHaveBeenCalled();
      expect(result).toEqual(mockMediaEntities);
    });
  });

  describe('findOne', () => {
    it('should return a media entity by ID', async () => {
      const mockMediaEntity: Media = {
        id: 1,
        filename: 'test-file.jpg',
        originalname: 'test-image.jpg',
        url: 'https://minio-server/public/test-file.jpg',
        mimetype: 'image/jpeg',
        type: MediaType.IMAGE,
        size: 1024,
        bucketName: 'public',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      findOneSpy.mockResolvedValue(mockMediaEntity);

      const result = await controller.findOne(1);

      expect(findOneSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMediaEntity);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL for a private file', async () => {
      const mockPresignedUrl = 'https://presigned-url.example.com/file.jpg?token=abc123';

      getPresignedUrlSpy.mockResolvedValue(mockPresignedUrl);

      const result = await controller.getPresignedUrl(1, 3600);

      expect(getPresignedUrlSpy).toHaveBeenCalledWith(1, 3600);
      expect(result).toEqual({ url: mockPresignedUrl });
    });
  });

  describe('remove', () => {
    it('should remove a media file successfully', async () => {
      removeSpy.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(removeSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });
});
