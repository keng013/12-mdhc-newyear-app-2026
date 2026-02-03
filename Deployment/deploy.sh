#!/bin/bash

# MDHC New Year App Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|backup|update]

set -e

PROJECT_NAME="mdhc-newyear"
BACKUP_DIR="./backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Creating from .env.example..."
        cp .env.example .env
        log_warning "Please edit .env file with your configuration"
        exit 1
    fi
}

start_services() {
    log_info "Starting services..."
    check_env
    docker-compose up -d --build
    log_info "Waiting for services to be ready..."
    sleep 10
    docker-compose ps
    log_info "Services started successfully!"
}

stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_info "Services stopped successfully!"
}

restart_services() {
    log_info "Restarting services..."
    docker-compose restart
    log_info "Services restarted successfully!"
}

view_logs() {
    log_info "Viewing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

backup_database() {
    log_info "Creating database backup..."
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
    
    docker-compose exec -T postgres pg_dump -U postgres mdhc_newyear | gzip > $BACKUP_FILE
    
    if [ -f $BACKUP_FILE ]; then
        log_info "Backup created: $BACKUP_FILE"
        log_info "Backup size: $(du -h $BACKUP_FILE | cut -f1)"
    else
        log_error "Backup failed!"
        exit 1
    fi
}

update_app() {
    log_info "Updating application..."
    
    # Backup first
    backup_database
    
    # Pull latest code
    log_info "Pulling latest code..."
    git pull
    
    # Rebuild containers
    log_info "Rebuilding containers..."
    docker-compose up -d --build
    
    # Run migrations
    log_info "Running database migrations..."
    docker-compose exec backend npx prisma migrate deploy
    
    log_info "Update completed successfully!"
}

check_health() {
    log_info "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        log_info "✓ Backend is healthy"
    else
        log_warning "✗ Backend is not responding"
    fi
    
    # Check frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        log_info "✓ Frontend is healthy"
    else
        log_warning "✗ Frontend is not responding"
    fi
    
    # Check database
    if docker-compose exec postgres pg_isready > /dev/null 2>&1; then
        log_info "✓ Database is healthy"
    else
        log_warning "✗ Database is not responding"
    fi
}

show_usage() {
    cat << EOF
MDHC New Year App Deployment Script

Usage: ./deploy.sh [COMMAND]

Commands:
    start       Start all services
    stop        Stop all services
    restart     Restart all services
    logs        View logs (real-time)
    backup      Create database backup
    update      Update application (pull, rebuild, migrate)
    health      Check service health
    help        Show this help message

Examples:
    ./deploy.sh start
    ./deploy.sh logs
    ./deploy.sh backup
EOF
}

# Main script
case "$1" in
    start)
        start_services
        check_health
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        check_health
        ;;
    logs)
        view_logs
        ;;
    backup)
        backup_database
        ;;
    update)
        update_app
        check_health
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac

exit 0
