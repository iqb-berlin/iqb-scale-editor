import { FileAccessService } from '../app/shared/services/file-access.service';

/** Fake FileSystemFileHandle that records written content. */
export function fakeHandle(name: string, content = '') {
  const handle = {
    name,
    written: [] as string[],
    getFile: async () => new File([content], name, { type: 'application/json' }),
    createWritable: async () => ({
      write: async (c: string) => void handle.written.push(c),
      close: async () => undefined,
    }),
  };
  return handle;
}
export type FakeHandle = ReturnType<typeof fakeHandle>;

/** Mock for FileAccessService; `supported` and picker results are configurable per test. */
export function mockFileAccess(supported: boolean) {
  return {
    supported,
    pickOpen: vi.fn<() => Promise<FakeHandle | null>>(),
    pickSave: vi.fn<(name: string) => Promise<FakeHandle | null>>(),
    write: vi.fn(async (h: FakeHandle, c: string) => {
      const w = await h.createWritable();
      await w.write(c);
      await w.close();
    }),
  };
}
export type FileAccessMock = ReturnType<typeof mockFileAccess>;

export function provideFileAccessMock(mock: FileAccessMock) {
  return { provide: FileAccessService, useValue: mock };
}
