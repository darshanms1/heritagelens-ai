// test_planner_matrix.js
const { generateItinerary } = require('../client/src/services/plannerService');

const testCases = [
  {
    name: 'Combination 1: Badami + Half Day + Relaxed + Photography',
    params: { startPoint: 'badami', duration: 'halfday', pace: 'relaxed', interest: 'photography' }
  },
  {
    name: 'Combination 2: Aihole + Half Day + Relaxed + Photography',
    params: { startPoint: 'aihole', duration: 'halfday', pace: 'relaxed', interest: 'photography' }
  },
  {
    name: 'Combination 3: Pattadakal + Full Day + Balanced + Architecture',
    params: { startPoint: 'pattadakal', duration: '1day', pace: 'balanced', interest: 'architecture' }
  },
  {
    name: 'Combination 4: Badami + Full Day + Comprehensive + Sculptures',
    params: { startPoint: 'badami', duration: '1day', pace: 'comprehensive', interest: 'sculpture' }
  },
  {
    name: 'Combination 5: Aihole + 2 Days + Comprehensive + Epigraphy (History)',
    params: { startPoint: 'aihole', duration: '2day', pace: 'comprehensive', interest: 'history' }
  }
];

console.log('====================================================');
console.log('TESTING TRIP PLANNER MULTI-FACTOR ENGINE (5 CASES)');
console.log('====================================================\n');

testCases.forEach((tc, idx) => {
  const res = generateItinerary(tc.params);
  console.log(`[CASE ${idx + 1}] ${tc.name}`);
  console.log(`Title: ${res.title}`);
  console.log(`Total Stops (including transits): ${res.stops.length}`);
  console.log(`Monuments visited:`);
  res.stops.forEach((s, sIdx) => {
    console.log(`   ${sIdx + 1}. [${s.time}] (${s.site}) ${s.monument} (~${s.durationMin}m)`);
    console.log(`      Observation: ${s.keyObservation}`);
  });
  console.log('----------------------------------------------------\n');
});
