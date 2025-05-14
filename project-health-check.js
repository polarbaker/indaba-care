#!/usr/bin/env node

/**
 * Indaba Care Project Health Check
 * 
 * This script provides a comprehensive health check of the Indaba Care project,
 * verifying dependencies, build process, and key functionality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, bold: (t) => t };

console.log('\n' + '='.repeat(80));
console.log(chalk.bold('📊 INDABA CARE PROJECT HEALTH CHECK'));
console.log('='.repeat(80));

// Track overall health status
let healthIssues = [];

// ----------------------------------------
// 1. DEPENDENCY VALIDATION
// ----------------------------------------
console.log('\n' + chalk.bold('📦 DEPENDENCY VALIDATION'));
console.log('-'.repeat(50));

try {
  console.log('Running dependency verification...');
  const output = execSync('node verify-dependencies.js', { encoding: 'utf8' });
  
  // Check if there were dependency issues
  if (output.includes('Some dependency issues detected')) {
    healthIssues.push('Dependency issues detected in verification');
    console.log(chalk.red('❌ Dependency issues detected. See output for details.'));
  } else if (output.includes('All core dependencies are correctly standardized')) {
    console.log(chalk.green('✅ Dependencies correctly standardized'));
  }
} catch (error) {
  healthIssues.push('Failed to run dependency verification: ' + error.message);
  console.log(chalk.red(`❌ Error running dependency verification: ${error.message}`));
}

// ----------------------------------------
// 2. BUILD PROCESS
// ----------------------------------------
console.log('\n' + chalk.bold('🔨 BUILD PROCESS'));
console.log('-'.repeat(50));

try {
  console.log('Testing build process...');
  
  // Don't actually run the full build, just check if it starts correctly
  const buildOutput = execSync('npm run build -- --help', { encoding: 'utf8' });
  
  if (buildOutput) {
    console.log(chalk.green('✅ Build process is accessible'));
  }
} catch (error) {
  healthIssues.push('Build process error: ' + error.message);
  console.log(chalk.red(`❌ Build process error: ${error.message}`));
}

// ----------------------------------------
// 3. KEY FILES VERIFICATION
// ----------------------------------------
console.log('\n' + chalk.bold('🗂️ KEY FILES VERIFICATION'));
console.log('-'.repeat(50));

const keyFiles = [
  'package.json',
  'next.config.js',
  'setup.sh',
  'verify-dependencies.js',
  'src/lib/dependency-check.ts',
  'src/pages/setup-check.tsx',
  'DEPENDENCY_STANDARDIZATION.md'
];

let missingFiles = [];

keyFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log(chalk.green('✅ All key files are present'));
} else {
  healthIssues.push('Missing key files: ' + missingFiles.join(', '));
  console.log(chalk.red(`❌ Missing key files: ${missingFiles.join(', ')}`));
}

// Check setup.sh permissions
try {
  const setupPath = path.join(__dirname, 'setup.sh');
  const stats = fs.statSync(setupPath);
  const isExecutable = !!(stats.mode & 0o111);
  
  if (!isExecutable) {
    healthIssues.push('setup.sh is not executable');
    console.log(chalk.yellow('⚠️ setup.sh is not executable. Fix with: chmod +x setup.sh'));
  } else {
    console.log(chalk.green('✅ setup.sh is executable'));
  }
} catch (error) {
  healthIssues.push('Error checking setup.sh: ' + error.message);
  console.log(chalk.red(`❌ Error checking setup.sh: ${error.message}`));
}

// ----------------------------------------
// 4. PACKAGE.JSON VALIDATION
// ----------------------------------------
console.log('\n' + chalk.bold('📄 PACKAGE.JSON VALIDATION'));
console.log('-'.repeat(50));

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // Check for verify-deps script
  if (packageJson.scripts && packageJson.scripts['verify-deps']) {
    console.log(chalk.green('✅ verify-deps script is present'));
  } else {
    healthIssues.push('verify-deps script missing in package.json');
    console.log(chalk.red('❌ verify-deps script is missing'));
  }
  
  // Check for resolutions field
  if (packageJson.resolutions) {
    console.log(chalk.green('✅ resolutions field is present'));
  } else {
    healthIssues.push('resolutions field missing in package.json');
    console.log(chalk.red('❌ resolutions field is missing'));
  }
  
  // Check React version
  if (packageJson.dependencies && packageJson.dependencies.react) {
    const reactVersion = packageJson.dependencies.react;
    // Handle semver notation (^18.3.1 or ~18.3.1)
    const reactVersionNumber = reactVersion.replace(/[^\d.]/g, '');
    if (reactVersionNumber.startsWith('18.3')) {
      console.log(chalk.green(`✅ React version is correct: ${reactVersion}`));
    } else {
      healthIssues.push(`React version (${reactVersion}) doesn't match standardized version (18.3.x)`);
      console.log(chalk.red(`❌ React version mismatch: ${reactVersion}, should be 18.3.x`));
    }
  }
  
  // Check Chakra UI version
  if (packageJson.dependencies && packageJson.dependencies['@chakra-ui/react']) {
    const chakraVersion = packageJson.dependencies['@chakra-ui/react'];
    // Handle semver notation (^3.17.0 or ~3.17.0)
    const chakraVersionNumber = chakraVersion.replace(/[^\d.]/g, '');
    if (chakraVersionNumber.startsWith('3')) {
      console.log(chalk.green(`✅ Chakra UI version is correct: ${chakraVersion}`));
    } else {
      healthIssues.push(`Chakra UI version (${chakraVersion}) doesn't match standardized version (3.x)`);
      console.log(chalk.red(`❌ Chakra UI version mismatch: ${chakraVersion}, should be 3.x`));
    }
  }
} catch (error) {
  healthIssues.push('Error validating package.json: ' + error.message);
  console.log(chalk.red(`❌ Error validating package.json: ${error.message}`));
}

// ----------------------------------------
// 5. DOCUMENTATION CHECK
// ----------------------------------------
console.log('\n' + chalk.bold('📚 DOCUMENTATION CHECK'));
console.log('-'.repeat(50));

try {
  const depStdContent = fs.readFileSync(path.join(__dirname, 'DEPENDENCY_STANDARDIZATION.md'), 'utf8');
  const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  
  const docChecks = [
    { name: 'Setup script in documentation', pass: depStdContent.includes('setup.sh') },
    { name: 'verify-dependencies.js in documentation', pass: depStdContent.includes('verify-dependencies.js') },
    { name: 'Chakra UI v3 API changes documented', pass: depStdContent.includes('VStack/HStack Changes') },
    { name: 'Dependency validation in README', pass: readmeContent.includes('verify-dependencies.js') }
  ];
  
  let docIssues = [];
  
  docChecks.forEach(check => {
    if (check.pass) {
      console.log(chalk.green(`✅ ${check.name}`));
    } else {
      docIssues.push(check.name);
      console.log(chalk.red(`❌ ${check.name}`));
    }
  });
  
  if (docIssues.length > 0) {
    healthIssues.push('Documentation issues: ' + docIssues.join(', '));
  }
} catch (error) {
  healthIssues.push('Error checking documentation: ' + error.message);
  console.log(chalk.red(`❌ Error checking documentation: ${error.message}`));
}

// ----------------------------------------
// OVERALL HEALTH ASSESSMENT
// ----------------------------------------
console.log('\n' + '='.repeat(80));
console.log(chalk.bold('🏥 OVERALL PROJECT HEALTH ASSESSMENT'));
console.log('='.repeat(80));

if (healthIssues.length === 0) {
  console.log(chalk.green('\n✅ PROJECT IS HEALTHY'));
  console.log(chalk.green('All critical components are properly configured and standardized.'));
} else {
  console.log(chalk.yellow(`\n⚠️ PROJECT HAS ${healthIssues.length} ISSUE(S) TO ADDRESS:`));
  healthIssues.forEach((issue, i) => {
    console.log(chalk.yellow(`${i+1}. ${issue}`));
  });
}

console.log('\n' + '='.repeat(80));
console.log(chalk.bold('📋 NEXT STEPS'));
console.log('='.repeat(80));

console.log(`
1. ${healthIssues.length === 0 ? 'Continue monitoring dependency updates' : 'Address the issues listed above'}
2. Consider adding automated CI checks using the verification script
3. Regularly test the setup process with new team members

For any questions, refer to the DEPENDENCY_STANDARDIZATION.md document.
`);

console.log('='.repeat(80) + '\n');
