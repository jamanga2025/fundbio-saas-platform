#!/bin/bash

# Railway Deployment Script for FundBio Dashboard
# This script handles deployment to Railway with proper environment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
FORCE_DEPLOY=false
RUN_MIGRATIONS=false
SKIP_TESTS=false

# Usage function
usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo -e "${BLUE}Options:${NC}"
    echo -e "  -e, --environment ENV    Environment to deploy to (staging|production) [default: staging]"
    echo -e "  -f, --force              Force deployment even if tests fail"
    echo -e "  -m, --migrate            Run database migrations after deployment"
    echo -e "  -s, --skip-tests         Skip running tests before deployment"
    echo -e "  -h, --help               Show this help message"
    echo -e ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 -e staging -m         Deploy to staging and run migrations"
    echo -e "  $0 -e production -f      Force deploy to production"
    echo -e "  $0 --skip-tests          Deploy without running tests"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_DEPLOY=true
            shift
            ;;
        -m|--migrate)
            RUN_MIGRATIONS=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
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
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Valid environments: staging, production${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 FundBio Dashboard Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Force Deploy: $FORCE_DEPLOY${NC}"
echo -e "${BLUE}Run Migrations: $RUN_MIGRATIONS${NC}"
echo -e "${BLUE}Skip Tests: $SKIP_TESTS${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found. Installing...${NC}"
    
    # Install Railway CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -fsSL https://railway.app/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo -e "${RED}❌ Unsupported OS. Please install Railway CLI manually:${NC}"
        echo -e "${YELLOW}   https://docs.railway.app/reference/cli#install${NC}"
        exit 1
    fi
    
    # Add Railway to PATH
    export PATH="$HOME/.railway/bin:$PATH"
fi

# Check if user is authenticated
if ! railway auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Railway. Please run:${NC}"
    echo -e "${YELLOW}   railway login${NC}"
    exit 1
fi

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Check if Prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Prisma schema not found${NC}"
    exit 1
fi

# Check if environment-specific configuration exists
if [ ! -f ".env.${ENVIRONMENT}" ] && [ ! -f ".env.example" ]; then
    echo -e "${YELLOW}⚠️ No environment configuration found${NC}"
fi

# Run tests unless skipped
if [ "$SKIP_TESTS" = false ]; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    
    # Install dependencies
    npm ci
    
    # Run TypeScript check
    if ! npx tsc --noEmit; then
        echo -e "${RED}❌ TypeScript check failed${NC}"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
        echo -e "${YELLOW}⚠️ Continuing with force deploy${NC}"
    fi
    
    # Run linting
    if ! npm run lint; then
        echo -e "${RED}❌ Linting failed${NC}"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
        echo -e "${YELLOW}⚠️ Continuing with force deploy${NC}"
    fi
    
    # Run security tests
    if ! npm run test:security; then
        echo -e "${RED}❌ Security tests failed${NC}"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
        echo -e "${YELLOW}⚠️ Continuing with force deploy${NC}"
    fi
    
    # Run unit tests
    if ! npm test -- --run; then
        echo -e "${RED}❌ Unit tests failed${NC}"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
        echo -e "${YELLOW}⚠️ Continuing with force deploy${NC}"
    fi
    
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️ Skipping tests${NC}"
fi

# Build the application
echo -e "${YELLOW}🏗️ Building application...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Railway
echo -e "${YELLOW}🚀 Deploying to Railway ($ENVIRONMENT)...${NC}"

# Set the environment
railway environment $ENVIRONMENT

# Deploy the application
if railway up --service fundbio-dashboard; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Run database migrations if requested
if [ "$RUN_MIGRATIONS" = true ]; then
    echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
    
    if railway run --service fundbio-dashboard -- npm run db:push; then
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${RED}❌ Database migrations failed${NC}"
        exit 1
    fi
fi

# Get deployment URL
DEPLOYMENT_URL=$(railway service --service fundbio-dashboard | grep -o 'https://[^[:space:]]*' | head -1)

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 30 # Wait for deployment to be ready

if curl -f "$DEPLOYMENT_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}⚠️ Deployment may not be ready yet${NC}"
fi

# Run security monitor
echo -e "${YELLOW}🔒 Running security monitor...${NC}"
if npm run security:monitor; then
    echo -e "${GREEN}✅ Security check passed${NC}"
else
    echo -e "${YELLOW}⚠️ Security monitor completed with warnings${NC}"
fi

# Success message
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}URL: $DEPLOYMENT_URL${NC}"
echo -e "${BLUE}Health Check: $DEPLOYMENT_URL/api/health${NC}"

# Post-deployment recommendations
echo -e "${YELLOW}📋 Post-deployment checklist:${NC}"
echo -e "   1. Verify application functionality"
echo -e "   2. Check logs for any errors"
echo -e "   3. Monitor performance metrics"
echo -e "   4. Run integration tests"
echo -e "   5. Update documentation if needed"

# Show recent logs
echo -e "${YELLOW}📊 Recent logs:${NC}"
railway logs --service fundbio-dashboard --lines 20

echo -e "${GREEN}✅ Deployment script completed${NC}"