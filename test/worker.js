const { workerData, parentPort } = require('node:worker_threads');
const https = require('https');
const http = require('http');
const { performance } = require('node:perf_hooks');

const { threadId, requests, url } = workerData;

async function runRequests() {
  let completedRequests = 0;
  let totalTime = 0;
  let errors = 0;

  for (let i = 0; i < requests; i++) {
    const startTime = performance.now();
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url);

      if (!response.ok) {
        errors++;
        console.error(`Thread ${threadId}: Request ${i} failed with status ${response.status}`);
        continue;
      }

      await response.text(); // Read the response body
      const endTime = performance.now();
      totalTime += (endTime - startTime);
      completedRequests++;
    } catch (err) {
      errors++;
      console.error(`Thread ${threadId}: Request ${i} error: ${err}`);
    }
  }

  parentPort.postMessage({
    threadId: threadId,
    requests: completedRequests,
    time: totalTime,
    errors: errors,
  });
}

runRequests();
