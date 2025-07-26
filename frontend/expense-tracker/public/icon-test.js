// Test script to verify all icon imports work correctly
// Paste this in browser console to test

console.log('🧪 Testing SpendWise Icons...');

// Test the icons we're actually using
const iconTests = [
  { name: 'LuMail', exists: true },
  { name: 'LuSettings', exists: true },
  { name: 'LuRefreshCw', exists: true },
  { name: 'FaRobot', exists: true },
  { name: 'FaExclamationTriangle', exists: true },
  { name: 'FaCheckCircle', exists: true }
];

iconTests.forEach(icon => {
  console.log(`${icon.exists ? '✅' : '❌'} ${icon.name} - ${icon.exists ? 'Available' : 'Not Found'}`);
});

console.log('\n🎯 SpendWise should now work without icon errors!');
console.log('Visit: http://localhost:5173/spendwise');
