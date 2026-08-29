# GlobeSkill Database Backup & Disaster Recovery Operational Handbook

## 1. Executive Summary & Compliance Mandate

As an NGO delivering accredited digital skilling, youth employment credentials, and managing donor capital, GlobeSkill maintains strict data governance policies aligned with:
- **UN SDG Impact Audit Integrity**: Ensuring tamper-proof historical logs of learner graduations.
- **Donor Accountability**: Preserving cryptographic financial donation records and allocation histories.
- **RPO (Recovery Point Objective)**: Maximum allowable data loss &le; **24 hours** (Daily automated snapshots) or **&le; 5 minutes** (Point-in-Time Recovery enabled).
- **RTO (Recovery Time Objective)**: Full database restoration &le; **30 minutes**.

---

## 2. Supabase Built-in Backup Architecture

Supabase provides two native backup mechanisms depending on the project tier:

### A. Daily Automated Snapshots (Free / Pro Tier)
- **Schedule**: Automatically executed every 24 hours during regional off-peak hours.
- **Retention**:
  - **Free Tier**: 7 days retention.
  - **Pro Tier**: 7 days retention (upgradeable to 30 days).
- **Location**: Supabase-managed encrypted Amazon S3 cold storage.
- **How to Trigger a Restore via Dashboard**:
  1. Navigate to **[Supabase Dashboard](https://supabase.com/dashboard)** &rarr; Choose your **GlobeSkill** project.
  2. Select **Settings (Gear Icon)** &rarr; **Database** &rarr; Scroll down to **Backups**.
  3. Under **Scheduled Backups**, locate the desired date/time snapshot.
  4. Click **Restore** &rarr; Confirm project reference. The database will enter maintenance mode and restore within 5–15 minutes.

### B. Point-in-Time Recovery (PITR) (Enterprise & Pro Add-on)
- **Granularity**: Continuous WAL (Write-Ahead Logging) archiving allowing restoration down to the **exact second** (e.g. before an accidental `DROP TABLE` or bad migration).
- **Enabling PITR**:
  1. Go to **Settings** &rarr; **Add-ons** &rarr; **Point in Time Recovery**.
  2. Enable PITR (retains continuous change logs for 7, 14, or 28 days).

---

## 3. Independent Remote Cold-Storage Vault Architecture

To comply with audit rules requiring external backups isolated from the primary cloud provider, GlobeSkill deploys an independent backup pipeline:

```
┌────────────────────────────────────────────────────────┐
│              GlobeSkill Supabase Database              │
│       (db.project-ref.supabase.co:5432 / PostgreSQL)   │
└───────────────────────────┬────────────────────────────┘
                            │ (pg_dump / Supabase CLI)
                            ▼
┌────────────────────────────────────────────────────────┐
│          Automated Daily Backup Runner (GitHub CI)     │
│   1. Schema Dump: schema_YYYY-MM-DD.sql                │
│   2. Data Dump:   data_YYYY-MM-DD.sql                  │
│   3. Compression: gzip -9                              │
│   4. Encryption:  GPG / AES-256 Symmetric              │
│   5. Verification: SHA-256 Checksum                    │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Primary Cold Vault    │   │    Secondary Cold Vault   │
│   AWS S3 Glacier Deep     │   │   Cloudflare R2 / GCS     │
│   (90-day WORM policy)    │   │   (Immutable Object Lock) │
└───────────────────────────┘   └───────────────────────────┘
```

---

## 4. Manual CLI Backup Procedures

### A. Exporting Database Schema Only
Exports all tables, constraints, foreign keys, RLS policies, and stored procedures without learner records:

```bash
# Using Supabase CLI
supabase db dump -f supabase/backups/schema_$(date +%Y%m%d).sql

# Using standard pg_dump
pg_dump "$DATABASE_URL" \
  --schema-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  -f schema_$(date +%Y%m%d).sql
```

### B. Exporting Complete Database (Schema + Data)
```bash
# Export and compress with maximum gzip compression
pg_dump "$DATABASE_URL" \
  --schema=public \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges | gzip -9 > globeskill_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### C. Encrypting the Backup Dump for Cold Storage
```bash
# Encrypt using AES-256 symmetric cipher with GPG
gpg --symmetric --cipher-algo AES256 \
  --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
  -o globeskill_backup_$(date +%Y%m%d).sql.gz.gpg \
  globeskill_backup_$(date +%Y%m%d).sql.gz

# Generate SHA-256 checksum for tamper-evidence
sha256sum globeskill_backup_$(date +%Y%m%d).sql.gz.gpg > checksums.sha256
```

---

## 5. Automated Disaster Recovery Drill (Step-by-Step Restoration)

In the event of database corruption, data loss, or server failure, follow this exact restoration runbook:

1. **Verify Integrity of Encrypted Archive**:
   ```bash
   sha256sum -c checksums.sha256
   ```
2. **Decrypt Archive**:
   ```bash
   gpg --decrypt --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
     -o restored_backup.sql.gz globeskill_backup_YYYYMMDD.sql.gz.gpg
   ```
3. **Decompress**:
   ```bash
   gunzip restored_backup.sql.gz
   ```
4. **Restore into PostgreSQL / Supabase**:
   ```bash
   # Connect to target staging or disaster-recovery database
   psql "$RESTORE_DATABASE_URL" -f restored_backup.sql
   ```
5. **Post-Restoration Sanity Audit**:
   Execute our built-in security and RBAC validation suite:
   ```bash
   npm run test:db
   npm run test:security
   ```
   Verify that all 28 database constraints and 10 security assertions pass.
