import { boot } from 'quasar/wrappers';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

const taskSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    description: { type: 'string' },
    completed: { type: 'boolean' },
  },
  required: ['id', 'title'],
};

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await createRxDatabase({
    name: 'tododb',
    storage: getRxStorageDexie(),
  });

  await dbInstance.addCollections({
    tasks: { schema: taskSchema },
  });

  return dbInstance;
}

export default boot(() => {
});
