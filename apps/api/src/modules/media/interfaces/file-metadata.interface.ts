export interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
  mimetype: string;
  originalname: string;
  encoding?: string;
  // --- CHANGE any TO unknown ---
  exif?: Record<string, unknown>;
  // --- END CHANGE ---
  location?: {
    latitude?: number;
    longitude?: number;
  };
  createdAt?: Date;
}
