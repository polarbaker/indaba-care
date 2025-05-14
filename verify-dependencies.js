// Direct verification script for dependency standardization
// This bypasses any routing or Next.js configuration issues
const fs = require('fs');
const path = require('path');
const { version: reactVersion } = require('react');
const chakra = require('@chakra-ui/react');

// Check for PouchDB in package.json instead of trying to require it
// This avoids the browser-specific initialization issues
let pouchDbInstalled = false;
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  pouchDbInstalled = packageJson.dependencies && 
    (packageJson.dependencies['pouchdb'] || 
     packageJson.dependencies['pouchdb-browser'] || 
     packageJson.dependencies['pouchdb-core']);
} catch (e) {
  console.error('Error reading package.json:', e.message);
}

// Check React version
console.log('\n----------------------------------------------------');
console.log('🔍 DEPENDENCY VALIDATION REPORT');
console.log('----------------------------------------------------');
console.log(`⚛️ React version: ${reactVersion}`);
const reactVersionOK = reactVersion.startsWith('18.3');
console.log(`   Status: ${reactVersionOK ? '✅ OK' : '❌ NOT COMPLIANT'}`);
if (!reactVersionOK) {
  console.log(`   Expected: 18.3.x, Found: ${reactVersion}`);
}

// Check Chakra UI
console.log('\n🧩 Chakra UI:');
const chakraInstalled = !!chakra;
console.log(`   Installed: ${chakraInstalled ? '✅ Yes' : '❌ No'}`);

if (chakraInstalled) {
  // Sample a few key components that should be available
  const keyComponents = ['Box', 'Button', 'Container', 'VStack', 'useDisclosure'];
  const availableComponents = keyComponents.filter(comp => typeof chakra[comp] !== 'undefined');
  console.log(`   Available Components: ${availableComponents.length}/${keyComponents.length}`);
  
  if (availableComponents.length < keyComponents.length) {
    const missing = keyComponents.filter(comp => !availableComponents.includes(comp));
    console.log(`   Missing: ${missing.join(', ')}`);
  } else {
    console.log('   Status: ✅ All key components available');
  }
  
  // Check useDisclosure existence and API signature (can't test hook directly outside React)
  try {
    console.log('   useDisclosure: ✅ Function exists');
    
    // Inspect the function string to check for expected properties
    const disclosureStr = chakra.useDisclosure.toString();
    
    if (disclosureStr.includes('isOpen')) {
      console.log('   useDisclosure API: ❌ Likely uses "isOpen" (v2 - needs update)');
    } else if (disclosureStr.includes('open')) {
      console.log('   useDisclosure API: ✅ Likely uses "open" (v3 compliant)');
    } else {
      console.log('   useDisclosure API: ❓ Unable to determine API format');
    }
  } catch (e) {
    console.log(`   useDisclosure API check error: ${e.message}`);
  }
}

// Check PouchDB
console.log('\n💾 PouchDB:');
console.log(`   Installed (package.json): ${pouchDbInstalled ? '✅ Yes' : '❌ No'}`);

// Check for PouchDB files
let pouchDbFilesExist = false;
try {
  // Check if we can find PouchDB in node_modules
  const nodeModulesPath = path.join(__dirname, 'node_modules', 'pouchdb');
  pouchDbFilesExist = fs.existsSync(nodeModulesPath) || 
                     fs.existsSync(path.join(__dirname, 'node_modules', 'pouchdb-browser')) || 
                     fs.existsSync(path.join(__dirname, 'node_modules', 'pouchdb-core'));
  
  console.log(`   Files found in node_modules: ${pouchDbFilesExist ? '✅ Yes' : '❌ No'}`);
} catch (e) {
  console.log(`   Error checking PouchDB files: ${e.message}`);
}

const pouchInstalled = pouchDbInstalled && pouchDbFilesExist;

// Overall assessment
console.log('\n----------------------------------------------------');
console.log('📊 DEPENDENCY STANDARDIZATION ASSESSMENT');
console.log('----------------------------------------------------');

const allChecksPass = reactVersionOK && chakraInstalled && pouchInstalled;
if (allChecksPass) {
  console.log('✅ All core dependencies are correctly standardized!');
  console.log('   The project should work correctly for junior developers.');
} else {
  console.log('⚠️ Some dependency issues detected:');
  if (!reactVersionOK) console.log('   - React version needs to be 18.3.x');
  if (!chakraInstalled) console.log('   - Chakra UI is not properly installed');
  if (!pouchInstalled) console.log('   - PouchDB is either not in package.json or not properly installed');
  
  // Find project version numbers for troubleshooting
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log('\n📦 Dependency versions from package.json:');
    console.log(`   React: ${packageJson.dependencies?.react || 'Not found'}`);
    console.log(`   Chakra UI: ${packageJson.dependencies?.['@chakra-ui/react'] || 'Not found'}`);
    console.log(`   PouchDB: ${packageJson.dependencies?.pouchdb || 
                           packageJson.dependencies?.['pouchdb-browser'] || 
                           packageJson.dependencies?.['pouchdb-core'] || 'Not found'}`);
  } catch (e) {
    console.log('\n❌ Error reading package.json versions:', e.message);
  }
}

console.log('\n📋 Recommendations:');
console.log('   1. Use the setup.sh script for clean installations');
console.log('   2. Install with --legacy-peer-deps flag to handle React compatibility');
console.log('   3. Refer to DEPENDENCY_STANDARDIZATION.md for detailed guidance');
console.log('----------------------------------------------------\n');
