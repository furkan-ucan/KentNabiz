export interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
  mimetype: string;
  originalname: string;
  encoding?: string;
  exif?: Record<string, any>;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  createdAt?: Date;
}
