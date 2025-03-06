const { Worker } = require('node:worker_threads');
const https = require('https');
const http = require('http');
const { performance } = require('node:perf_hooks');

const numThreads = 4; // Number of worker threads
const requestsPerThread = 250; // Number of requests per thread
const targetUrl = 'http://localhost:3000/leaderboard'; // Target URL for stress test

let completedThreads = 0;
let totalRequests = 0;
let totalTime = 0;
let totalErrors = 0;

function runTest() {
  console.log('Starting stress test...');

  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker('./worker.js', {
      workerData: {
        threadId: i,
        requests: requestsPerThread,
        url: targetUrl,
      },
    });

    worker.on('message', (message) => {
      totalRequests += message.requests;
      totalTime += message.time;
      totalErrors += message.errors;
    });

    worker.on('error', (err) => {
      console.error(`Worker ${i} error: ${err}`);
      totalErrors += requestsPerThread;
    });

    worker.on('exit', (code) => {
      completedThreads++;
      console.log(`Worker ${i} finished with code ${code}`);

      if (completedThreads === numThreads) {
        // All threads completed
        const averageTime = totalTime / totalRequests;
        const requestsPerSecond = 1000 / averageTime * numThreads;
        const errorRate = (totalErrors / totalRequests) * 100;

        console.log('--------------------------------');
        console.log('Stress test completed!');
        console.log(`Total requests: ${totalRequests}`);
        console.log(`Average time per request: ${averageTime.toFixed(2)} ms`);
        console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
        console.log(`Error rate: ${errorRate.toFixed(2)}%`);
        console.log('--------------------------------');
      }
    });
  }
}

// runTest();
