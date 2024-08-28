This is only intended as a warmup question that should not take no more than 10-15 minutes to
piece something together. You can write pseudo-code where you see fit, we prefer a solution in
Javascript.

Imagine we have a very simple ETL process to pull records from an API. As we pull these
records, we are also adding them to a cache to be used in a concurrent process that accesses
some elements from the cache.

const processRecord = record => {
// this is where we add things to the cache
}
const anotherProcess = () => {
// we occcasionally access certain elements from the cache
}

[1] What is the simplest representation of a cache that you can think of in this scenario?
As you add records to this cache, you realize that it grows a lot faster than you imagined at first.
So now you need a way to remove records from the cache.

[2] Implement the logic where any key that hasn’t been accessed in the last 7 days will be
deleted in real-time (second-level delay) and be a lightweight operation (O(log n) or less).
PS: Keep in mind that the anotherProcess function is also running at the same time.
PSS: What if this cache has to hold millions of records at a time? How would your solution
change then?

[3] (This is optional work where you can assume the previous point works as expected. Send it
as a separate code snippet.)
What if you change your mind and decide that you still want to keep the records that have been
accessed at least 3 times in the last 14 days even if they haven’t been accessed in the last 7
days?