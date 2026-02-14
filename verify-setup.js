// Quick setup verification script
require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

console.log('🔍 Verifying environment setup...\n');

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName} is not set`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`⚠️  ${varName} contains placeholder value - please update it`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

console.log('\n📋 Configuration Summary:');
console.log(`   PORT: ${process.env.PORT || '5000'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

if (hasErrors) {
  console.log('\n❌ Setup incomplete! Please update your .env file with actual values.');
  console.log('   See SETUP.md for detailed instructions.\n');
  process.exit(1);
} else {
  console.log('\n✅ Environment configuration looks good!');
  console.log('   You can now run: npm run dev\n');
  process.exit(0);
}
