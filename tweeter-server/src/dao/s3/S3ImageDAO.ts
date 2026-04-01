import { PutObjectCommand, S3Client, ObjectCannedACL } from "@aws-sdk/client-s3";
import { AwsConfig } from "../../config/TableNames";
import { ImageDAO } from "../interfaces/ImageDAO";

export class S3ImageDAO implements ImageDAO {
  private readonly client = new S3Client({ region: AwsConfig.region });

  public async putImage(
    fileName: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    const decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );

    const command = new PutObjectCommand({
      Bucket: AwsConfig.bucketName,
      Key: `image/${fileName}`,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    });

    await this.client.send(command);

    return `https://${AwsConfig.bucketName}.s3.${AwsConfig.region}.amazonaws.com/image/${fileName}`;
  }
}
