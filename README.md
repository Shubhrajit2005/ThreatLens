# ThreatLens

ThreatLens is a full-stack **Threat Intelligence Aggregation & IOC Investigation Platform** designed to collect, normalize, validate, deduplicate, enrich, score, and investigate Indicators of Compromise (IOCs).

It provides security analysts with a centralized interface for monitoring threat intelligence, investigating suspicious indicators, managing investigations, and reviewing security audit activity.

---

## Features

### Threat Intelligence

- Multiple threat intelligence feed adapters
- AlienVault OTX integration
- URLhaus integration
- MalwareBazaar integration
- CISA Known Exploited Vulnerabilities (KEV) feed adapter
- Automated IOC normalization
- IOC validation
- IOC deduplication
- Multi-source IOC tracking
- IOC enrichment
- Risk scoring

### IOC Management

- Create IOC
- Read IOC
- Update IOC
- Delete IOC
- IOC type validation
- IOC normalization
- Duplicate detection
- Search and filter IOCs
- Detailed IOC investigation view

Supported IOC categories include:

- IPv4
- IPv6
- Domain
- URL
- Hash

### Investigation Management

- Create investigations
- Associate investigations with IOCs
- Investigation priorities
  - Low
  - Medium
  - High
  - Critical
- Investigation status tracking
- Investigation details
- Investigation notes
- Investigation audit events

### Security

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Admin-only audit logs
- Security middleware
- Rate limiting
- Request validation
- Centralized error handling
- Security headers

### Dashboard

The dashboard provides an overview of:

- Total IOCs
- IOC risk distribution
- IOC type distribution
- Feed statistics
- Recent investigations

### Audit Logging

ThreatLens records important analyst and system actions including:

- IOC creation
- IOC updates
- IOC deletion
- Investigation creation
- Investigation updates
- Investigation note creation

Administrators can review audit events through the Audit Logs interface.

---

# Architecture

```text
                    Public Threat Intelligence Feeds
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Feed Manager   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Feed Adapters  │
                         │                 │
                         │ OTX             │
                         │ URLhaus         │
                         │ MalwareBazaar   │
                         │ CISA KEV        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Normalization   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Validation    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Deduplication  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Enrichment    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Risk Scoring   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    MongoDB      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Express REST   │
                         │      API        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ React Dashboard │
                         └─────────────────┘