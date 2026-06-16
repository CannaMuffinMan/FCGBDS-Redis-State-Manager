# FCGBDS-Redis-State-Manager
Redis-backed state manager for the bot defense system. Tracks hits for IPs, devices, payloads, and token anomalies using counters with automatic TTLs. Enables horizontal scaling across multiple instances while maintaining shared threat intelligence. Includes local memory fallback if Redis is unavailable.
