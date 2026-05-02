try {
  console.log('Testing imports...');
  require('./commands/start');
  console.log('✅ startCommand ok');
  require('./commands/help');
  console.log('✅ helpCommand ok');
  require('./commands/check');
  console.log('✅ checkCommand ok');
  require('./services/analyzeToken');
  console.log('✅ analyzeToken ok');
  require('./config/constants');
  console.log('✅ constants ok');
  console.log('All modules imported successfully!');
} catch (err) {
  console.error('❌ Import failed:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}
