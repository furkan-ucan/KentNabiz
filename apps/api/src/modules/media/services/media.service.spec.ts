import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaService } from './media.service';
import { MinioService } from './minio.service';
import { ImageProcessorService } from './image-processor.service';
import { Media, MediaType } from '../entities/media.entity';
import { Readable } from 'stream';
import { MulterFile } from '../interfaces/multer-file.interface';

// Media entity tipi
type MockMedia = Partial<Media>;

// Mock repository
const mockRepository = (): Partial<Repository<Media>> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

// Mock MinioService
const mockMinioService = (): Partial<MinioService> => ({
  getBucketName: jest.fn().mockReturnValue('test-bucket'),
  uploadFile: jest
    .fn()
    .mockImplementation((_file: Buffer, bucket: string, filename: string) =>
      Promise.resolve(`https://minio-server/${bucket}/${filename}`),
    ),
  getPresignedUrl: jest.fn().mockReturnValue(Promise.resolve('https://presigned-url.com')),
  deleteFile: jest.fn().mockReturnValue(Promise.resolve()),
});

// Mock ImageProcessorService
const mockImageProcessorService = (): Partial<ImageProcessorService> => ({
  isImage: jest.fn().mockReturnValue(true),
  processImage: jest.fn().mockImplementation((buffer: Buffer) => {
    return Promise.resolve({
      buffer,
      metadata: {
        width: 800,
        height: 600,
        format: 'jpeg',
        size: buffer.length,
      },
    });
  }),
  generateThumbnail: jest.fn().mockReturnValue(Promise.resolve(Buffer.from('thumbnail-data'))),
});

// Mock file object
const mockFile: MulterFile = {
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test-image-data'),
  size: 1024,
  destination: '',
  filename: '',
  path: '',
  stream: {} as Readable,
};

describe('MediaService', () => {
  let service: MediaService;
  let mediaRepository: Repository<Media>;
  let minioService: MinioService;
  let imageProcessorService: ImageProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(Media),
          useFactory: mockRepository,
        },
        {
          provide: MinioService,
          useFactory: mockMinioService,
        },
        {
          provide: ImageProcessorService,
          useFactory: mockImageProcessorService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    mediaRepository = module.get<Repository<Media>>(getRepositoryToken(Media));
    minioService = module.get<MinioService>(MinioService);
    imageProcessorService = module.get<ImageProcessorService>(ImageProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the media entity', async () => {
      // Mock create and save
      const mockMediaEntity: MockMedia = {
        id: 1,
        filename: 'test-filename.jpg',
        originalname: mockFile.originalname,
        url: 'https://minio-server/test-bucket/test-filename.jpg',
        mimetype: mockFile.mimetype,
        type: MediaType.IMAGE,
        size: mockFile.size,
        metadata: { format: 'jpeg' },
        thumbnailUrl: 'https://minio-server/test-bucket/thumb_test-filename.jpg',
        bucketName: 'test-bucket',
        width: 800,
        height: 600,
      };

      jest.spyOn(mediaRepository, 'create').mockReturnValue(mockMediaEntity as Media);
      jest.spyOn(mediaRepository, 'save').mockResolvedValue(mockMediaEntity as Media);

      const result = await service.uploadFile(mockFile);

      // Tüm unbound-method hatalarını çözüyoruz
      const isImageSpy = jest.spyOn(imageProcessorService, 'isImage');
      const processImageSpy = jest.spyOn(imageProcessorService, 'processImage');
      const generateThumbnailSpy = jest.spyOn(imageProcessorService, 'generateThumbnail');
      const uploadFileSpy = jest.spyOn(minioService, 'uploadFile');
      const createSpy = jest.spyOn(mediaRepository, 'create');
      const saveSpy = jest.spyOn(mediaRepository, 'save');

      // Bağlı metot referansları kullanarak testleri yapıyoruz
      expect(isImageSpy).toHaveBeenCalledWith(mockFile.mimetype);
      expect(processImageSpy).toHaveBeenCalled();
      expect(generateThumbnailSpy).toHaveBeenCalled();
      expect(uploadFileSpy).toHaveBeenCalledTimes(2); // Once for the file, once for the thumbnail
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(mockMediaEntity);
    });

    it('should handle non-image files', async () => {
      const docFile = {
        ...mockFile,
        mimetype: 'application/pdf',
        originalname: 'test-document.pdf',
      };

      // Override isImage to return false for the PDF
      jest.spyOn(imageProcessorService, 'isImage').mockReturnValue(false);

      const mockMediaEntity: MockMedia = {
        id: 2,
        filename: 'test-document.pdf',
        originalname: docFile.originalname,
        url: 'https://minio-server/test-bucket/test-document.pdf',
        mimetype: docFile.mimetype,
        type: MediaType.DOCUMENT,
        size: docFile.size,
        metadata: {},
        thumbnailUrl: '',
        bucketName: 'test-bucket',
      };

      jest.spyOn(mediaRepository, 'create').mockReturnValue(mockMediaEntity as Media);
      jest.spyOn(mediaRepository, 'save').mockResolvedValue(mockMediaEntity as Media);

      const result = await service.uploadFile(docFile);

      // Bağlı metot referansları kullanıyoruz
      const processImageSpy = jest.spyOn(imageProcessorService, 'processImage');
      const generateThumbnailSpy = jest.spyOn(imageProcessorService, 'generateThumbnail');
      const uploadFileSpy = jest.spyOn(minioService, 'uploadFile');
      const createSpy = jest.spyOn(mediaRepository, 'create');
      const saveSpy = jest.spyOn(mediaRepository, 'save');

      // Verify image processing wasn't performed
      expect(processImageSpy).not.toHaveBeenCalled();
      expect(generateThumbnailSpy).not.toHaveBeenCalled();

      // Verify the file was still uploaded to MinIO
      expect(uploadFileSpy).toHaveBeenCalledTimes(1);

      // Verify a media entity was created and saved
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(mockMediaEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of media entities', async () => {
      const mockMediaArray: MockMedia[] = [
        { id: 1, filename: 'file1.jpg' },
        { id: 2, filename: 'file2.jpg' },
      ];

      jest.spyOn(mediaRepository, 'find').mockResolvedValue(mockMediaArray as Media[]);

      const result = await service.findAll();

      const findSpy = jest.spyOn(mediaRepository, 'find');
      expect(findSpy).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockMediaArray);
    });
  });

  describe('findOne', () => {
    it('should return a media entity if it exists', async () => {
      const mockMediaEntity: MockMedia = { id: 1, filename: 'file1.jpg' };

      jest.spyOn(mediaRepository, 'findOneBy').mockResolvedValue(mockMediaEntity as Media);

      const result = await service.findOne(1);

      const findOneBySpy = jest.spyOn(mediaRepository, 'findOneBy');
      expect(findOneBySpy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockMediaEntity);
    });

    it('should throw an exception if the media entity does not exist', async () => {
      jest.spyOn(mediaRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Media with ID 999 not found');
    });
  });

  describe('remove', () => {
    it('should delete a media entity and its files from MinIO', async () => {
      const mockMediaEntity: MockMedia = {
        id: 1,
        filename: 'file1.jpg',
        bucketName: 'test-bucket',
        url: 'https://minio-server/test-bucket/file1.jpg',
        thumbnailUrl: 'https://minio-server/test-bucket/thumb_file1.jpg',
      };

      // await kullanmayan async fonksiyonlarda async kaldırıldı
      jest
        .spyOn(mediaRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(mockMediaEntity as Media));
      jest
        .spyOn(mediaRepository, 'delete')
        .mockImplementation(() => Promise.resolve({ affected: 1, raw: {} }));
      jest.spyOn(minioService, 'deleteFile').mockImplementation(() => Promise.resolve());

      await service.remove(1);

      // unbound method hatalarını çözmek için spyları kullanıyoruz
      const deleteFileSpy = jest.spyOn(minioService, 'deleteFile');
      const deleteSpy = jest.spyOn(mediaRepository, 'delete');

      // Verify files were deleted from MinIO
      expect(deleteFileSpy).toHaveBeenCalledTimes(2);

      // Verify the entity was deleted from the database
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });
});
