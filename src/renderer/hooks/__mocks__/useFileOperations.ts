export const useFileOperations = () => ({
  validateFile: () => Promise.resolve(true),
  processFile: (file: File) => Promise.resolve({
    id: `test-${Date.now().toString(36)}`,
    name: file.name,
    type: file.type,
    path: URL.createObjectURL(file),
    duration: 10,
    width: 1920,
    height: 1080,
    thumbnail: '/test.webm',
    metadata: {
      duration: 10,
      fps: 30,
      codec: 'h264',
      width: 1920,
      height: 1080
    }
  })
});
