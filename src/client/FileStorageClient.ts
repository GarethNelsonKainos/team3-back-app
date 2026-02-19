export default interface FileStorageClient {
	uploadFile(file: Express.Multer.File): Promise<string>;
	getSignedUrl(key: string): Promise<string>;
}
