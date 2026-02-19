import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import type FileStorageClient from "./FileStorageClient";

export default class S3FileStorageClient implements FileStorageClient {
	private s3Client: S3Client;
	private bucketName: string;

	constructor() {
		const region = process.env.AWS_REGION;
		const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
		const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
		const bucketName = process.env.S3_BUCKET_NAME;

		if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
			throw new Error("Missing required S3 environment configuration");
		}

		this.s3Client = new S3Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});

		this.bucketName = bucketName;
	}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		const today = new Date().toISOString().split("T")[0];
		const key = `applications/${today}-${randomUUID()}-${file.originalname}`;

		try {
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			});

			await this.s3Client.send(command);
			// Return the object key (not full URL) — DB stores the key
			return key;
		} catch (error) {
			throw new Error(`Failed to upload file to S3: ${error}`);
		}
	}

	async getDownloadUrl(key: string): Promise<string> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
		} catch (error) {
			throw new Error(`Failed to generate download URL: ${error}`);
		}
	}
}
