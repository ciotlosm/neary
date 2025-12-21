#!/usr/bin/env node

const { FolderRestructuringService } = require('../dist/services/FolderRestructuringService.js');
const fs = require('fs');
const path = require('path');

/**
 * Script to restructure services and utils folders according to the architecture simplification requirements
 */
async function main() {
  console.log('🔄 Starting folder restructuring...');
  
  try {
    const service = new FolderRestructuringService();
    
    // Create restructuring plan
    console.log('📋 Creating restructuring plan...');
    const plan = service.createRestructuringPlan();
    
    // Display plan summary
    console.log('\n📊 Restructuring Plan Summary:');
    console.log('Services:');
    console.log(`  - API: ${plan.services.api.length} files`);
    console.log(`  - Business Logic: ${plan.services.businessLogic.length} files`);
    console.log(`  - Data Processing: ${plan.services.dataProcessing.length} files`);
    console.log(`  - Utilities: ${plan.services.utilities.length} files`);
    
    console.log('Utils:');
    console.log(`  - Validation: ${plan.utils.validation.length} files`);
    console.log(`  - Formatting: ${plan.utils.formatting.length} files`);
    console.log(`  - Data Processing: ${plan.utils.dataProcessing.length} files`);
    console.log(`  - Performance: ${plan.utils.performance.length} files`);
    console.log(`  - Shared: ${plan.utils.shared.length} files`);
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n❓ Do you want to proceed with the restructuring? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Restructuring cancelled.');
      return;
    }
    
    // Execute restructuring
    console.log('\n🚀 Executing restructuring...');
    const result = service.executeRestructuring(plan);
    
    // Display results
    console.log('\n✅ Restructuring completed!');
    console.log(`📁 Created folders: ${result.createdFolders.length}`);
    console.log(`📄 Moved files: ${result.movedFiles.length}`);
    
    if (result.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${result.errors.length}`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result.success) {
      console.log('\n🎉 Folder restructuring completed successfully!');
      console.log('📝 Note: You may need to update import paths in your code.');
    } else {
      console.log('\n❌ Restructuring failed. Please check the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during restructuring:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };