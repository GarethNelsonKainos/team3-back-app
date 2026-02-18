import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type FileStorageClient from "./FileStorageClient";

export default class S3FileStorageClient implements FileStorageClient {
	private s3Client: S3Client;
	private bucketName: string;

	constructor() {
		this.s3Client = new S3Client({
			region: process.env.AWS_REGION,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
			},
		});

		this.bucketName = process.env.S3_BUCKET_NAME || "";
	}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		const key = `applications/${Date.now()}-${file.originalname}`;

		try {
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			});

			await this.s3Client.send(command);
			return key;
		} catch (error) {
			throw new Error(`Failed to upload file to S3: ${error}`);
		}
	}
}
