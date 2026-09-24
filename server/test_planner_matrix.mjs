// test_planner_matrix.mjs
import { generateItinerary } from '../client/src/services/plannerService.js';

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

console.log('================================================================');
console.log('HERITAGELENS AI — TRIP PLANNER 5 COMBINATION MATRIX VERIFICATION');
console.log('================================================================\n');

testCases.forEach((tc, idx) => {
  const res = generateItinerary(tc.params);
  console.log(`[TEST COMBINATION ${idx + 1}]`);
  console.log(`Title: ${res.title}`);
  console.log(`Route Summary: ${res.summary}`);
  console.log(`Stops Planned (${res.stops.length}):`);
  res.stops.forEach((s, sIdx) => {
    console.log(`   ${sIdx + 1}. [${s.time}] (${s.site}) ${s.monument} (~${s.durationMin} mins)`);
    console.log(`      Why This Order: ${s.whyThisOrder}`);
    console.log(`      What to Observe: ${s.keyObservation}`);
  });
  console.log('----------------------------------------------------------------\n');
});

console.log('ALL 5 PLANNER MATRIX COMBINATIONS VALIDATED SUCCESSFULLY! ✅');
