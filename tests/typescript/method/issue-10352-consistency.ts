export interface Store {
  getRecord(collectionName: string, documentPath: string): TaskEither<Error, Option<GenericRecord>>;
}

export default class StoreImpl extends Service implements Store {
  getRecord(collectionName: string, documentPath: string): TaskEither<Error, Option<GenericRecord>> {
    // Do some stuff.
  }
}
