import { boot } from 'quasar/wrappers';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { useTaskStore } from '@/stores/task-store';

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
    tasks: { schema: taskSchema },
    syncQueue: { schema: syncQueueSchema },
  });

  return dbInstance;
}

export default boot(() => {
});
