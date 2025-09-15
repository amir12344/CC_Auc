// Test script to verify condition mapping fixes
const { mapSimplifiedConditionToAuctionConditions, mapSimplifiedConditionToCatalogConditions } = require('./src/features/search/utils/conditionMapper');
const { fileToDbLotConditionBiMap, fileToDbConditionBiMap } = require('./amplify/functions/commons/converters/ListingTypeConverter');

console.log('Testing condition mapping fixes...');

// Test problematic conditions
const testConditions = ['Salvage', 'Customer Returns', 'Damaged', 'Scratch And Dent', 'Mixed'];

console.log('\n=== Testing Auction Conditions ===');
testConditions.forEach(condition => {
  console.log(`\nTesting condition: "${condition}"`);
  
  // Test condition mapper
  const mappedConditions = mapSimplifiedConditionToAuctionConditions(condition);
  console.log(`  Mapped conditions: [${mappedConditions.join(', ')}]`);
  
  // Test BiMap lookup
  const dbValues = mappedConditions.map(c => fileToDbLotConditionBiMap.getValue(c)).filter(Boolean);
  console.log(`  DB enum values: [${dbValues.join(', ')}]`);
  
  if (dbValues.length === 0) {
    console.log(`  ❌ ISSUE: No DB mapping found for "${condition}"`);
  } else {
    console.log(`  ✅ SUCCESS: "${condition}" maps to [${dbValues.join(', ')}]`);
  }
});

console.log('\n=== Testing Catalog Conditions ===');
const catalogTestConditions = ['New - Open Box', 'Refurbished - Manufacturer Certified', 'Used - Like New'];
catalogTestConditions.forEach(condition => {
  console.log(`\nTesting condition: "${condition}"`);
  
  // Test condition mapper
  const mappedConditions = mapSimplifiedConditionToCatalogConditions(condition);
  console.log(`  Mapped conditions: [${mappedConditions.join(', ')}]`);
  
  // Test BiMap lookup
  const dbValues = mappedConditions.map(c => fileToDbConditionBiMap.getValue(c)).filter(Boolean);
  console.log(`  DB enum values: [${dbValues.join(', ')}]`);
  
  if (dbValues.length === 0) {
    console.log(`  ❌ ISSUE: No DB mapping found for "${condition}"`);
  } else {
    console.log(`  ✅ SUCCESS: "${condition}" maps to [${dbValues.join(', ')}]`);
  }
});

console.log('\n=== Test Complete ===');