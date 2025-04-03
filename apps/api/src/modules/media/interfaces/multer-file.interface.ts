// apps/api/src/modules/media/interfaces/multer-file.interface.ts
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

// Projede kullanılacak MulterFile arayüzü
export interface MulterFile {
  /** Form alanının adı */
  fieldname: string;
  /** Orijinal dosya adı */
  originalname: string;
  /** Dosya kodlaması */
  encoding: string;
  /** MIME tipi */
  mimetype: string;
  /** Dosya boyutu (byte cinsinden) */
  size: number;
  /** Dosya içeriği (buffer) */
  buffer: Buffer;
  /** Dosyanın kaydedildiği dizin (opsiyonel) */
  destination?: string;
  /** Dosya adı (opsiyonel) */
  filename?: string;
  /** Dosya yolu (opsiyonel) */
  path?: string;
  /** Dosya stream'i (opsiyonel) */
  stream?: Readable;
}
