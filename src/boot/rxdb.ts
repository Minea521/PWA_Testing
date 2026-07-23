import { boot } from 'quasar/wrappers';
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';

addRxPlugin(RxDBMigrationSchemaPlugin);

const taskSchema = {
  version: 3,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    description: { type: 'string' },
    completed: { type: 'boolean' },
    createdAt: { type: 'string' },
    scheduledAt: { type: 'string' },
    completedAt: { type: 'string' },
    notified: { type: 'boolean' },
  },
  required: ['id', 'title'],
};

const syncQueueSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    operation: { type: 'string' },
    taskId: { type: 'string' },
    payload: { type: 'object' },
    createdAt: { type: 'number' },
  },
  required: ['id', 'operation', 'taskId', 'createdAt'],
};

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await createRxDatabase({
    name: 'tododb',
    storage: getRxStorageDexie(),
  });

  await dbInstance.addCollections({
    tasks: {
      schema: taskSchema,
      migrationStrategies: {
        1: function (oldDoc: any) {
          oldDoc.createdAt = oldDoc.createdAt || new Date().toISOString();
          oldDoc.scheduledAt = oldDoc.scheduledAt || null;
          return oldDoc;
        },
        2: function (oldDoc: any) {
          oldDoc.completedAt = oldDoc.completedAt || null;
          return oldDoc;
        },
        3: (oldDoc: any) => { oldDoc.notified = oldDoc.notified || false; return oldDoc; },
      },
    },
    syncQueue: { schema: syncQueueSchema },
  });

  return dbInstance;
}

export default boot(() => {});