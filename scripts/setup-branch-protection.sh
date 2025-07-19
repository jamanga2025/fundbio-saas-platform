#!/bin/bash

# GitHub Branch Protection Setup Script
# This script configures branch protection rules for the FundBio repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found. Please install it first:${NC}"
    echo -e "${YELLOW}   https://cli.github.com/${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub. Please run:${NC}"
    echo -e "${YELLOW}   gh auth login${NC}"
    exit 1
fi

# Get repository info
REPO_INFO=$(gh repo view --json owner,name)
OWNER=$(echo $REPO_INFO | grep -o '"owner":{"login":"[^"]*"' | cut -d'"' -f4)
REPO=$(echo $REPO_INFO | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

echo -e "${GREEN}🔧 Setting up branch protection for ${OWNER}/${REPO}${NC}"

# Function to setup branch protection
setup_branch_protection() {
    local branch=$1
    local config_file=$2
    
    echo -e "${YELLOW}📝 Setting up protection for branch: ${branch}${NC}"
    
    # Check if branch exists
    if ! gh api repos/${OWNER}/${REPO}/branches/${branch} &> /dev/null; then
        echo -e "${RED}❌ Branch ${branch} does not exist${NC}"
        return 1
    fi
    
    # Apply branch protection
    if gh api repos/${OWNER}/${REPO}/branches/${branch}/protection \
        --method PUT \
        --input ${config_file} &> /dev/null; then
        echo -e "${GREEN}✅ Branch protection configured for ${branch}${NC}"
    else
        echo -e "${RED}❌ Failed to configure branch protection for ${branch}${NC}"
        return 1
    fi
}

# Setup branch protection for main branch
if [ -f ".github/branch-protection-main.json" ]; then
    setup_branch_protection "main" ".github/branch-protection-main.json"
else
    echo -e "${RED}❌ Main branch protection config not found${NC}"
fi

# Setup branch protection for develop branch
if [ -f ".github/branch-protection-develop.json" ]; then
    setup_branch_protection "develop" ".github/branch-protection-develop.json"
else
    echo -e "${YELLOW}⚠️ Develop branch protection config not found${NC}"
fi

# Create CODEOWNERS file if it doesn't exist
if [ ! -f ".github/CODEOWNERS" ]; then
    echo -e "${YELLOW}📝 Creating CODEOWNERS file${NC}"
    cat > .github/CODEOWNERS << EOF
# Global code owners
* @${OWNER}/core-team

# Security-related files
src/middleware.ts @${OWNER}/security-team
src/server/auth.ts @${OWNER}/security-team
src/lib/security-logger.ts @${OWNER}/security-team
.github/workflows/security.yml @${OWNER}/security-team

# Database schema
prisma/schema.prisma @${OWNER}/core-team @${OWNER}/backend-team

# CI/CD workflows
.github/workflows/ @${OWNER}/devops-team

# Configuration files
*.config.js @${OWNER}/core-team
*.config.ts @${OWNER}/core-team
package.json @${OWNER}/core-team
railway.* @${OWNER}/devops-team
EOF
    echo -e "${GREEN}✅ CODEOWNERS file created${NC}"
fi

# Create GitHub issue templates
if [ ! -d ".github/ISSUE_TEMPLATE" ]; then
    echo -e "${YELLOW}📝 Creating issue templates${NC}"
    mkdir -p .github/ISSUE_TEMPLATE
    
    # Bug report template
    cat > .github/ISSUE_TEMPLATE/bug_report.yml << EOF
name: Bug Report
description: Report a bug in the FundBio Dashboard
title: "[BUG] "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
        
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
      
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true
      
  - type: dropdown
    id: browsers
    attributes:
      label: What browsers are you seeing the problem on?
      multiple: true
      options:
        - Firefox
        - Chrome
        - Safari
        - Microsoft Edge
        
  - type: textarea
    id: logs
    attributes:
      label: Relevant log output
      description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
      render: shell
EOF

    # Security vulnerability template
    cat > .github/ISSUE_TEMPLATE/security.yml << EOF
name: Security Vulnerability
description: Report a security vulnerability (use private security advisories for sensitive issues)
title: "[SECURITY] "
labels: ["security", "high-priority"]
body:
  - type: markdown
    attributes:
      value: |
        ⚠️ **Please do not report security vulnerabilities in public issues!**
        
        Use GitHub's private security advisories instead:
        https://github.com/${OWNER}/${REPO}/security/advisories
        
  - type: textarea
    id: vulnerability
    attributes:
      label: Vulnerability Description
      description: Describe the security vulnerability
      placeholder: Please provide a detailed description of the security issue
    validations:
      required: true
      
  - type: dropdown
    id: severity
    attributes:
      label: Severity Level
      options:
        - Critical
        - High
        - Medium
        - Low
EOF

    echo -e "${GREEN}✅ Issue templates created${NC}"
fi

# Create pull request template
if [ ! -f ".github/pull_request_template.md" ]; then
    echo -e "${YELLOW}📝 Creating pull request template${NC}"
    cat > .github/pull_request_template.md << EOF
## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Security fix
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security tests pass
- [ ] Manual testing completed

## Security Checklist
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevention verified
- [ ] XSS protection verified

## Deployment
- [ ] Database migrations included (if applicable)
- [ ] Environment variables updated (if applicable)
- [ ] Documentation updated
- [ ] Changelog updated

## Screenshots (if applicable)
Add screenshots or GIFs to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.
EOF
    echo -e "${GREEN}✅ Pull request template created${NC}"
fi

echo -e "${GREEN}🎉 Branch protection setup complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Create teams in GitHub: core-team, security-team, developers, devops-team"
echo -e "   2. Add team members to appropriate teams"
echo -e "   3. Test the branch protection by creating a PR"
echo -e "   4. Configure GitHub secrets for CI/CD"