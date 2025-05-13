// Mock for pouchdb-browser
const PouchDBMock = jest.fn().mockImplementation((name) => {
  return {
    name,
    allDocs: jest.fn(() => Promise.resolve({
      rows: [
        { 
          doc: { 
            _id: 'doc1', 
            familyId: 'test-user-id',
            name: 'Test Data',
          } 
        },
      ],
    })),
    get: jest.fn(() => Promise.resolve({ _id: 'doc1', _rev: 'rev1' })),
    put: jest.fn(() => Promise.resolve({ ok: true })),
    bulkDocs: jest.fn(() => Promise.resolve([{ ok: true, id: 'doc1', rev: 'rev1' }])),
    sync: jest.fn(() => ({
      on: jest.fn(),
      cancel: jest.fn()
    })),
    changes: jest.fn(() => ({
      on: jest.fn(),
      cancel: jest.fn()
    })),
    replicate: {
      to: jest.fn(() => ({
        on: jest.fn(),
        cancel: jest.fn()
      })),
      from: jest.fn(() => ({
        on: jest.fn(),
        cancel: jest.fn()
      }))
    }
  };
});

module.exports = PouchDBMock;
