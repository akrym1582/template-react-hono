export const mockBlobServiceClient = {
  getContainerClient: vi.fn().mockReturnValue({
    getBlockBlobClient: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({}),
      download: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    }),
  }),
};

vi.mock("@azure/storage-blob", () => ({
  BlobServiceClient: {
    fromConnectionString: vi.fn().mockReturnValue(mockBlobServiceClient),
  },
}));
