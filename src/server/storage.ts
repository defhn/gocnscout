import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireEnv } from "@/lib/env";

export function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export async function uploadPrivateFile(key: string, body: Buffer, contentType: string) {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function createPrivateDownloadUrl(key: string) {
  if (key.startsWith("/")) {
    return key;
  }
  return getSignedUrl(
    r2Client(),
    new GetObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
    }),
    { expiresIn: 60 * 10 },
  );
}
