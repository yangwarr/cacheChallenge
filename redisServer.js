/*

Solution comment

We can use redis as our in-memory key/value database.
By client.set we can store records, set a TTL of 7 days and refresh this TTL whenever this TTL is accessed.
To delete in real time Redis will take care of that automatically by checking our TTL.
To handle both functions being accessed in real-time we can use async to do both processes in parallel 
In this solution we are using a not too efficient data structure, for millions of records it would be crucial to look 
at the memory spenditure, ways to optimize the access count logic (maybe storing those accesses in another structure and updating it in batches every X time or every Y cache accesses), 
using hashes would also optimize the memory in this case as well.

*/

const redis = require('redis');
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});
const CACHE_TTL = 604800; // 7*24*60*60 = 7 days in seconds

client.on('error', (err) => {
  console.error('Redis error:', err);
});

const processRecord = async (record) => {
  const recordKey = `${record.id}`; // create a unique key for the record
  
  try {
      await client.set(recordKey, CACHE_TTL, JSON.stringify(record));
  }
  catch (err) {
    console.error('Error in processRecord:', err);
  } // Set record in cache with TTL
  console.log(`Record ${record.id} added to cache`);
};

const anotherProcess = async (record) => {
  let recordKey = `${record.id}`;
  
  try {
    let record = await client.get(recordKey);
    if (!record) {
      console.log('No record found for key', recordKey);
      return;
    }
    console.log('Record found in cache:', JSON.parse(record));

    await client.expire(recordKey, CACHE_TTL);
    console.log('TTL refreshed for record', record);
  } 
  catch (err) {
    console.error('Error in anotherProcess:', err);
  }
};

const main = async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');

    // Add records to Redis cache
    const record1 = { id: 4, name: 'Record One', data: 'Some data' };
    const record2 = { id: 5, name: 'Record Two', data: 'Other data 123' };
    const record3 = { id: 6, name: 'Record Three', data: 'Other data 456' };

    await processRecord(record1);
    await processRecord(record2);
    await processRecord(record3);

    // Access the cache from another process
    await anotherProcess(record1);
    await anotherProcess(record2);
    await anotherProcess(record3);

  } 
  catch (err) {
    console.error('Error in main process:', err);
  } 
  finally {
    await client.quit();
    console.log('Disconnected from Redis');
  }
};

main();
