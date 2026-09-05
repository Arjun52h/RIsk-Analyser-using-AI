export function investigate(t){
 const r=t.risk;
 if(!r.factors.length)return{summary:"No significant abnormal signals were detected. The transaction is consistent with the current risk rules.",why:"There is not enough evidence to justify intervention.",action:"Allow transaction normally."};
 const top=[...r.factors].sort((a,b)=>b.points-a.points).slice(0,3).map(x=>x.label.toLowerCase()).join(", ");
 const summary=`The transaction shows ${r.factors.length} risk signal(s), led by ${top}. ${r.decision==="BLOCK"?"The combined signals cross the high-risk threshold and require intervention.":"The signals are meaningful but do not justify an automatic block, so additional verification is appropriate."}`;
 const why=r.decision==="BLOCK"?"Multiple independent signals occur together. Manual investigation should confirm whether the activity is legitimate.":"The evidence is elevated but not strong enough for an automatic block. Step-up verification reduces risk while limiting false positives.";
 return{summary,why,action:r.recommendation};
}