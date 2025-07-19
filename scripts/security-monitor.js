#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityMonitor {
  constructor() {
    this.reportPath = path.join(__dirname, '..', 'reports');
    this.timestamp = new Date().toISOString();
    this.ensureReportDirectory();
  }

  ensureReportDirectory() {
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }
  }

  async runSecurityTests() {
    console.log('🔒 Running security tests...');
    
    try {
      const output = execSync('npm run test:security', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      return {
        status: 'PASSED',
        output: output,
        timestamp: this.timestamp
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        timestamp: this.timestamp
      };
    }
  }

  async runVulnerabilityCheck() {
    console.log('🔍 Running vulnerability check...');
    
    try {
      const output = execSync('npm audit --audit-level=moderate', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      return {
        status: 'PASSED',
        output: output,
        timestamp: this.timestamp
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        timestamp: this.timestamp
      };
    }
  }

  async checkSecurityHeaders() {
    console.log('🛡️ Checking security headers...');
    
    const middlewarePath = path.join(__dirname, '..', 'src', 'middleware.ts');
    
    if (!fs.existsSync(middlewarePath)) {
      return {
        status: 'FAILED',
        error: 'Security middleware not found',
        timestamp: this.timestamp
      };
    }

    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ];

    const missingHeaders = requiredHeaders.filter(header => 
      !middlewareContent.includes(header)
    );

    return {
      status: missingHeaders.length === 0 ? 'PASSED' : 'FAILED',
      requiredHeaders: requiredHeaders.length,
      implementedHeaders: requiredHeaders.length - missingHeaders.length,
      missingHeaders: missingHeaders,
      timestamp: this.timestamp
    };
  }

  async checkDatabaseSecurity() {
    console.log('🗄️ Checking database security...');
    
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    
    if (!fs.existsSync(schemaPath)) {
      return {
        status: 'FAILED',
        error: 'Prisma schema not found',
        timestamp: this.timestamp
      };
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const hasRLS = schemaContent.includes('@@policy') || schemaContent.includes('RLS');
    const hasIndexes = schemaContent.includes('@@index');
    
    return {
      status: 'PASSED',
      rowLevelSecurity: hasRLS,
      indexesPresent: hasIndexes,
      timestamp: this.timestamp
    };
  }

  async checkEnvironmentSecurity() {
    console.log('🔐 Checking environment security...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    return {
      status: missingVars.length === 0 ? 'PASSED' : 'FAILED',
      requiredVars: requiredEnvVars.length,
      configuredVars: requiredEnvVars.length - missingVars.length,
      missingVars: missingVars,
      timestamp: this.timestamp
    };
  }

  async generateSecurityReport() {
    console.log('📊 Generating security report...');
    
    const results = {
      timestamp: this.timestamp,
      environment: process.env.NODE_ENV || 'development',
      tests: await this.runSecurityTests(),
      vulnerabilities: await this.runVulnerabilityCheck(),
      headers: await this.checkSecurityHeaders(),
      database: await this.checkDatabaseSecurity(),
      environment: await this.checkEnvironmentSecurity()
    };

    // Calculate overall score
    const checks = [results.tests, results.headers, results.database, results.environment];
    const passedChecks = checks.filter(check => check.status === 'PASSED').length;
    const totalChecks = checks.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    results.overallScore = score;
    results.summary = {
      passed: passedChecks,
      total: totalChecks,
      score: score,
      grade: this.getSecurityGrade(score)
    };

    // Save report
    const reportFile = path.join(this.reportPath, `security-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(results);
    const markdownFile = path.join(this.reportPath, `security-report-${Date.now()}.md`);
    fs.writeFileSync(markdownFile, markdownReport);

    return results;
  }

  getSecurityGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateMarkdownReport(results) {
    return `# Security Report - ${results.timestamp}

## Overall Security Score: ${results.overallScore}% (Grade: ${results.summary.grade})

### Summary
- **Passed**: ${results.summary.passed}/${results.summary.total} checks
- **Environment**: ${results.environment}
- **Generated**: ${results.timestamp}

### Security Tests
- **Status**: ${results.tests.status}
- **Details**: ${results.tests.status === 'PASSED' ? 'All security tests passed' : results.tests.error}

### Vulnerability Check
- **Status**: ${results.vulnerabilities.status}
- **Details**: ${results.vulnerabilities.status === 'PASSED' ? 'No critical vulnerabilities found' : results.vulnerabilities.error}

### Security Headers
- **Status**: ${results.headers.status}
- **Implemented**: ${results.headers.implementedHeaders}/${results.headers.requiredHeaders} headers
- **Missing**: ${results.headers.missingHeaders?.join(', ') || 'None'}

### Database Security
- **Status**: ${results.database.status}
- **Row Level Security**: ${results.database.rowLevelSecurity ? '✅' : '❌'}
- **Indexes Present**: ${results.database.indexesPresent ? '✅' : '❌'}

### Environment Security
- **Status**: ${results.environment.status}
- **Configured**: ${results.environment.configuredVars}/${results.environment.requiredVars} variables
- **Missing**: ${results.environment.missingVars?.join(', ') || 'None'}

### Recommendations
${results.overallScore < 100 ? `
- Review and fix failing security checks
- Implement missing security headers
- Ensure all environment variables are properly configured
- Consider implementing additional security measures
` : '- All security checks passed! Continue monitoring regularly.'}

---
*Generated by FundBio Security Monitor*`;
  }

  async sendAlert(results) {
    if (results.overallScore < 80) {
      console.log('🚨 SECURITY ALERT: Score below 80%');
      // In a real implementation, this would send notifications to Slack, email, etc.
      
      const alertData = {
        timestamp: results.timestamp,
        score: results.overallScore,
        grade: results.summary.grade,
        failedChecks: results.summary.total - results.summary.passed,
        environment: results.environment
      };
      
      console.log('Alert data:', JSON.stringify(alertData, null, 2));
    }
  }
}

// Main execution
async function main() {
  const monitor = new SecurityMonitor();
  
  try {
    const results = await monitor.generateSecurityReport();
    console.log('\\n📋 Security Report Generated:');
    console.log(`Score: ${results.overallScore}% (${results.summary.grade})`);
    console.log(`Passed: ${results.summary.passed}/${results.summary.total} checks`);
    
    await monitor.sendAlert(results);
    
    process.exit(results.overallScore >= 80 ? 0 : 1);
  } catch (error) {
    console.error('❌ Security monitoring failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}