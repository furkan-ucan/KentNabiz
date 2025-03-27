import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from '../services/media.service';
import { BadRequestException } from '@nestjs/common';
import { Media, MediaType } from '../entities/media.entity';
import { Readable } from 'stream';

// Mock dosyası oluşturma yardımcı fonksiyonu
const createMockFile = (options?: Partial<Express.Multer.File>): Express.Multer.File => {
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
    stream: {} as unknown as Readable, // any yerine unknown kullanarak no-unsafe-assignment hatasını giderdik
    ...options,
  };
};

// MediaService mock
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
  // Spy tanımları
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

    // Spy tanımları - unbound-method hatasını gidermek için
    uploadFileSpy = jest.spyOn(mediaService, 'uploadFile');
    uploadMultipleFilesSpy = jest.spyOn(mediaService, 'uploadMultipleFiles');
    findAllSpy = jest.spyOn(mediaService, 'findAll');
    findOneSpy = jest.spyOn(mediaService, 'findOne');
    getPresignedUrlSpy = jest.spyOn(mediaService, 'getPresignedUrl');
    removeSpy = jest.spyOn(mediaService, 'remove');

    // Mock değerlerini sıfırla
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

      // Mock MediaEntity oluştur
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

      // mediaService.uploadFile'ın mockMediaEntity döndürmesini sağla
      uploadFileSpy.mockResolvedValue(mockMediaEntity);

      // Controller metodunu çağır
      const result = await controller.uploadFile(mockFile, true);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(uploadFileSpy).toHaveBeenCalledWith(mockFile, true);

      // Sonucun beklenen media entity olduğunu doğrula
      expect(result).toEqual(mockMediaEntity);
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      // Tip uyumsuzluğunu gidermek için cast işlemi uyguluyoruz
      const undefinedFile = undefined as unknown as Express.Multer.File;

      // Dosya olmadan çağrı yap
      await expect(controller.uploadFile(undefinedFile, true)).rejects.toThrow(BadRequestException);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(uploadFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      // Mock dosyalar dizisi oluştur
      const mockFiles = [
        createMockFile({ originalname: 'test-image-1.jpg' }),
        createMockFile({ originalname: 'test-image-2.jpg' }),
      ];

      // Mock MediaEntity dizisi oluştur
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

      // uploadMultipleFilesSpy'ın mockMediaEntities döndürmesini sağla
      uploadMultipleFilesSpy.mockResolvedValue(mockMediaEntities);

      // Controller metodunu çağır
      const result = await controller.uploadMultipleFiles(mockFiles, true);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(uploadMultipleFilesSpy).toHaveBeenCalledWith(mockFiles, true);

      // Sonucun beklenen media entity dizisi olduğunu doğrula
      expect(result).toEqual(mockMediaEntities);
    });

    it('should throw BadRequestException when no files are uploaded', async () => {
      // Boş dosya dizisini doğru tipte belirtiyoruz
      const emptyFiles: Express.Multer.File[] = [];

      // Boş dosya dizisi ile çağrı yap
      await expect(controller.uploadMultipleFiles(emptyFiles, true)).rejects.toThrow(
        BadRequestException,
      );

      // Spy kullanarak unbound-method hatasını giderdik
      expect(uploadMultipleFilesSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when files is undefined', async () => {
      // Tip uyumsuzluğunu gidermek için cast işlemi uyguluyoruz
      const undefinedFiles = undefined as unknown as Express.Multer.File[];

      // Tanımsız dosya dizisi ile çağrı yap
      await expect(controller.uploadMultipleFiles(undefinedFiles, true)).rejects.toThrow(
        BadRequestException,
      );

      // Spy kullanarak unbound-method hatasını giderdik
      expect(uploadMultipleFilesSpy).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of media entities', async () => {
      // Mock MediaEntity dizisi oluştur
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

      // findAllSpy'ın mockMediaEntities döndürmesini sağla
      findAllSpy.mockResolvedValue(mockMediaEntities);

      // Controller metodunu çağır
      const result = await controller.findAll();

      // Spy kullanarak unbound-method hatasını giderdik
      expect(findAllSpy).toHaveBeenCalled();

      // Sonucun beklenen media entity dizisi olduğunu doğrula
      expect(result).toEqual(mockMediaEntities);
    });
  });

  describe('findOne', () => {
    it('should return a media entity by ID', async () => {
      // Mock MediaEntity oluştur
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

      // findOneSpy'ın mockMediaEntity döndürmesini sağla
      findOneSpy.mockResolvedValue(mockMediaEntity);

      // Controller metodunu çağır
      const result = await controller.findOne(1);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(findOneSpy).toHaveBeenCalledWith(1);

      // Sonucun beklenen media entity olduğunu doğrula
      expect(result).toEqual(mockMediaEntity);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL for a private file', async () => {
      const mockPresignedUrl = 'https://presigned-url.example.com/file.jpg?token=abc123';

      // getPresignedUrlSpy'ın mockPresignedUrl döndürmesini sağla
      getPresignedUrlSpy.mockResolvedValue(mockPresignedUrl);

      // Controller metodunu çağır
      const result = await controller.getPresignedUrl(1, 3600);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(getPresignedUrlSpy).toHaveBeenCalledWith(1, 3600);

      // Sonucun beklenen URL nesnesini içerdiğini doğrula
      expect(result).toEqual({ url: mockPresignedUrl });
    });
  });

  describe('remove', () => {
    it('should remove a media file successfully', async () => {
      // removeSpy'ın başarılı tamamlanmasını sağla
      removeSpy.mockResolvedValue(undefined);

      // Controller metodunu çağır
      const result = await controller.remove(1);

      // Spy kullanarak unbound-method hatasını giderdik
      expect(removeSpy).toHaveBeenCalledWith(1);

      // Sonucun başarı mesajı içerdiğini doğrula
      expect(result).toEqual({ success: true });
    });
  });
});
