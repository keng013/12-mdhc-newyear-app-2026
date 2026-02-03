# MDHC New Year App - Deployment Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- At least 2GB RAM available

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd 12-mdhc-newyear-app/Deployment
```

### 2. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Important:** Change these values in `.env`:

- `DB_PASSWORD` - Use strong password
- `JWT_SECRET` - Generate random 32+ character string
- `ADMIN_PASSWORD` - Set secure admin password
- `VITE_API_URL` - Update to your domain (for production)

### 3. Build and Start

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Initialize Database

```bash
# Run migrations (first time only)
docker-compose exec backend npx prisma migrate deploy

# Optional: Seed initial data
docker-compose exec backend npx prisma db seed
```

## Service Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

## Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker-compose exec backend npx prisma migrate deploy
```

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres mdhc_newyear > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using docker cp
docker-compose exec postgres pg_dump -U postgres mdhc_newyear | gzip > backup.sql.gz
```

### Restore Database

```bash
# From SQL file
docker-compose exec -T postgres psql -U postgres mdhc_newyear < backup.sql

# From gzipped file
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres mdhc_newyear
```

### Access Database

```bash
# Using psql
docker-compose exec postgres psql -U postgres mdhc_newyear

# Using Prisma Studio
docker-compose exec backend npx prisma studio
```

## Production Deployment

### 1. SSL/HTTPS Setup

Update `nginx.conf` to include SSL:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

Mount SSL certificates in `docker-compose.yml`:

```yaml
frontend:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

### 2. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS
- [ ] Configure firewall (allow only 80, 443)
- [ ] Disable direct database access (remove port 5432 exposure)
- [ ] Set up automated backups
- [ ] Enable Docker logging
- [ ] Use Docker secrets for sensitive data

### 3. Performance Optimization

```yaml
# Add to backend service
deploy:
  resources:
    limits:
      cpus: "1"
      memory: 1G
    reservations:
      cpus: "0.5"
      memory: 512M
```

## Deploying to Subpath `/newyear2026` (e.g. https://mdhc-cloud.com/newyear2026)

1. **Frontend build config**
   - In `mdhc-newyear-frontend/vite.config.ts`, set:
     ```js
     base: '/newyear2026/',
     ```
2. **API URL**
   - In `.env`, set:
     ```env
     VITE_API_URL=https://mdhc-cloud.com/newyear2026/api
     ```
3. **nginx.conf**
   - Use the provided `nginx.conf` with these locations:
     - `/newyear2026/` for frontend
     - `/newyear2026/api/` for backend
4. **Access**
   - App: https://mdhc-cloud.com/newyear2026
   - API: https://mdhc-cloud.com/newyear2026/api

5. **Optional: Redirect root to subpath**
   - The nginx config will redirect `/` to `/newyear2026/` by default.

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:4000/api/health

# Frontend
curl http://localhost

# Database
docker-compose exec postgres pg_isready
```

### Resource Usage

```bash
# View container stats
docker stats

# View logs size
docker-compose exec backend du -sh /var/log
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check ports
netstat -tuln | grep -E '(80|443|4000|5432)'

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database connection issues

```bash
# Check database is running
docker-compose exec postgres pg_isready

# Check environment variables
docker-compose exec backend env | grep DATABASE_URL

# Test connection
docker-compose exec backend npx prisma db push
```

### Frontend not loading

```bash
# Check nginx logs
docker-compose logs frontend

# Verify build
docker-compose exec frontend ls -la /usr/share/nginx/html

# Test nginx config
docker-compose exec frontend nginx -t
```

## Maintenance

### Regular Tasks

- **Daily**: Check logs for errors
- **Weekly**: Review disk usage, backup database
- **Monthly**: Update dependencies, security patches

### Updates

```bash
# Update Docker images
docker-compose pull

# Update dependencies (in development)
cd ../mdhc-newyear-api && npm update
cd ../mdhc-newyear-frontend && npm update

# Rebuild
docker-compose up -d --build
```

## Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this README
3. Contact system administrator
