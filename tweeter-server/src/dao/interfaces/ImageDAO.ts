export interface ImageDAO {
  putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
}
