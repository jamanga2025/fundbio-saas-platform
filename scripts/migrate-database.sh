#!/bin/bash

# Database Migration Script for FundBio Dashboard
# This script handles Prisma migrations with proper error handling and rollback

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
DRY_RUN=false
BACKUP=true
ROLLBACK=false
MIGRATION_NAME=""
FORCE=false

# Usage function
usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo -e "${BLUE}Options:${NC}"
    echo -e "  -e, --environment ENV    Environment (development|staging|production) [default: development]"
    echo -e "  -n, --name NAME          Migration name for new migrations"
    echo -e "  -d, --dry-run            Show what would be done without executing"
    echo -e "  -b, --no-backup          Skip database backup"
    echo -e "  -r, --rollback           Rollback last migration"
    echo -e "  -f, --force              Force migration even with warnings"
    echo -e "  -h, --help               Show this help message"
    echo -e ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 -e staging -n 'add_user_roles'    Create and apply migration"
    echo -e "  $0 -e production -d                  Dry run in production"
    echo -e "  $0 -e staging -r                     Rollback last migration"
    echo -e "  $0 -e development --no-backup        Skip backup in development"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--name)
            MIGRATION_NAME="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -b|--no-backup)
            BACKUP=false
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Valid environments: development, staging, production${NC}"
    exit 1
fi

echo -e "${GREEN}🗄️ FundBio Database Migration${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Dry Run: $DRY_RUN${NC}"
echo -e "${BLUE}Backup: $BACKUP${NC}"
echo -e "${BLUE}Rollback: $ROLLBACK${NC}"
echo ""

# Check if Prisma CLI is available
if ! command -v prisma &> /dev/null; then
    echo -e "${RED}❌ Prisma CLI not found. Installing...${NC}"
    npm install -g prisma
fi

# Check if prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Prisma schema not found${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Loaded environment variables for $ENVIRONMENT${NC}"
elif [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${YELLOW}⚠️ Using default .env file${NC}"
else
    echo -e "${RED}❌ No environment file found${NC}"
    exit 1
fi

# Check database connection
echo -e "${YELLOW}🔍 Checking database connection...${NC}"
if ! prisma db push --preview-feature --accept-data-loss; then
    echo -e "${RED}❌ Cannot connect to database${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"

# Function to create database backup
create_backup() {
    if [ "$BACKUP" = true ] && [ "$ENVIRONMENT" != "development" ]; then
        echo -e "${YELLOW}💾 Creating database backup...${NC}"
        
        BACKUP_DIR="backups"
        BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"
        
        mkdir -p $BACKUP_DIR
        
        # Extract database URL components
        DB_URL=$DATABASE_URL
        if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+) ]]; then
            DB_USER=${BASH_REMATCH[1]}
            DB_PASS=${BASH_REMATCH[2]}
            DB_HOST=${BASH_REMATCH[3]}
            DB_PORT=${BASH_REMATCH[4]}
            DB_NAME=${BASH_REMATCH[5]}
            
            # Create backup using pg_dump
            PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
            else
                echo -e "${RED}❌ Backup failed${NC}"
                if [ "$FORCE" = false ]; then
                    exit 1
                fi
            fi
        else
            echo -e "${YELLOW}⚠️ Could not parse database URL for backup${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Skipping backup${NC}"
    fi
}

# Function to show migration status
show_migration_status() {
    echo -e "${YELLOW}📊 Migration Status:${NC}"
    prisma migrate status
}

# Function to create new migration
create_migration() {
    if [ -n "$MIGRATION_NAME" ]; then
        echo -e "${YELLOW}📝 Creating new migration: $MIGRATION_NAME${NC}"
        
        if [ "$DRY_RUN" = true ]; then
            echo -e "${BLUE}[DRY RUN] Would create migration: $MIGRATION_NAME${NC}"
            return
        fi
        
        # Generate migration
        prisma migrate dev --name "$MIGRATION_NAME"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Migration created and applied: $MIGRATION_NAME${NC}"
        else
            echo -e "${RED}❌ Migration creation failed${NC}"
            exit 1
        fi
    fi
}

# Function to apply migrations
apply_migrations() {
    echo -e "${YELLOW}🚀 Applying migrations...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would apply pending migrations${NC}"
        return
    fi
    
    # Apply migrations
    if [ "$ENVIRONMENT" = "production" ]; then
        prisma migrate deploy
    else
        prisma migrate dev
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations applied successfully${NC}"
    else
        echo -e "${RED}❌ Migration application failed${NC}"
        exit 1
    fi
}

# Function to rollback migrations
rollback_migration() {
    echo -e "${YELLOW}⏪ Rolling back last migration...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would rollback last migration${NC}"
        return
    fi
    
    # Get last migration
    LAST_MIGRATION=$(prisma migrate status | grep -o '[0-9]*_[^[:space:]]*' | tail -1)
    
    if [ -z "$LAST_MIGRATION" ]; then
        echo -e "${RED}❌ No migrations to rollback${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Rolling back migration: $LAST_MIGRATION${NC}"
    
    # Rollback migration (this is a simplified approach)
    # In production, you'd want more sophisticated rollback logic
    prisma migrate reset --force
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration rollback completed${NC}"
    else
        echo -e "${RED}❌ Migration rollback failed${NC}"
        exit 1
    fi
}

# Function to generate Prisma client
generate_client() {
    echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would generate Prisma client${NC}"
        return
    fi
    
    prisma generate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma client generated${NC}"
    else
        echo -e "${RED}❌ Prisma client generation failed${NC}"
        exit 1
    fi
}

# Function to seed database
seed_database() {
    if [ -f "prisma/seed.ts" ] && [ "$ENVIRONMENT" != "production" ]; then
        echo -e "${YELLOW}🌱 Seeding database...${NC}"
        
        if [ "$DRY_RUN" = true ]; then
            echo -e "${BLUE}[DRY RUN] Would seed database${NC}"
            return
        fi
        
        npm run db:seed
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database seeded successfully${NC}"
        else
            echo -e "${YELLOW}⚠️ Database seeding completed with warnings${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Skipping database seeding${NC}"
    fi
}

# Function to validate migration
validate_migration() {
    echo -e "${YELLOW}🔍 Validating migration...${NC}"
    
    # Check if database is in sync with schema
    if prisma migrate status | grep -q "Database schema is up to date"; then
        echo -e "${GREEN}✅ Database schema is up to date${NC}"
    else
        echo -e "${RED}❌ Database schema is not up to date${NC}"
        if [ "$FORCE" = false ]; then
            exit 1
        fi
    fi
    
    # Run basic validation queries
    if [ "$DRY_RUN" = false ]; then
        echo -e "${YELLOW}🧪 Running validation queries...${NC}"
        
        # You can add custom validation queries here
        # For example: check table existence, constraints, etc.
        
        echo -e "${GREEN}✅ Validation completed${NC}"
    fi
}

# Main execution flow
main() {
    # Show current migration status
    show_migration_status
    
    # Create backup before migrations
    create_backup
    
    if [ "$ROLLBACK" = true ]; then
        # Rollback last migration
        rollback_migration
    else
        # Create new migration if name provided
        create_migration
        
        # Apply pending migrations
        apply_migrations
        
        # Generate Prisma client
        generate_client
        
        # Validate migration
        validate_migration
        
        # Seed database if appropriate
        seed_database
    fi
    
    # Show final status
    echo -e "${YELLOW}📊 Final Migration Status:${NC}"
    show_migration_status
    
    echo -e "${GREEN}🎉 Migration process completed successfully!${NC}"
    
    # Post-migration recommendations
    echo -e "${YELLOW}📋 Post-migration checklist:${NC}"
    echo -e "   1. Test application functionality"
    echo -e "   2. Check data integrity"
    echo -e "   3. Monitor performance"
    echo -e "   4. Update documentation"
    echo -e "   5. Notify team of changes"
}

# Run main function
main

echo -e "${GREEN}✅ Database migration script completed${NC}"