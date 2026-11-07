// Fictional local telemetry. Search and analysis operate on these records;
// no network scan, external investigation or device action is performed.
export const missionBrief={
  title:'Trace the unknown signal',
  instruction:'Ordis, trace the unknown signal and check whether it poses a risk to the Orbiter.',
  signature:'CE-7A',frequencyMHz:41.7,toleranceMHz:.1,
};

export const transmissions=[
  {id:'TR-001',source:'Navigation T-03',sector:'Earth',frequencyMHz:32.4,signature:'NAV-12',powerRatio:1.02,packets:100,corrupted:0,trusted:true},
  {id:'TR-002',source:'Beacon M-02',sector:'Mars',frequencyMHz:41.69,signature:'COM-18',powerRatio:1.01,packets:90,corrupted:0,trusted:true},
  {id:'TR-003',source:'Foundry',sector:'Orbiter',frequencyMHz:12.1,signature:'SYS-02',powerRatio:1.04,packets:110,corrupted:0,trusted:true},
  {id:'TR-004',source:'Relay E-17',sector:'Europa',frequencyMHz:41.68,signature:'CE-7A',powerRatio:1.34,packets:96,corrupted:3,trusted:true},
  {id:'TR-005',source:'Navigation T-03',sector:'Earth',frequencyMHz:32.38,signature:'NAV-12',powerRatio:1.01,packets:102,corrupted:0,trusted:true},
  {id:'TR-006',source:'Cargo bay',sector:'Orbiter',frequencyMHz:18.2,signature:'SYS-09',powerRatio:1.05,packets:88,corrupted:0,trusted:true},
  {id:'TR-007',source:'Beacon N-04',sector:'Neptune',frequencyMHz:54.6,signature:'NAV-07',powerRatio:1.03,packets:99,corrupted:1,trusted:true},
  {id:'TR-008',source:'Relay E-17',sector:'Europa',frequencyMHz:41.73,signature:'CE-7A',powerRatio:1.28,packets:104,corrupted:1,trusted:true},
  {id:'TR-009',source:'Workshop',sector:'Orbiter',frequencyMHz:16.8,signature:'SYS-06',powerRatio:1.01,packets:97,corrupted:0,trusted:true},
  {id:'TR-010',source:'Beacon L-11',sector:'Lua',frequencyMHz:62.1,signature:'CE-7A',powerRatio:1.09,packets:90,corrupted:0,trusted:true},
  {id:'TR-011',source:'Beacon M-02',sector:'Mars',frequencyMHz:41.75,signature:'COM-18',powerRatio:1.03,packets:98,corrupted:0,trusted:true},
  {id:'TR-012',source:'Life support',sector:'Orbiter',frequencyMHz:9.4,signature:'SYS-01',powerRatio:1,packets:120,corrupted:0,trusted:true},
];

export function matchesSignal(record,query=missionBrief){
  return record.signature===query.signature&&Math.abs(record.frequencyMHz-query.frequencyMHz)<=query.toleranceMHz;
}

export function analyseTransmissions(matches){
  if(!matches.length)return null;
  const groups=new Map();
  for(const record of matches){const key=record.source+'|'+record.sector;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(record);}
  const records=[...groups.values()].sort((a,b)=>b.length-a.length||a[0].id.localeCompare(b[0].id))[0];
  const packets=records.reduce((sum,r)=>sum+r.packets,0),corrupted=records.reduce((sum,r)=>sum+r.corrupted,0);
  const powerPeak=Math.max(...records.map(r=>r.powerRatio));
  const integrity=packets?Math.round((1-corrupted/packets)*100):0;
  const trusted=records.every(r=>r.trusted);
  const risk=!trusted||integrity<90?'high':powerPeak>1.2||integrity<98?'moderate':'low';
  return {source:records[0].source,sector:records[0].sector,records,packets,corrupted,integrity,powerPeak,powerExcess:Math.round((powerPeak-1)*100),trusted,risk};
}

export function verifyAnalysis(result,query=missionBrief){
  if(!result)return {verified:false,reason:'No matching source in the examined transmissions.'};
  const corroborated=new Set(result.records.map(record=>record.id)).size>=2&&result.packets>0&&result.records.every(record=>matchesSignal(record,query));
  return {verified:corroborated,reason:corroborated?'Source corroborated by '+result.records.map(r=>r.id).join(' and ')+'.':'Only one observation: more evidence is required.'};
}

export function makeReport(result,verification){
  if(!result)return 'Operator, no matching source in the local transmissions. I recommend broadening the search. No changes applied.';
  const certainty=verification.verified?'source confirmed':'the most likely source';
  const security=result.trusted?'No hostile signature found.':'The signature is not in the trust register.';
  const action=result.risk==='low'?'I recommend continued monitoring.':'I recommend isolation and recalibration.';
  return 'Operator, '+certainty+': '+result.source+', '+result.sector+'. Power is up '+result.powerExcess+'%. Integrity is '+result.integrity+'%. '+security+' '+action+' No changes applied. Awaiting your instructions.';
}
