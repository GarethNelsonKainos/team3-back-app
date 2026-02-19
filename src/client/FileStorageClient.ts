export default interface FileStorageClient {
	uploadFile(file: Express.Multer.File): Promise<string>;
	getDownloadUrl(key: string): Promise<string>;
}
