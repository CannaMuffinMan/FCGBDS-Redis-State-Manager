# FCGBDS Benchmarking

This folder contains lightweight load testing helpers so maintainers can publish reproducible numbers.

## Install

`npm install`

## Quick benchmark

`npm run benchmark:quick`

## Custom benchmark

`npm run benchmark -- --url http://127.0.0.1:3001/api/auth/login --connections 50 --duration 30 --method POST`

## Reporting format

Publish:

1. Endpoint tested
2. Request body profile
3. Concurrency and duration
4. Median latency
5. p95 latency
6. Throughput (req/sec)
7. Error rate

Do not claim numbers without attaching your command and test conditions.
