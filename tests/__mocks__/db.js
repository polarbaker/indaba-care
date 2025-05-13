// Mock for src/lib/db.ts
const mockDBs = {
  familyDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'family1', name: 'Test Family' } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'family1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
  childDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'child1', name: 'Test Child' } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'child1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
  nannyDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'nanny1', name: 'Test Nanny' } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'nanny1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
  sessionDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'session1', date: new Date().toISOString() } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'session1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
  feedbackDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'feedback1', message: 'Test Feedback' } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'feedback1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
  photoMetadataDB: {
    allDocs: jest.fn(() => Promise.resolve({
      rows: [{ doc: { _id: 'photo1', url: 'test-url.jpg' } }]
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'photo1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true }])),
    sync: jest.fn(),
    changes: jest.fn(() => ({ on: jest.fn(), cancel: jest.fn() })),
  },
};

module.exports = mockDBs;
