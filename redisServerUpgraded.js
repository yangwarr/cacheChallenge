/*

[...]


We can set the TTL to expire after 7 days initially and add an access counter, while this counter is below 3,
we keep refreshing it for 7 days, once it hits 3 we start refreshing it for 14 days that way we'll be able to access
records that haven't been accessed in the 7 last days but have at least 3 accesses

*/

const redis = require('redis');
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});
client.on('error', (err) => {
  console.error('Redis error:', err);
});

const CACHE_TTL_7_DAYS = 604800; 
const CACHE_TTL_14_DAYS = 1209600;  
const MIN_ACCESS_COUNT = 3;

const processRecord = async (record) => {
  const recordKey = `record:${record.id}`;  // Key for the record
  const accessCountKey = `accessCount:${record.id}`;  // Key for tracking access count

  // Store the record with an initial TTL of 7 days
  await client.set(recordKey, JSON.stringify(record));
  await client.expire(recordKey, CACHE_TTL_7_DAYS);

  // Initialize the access count to 0 with a TTL of 14 days
  await client.set(accessCountKey, 0);
  await client.expire(accessCountKey, CACHE_TTL_14_DAYS);

  console.log(`Record ${record.id} added with a TTL of 7 days and access count initialized.`);
};

const anotherProcess = async (recordId) => {
  const recordKey = `record:${recordId.id}`;
  const accessCountKey = `accessCount:${recordId.id}`;

  try {
    let record = await client.get(recordKey);
    if (!record) {
      console.log(`No record found for key ${recordKey}`);
      return;
    }

    console.log('Record found in cache:', JSON.parse(record));

    // Increment access count
    let accessCount = await client.incr(accessCountKey);

    // Check if the record has been accessed at least 3 times
    if (accessCount >= MIN_ACCESS_COUNT) {
      // Extend the TTL to 14 days for the record
      await client.expire(recordKey, CACHE_TTL_14_DAYS);
      console.log(`Record ${recordId.id} TTL extended to 14 days. Access count: ${accessCount}`);
    } 
    else {
      // Refresh the TTL to 7 days
      await client.expire(recordKey, CACHE_TTL_7_DAYS);
      console.log(`Record ${recordId.id} TTL refreshed to 7 days. Access count: ${accessCount}`);
    }

    // Keep the access count key alive for 14 days total
    await client.expire(accessCountKey, CACHE_TTL_14_DAYS);

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

    await anotherProcess(record1);
    await anotherProcess(record2);
    await anotherProcess(record3);

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
