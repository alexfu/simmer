export interface ImageStorage {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
