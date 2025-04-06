import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable; // Zorunlu hale getirildi
  destination: string; // Eklenmeli
  filename: string; // Eklenmeli
  path: string; // Eklenmeli
  buffer: Buffer;
}
