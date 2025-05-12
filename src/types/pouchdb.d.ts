import PouchDB from 'pouchdb-browser';

declare module 'pouchdb-browser' {
  interface ExistingDocument<Content extends {}> {
    _id: string;
    _rev: string;
    _attachments?: {
      [attachmentId: string]: Attachment;
    };
    [key: string]: any; // Allow any additional properties for flexible document handling
  }
}

export {};
