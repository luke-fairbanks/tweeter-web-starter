import { ImageDAO } from "../interfaces/ImageDAO";

export class FakeImageDAO implements ImageDAO {
  public async putImage(fileName: string, imageStringBase64Encoded: string): Promise<string> {
    return `https://example.com/image/${fileName}`;
  }
}
