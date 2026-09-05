export function calculateRisk(t){
 let score=0,factors=[];const add=(label,points,detail)=>{score+=points;factors.push({label,points,detail})};
 if(t.amount>50000)add("Unusually high transaction amount",25,`₹${t.amount.toLocaleString("en-IN")} exceeds the high-value threshold.`);
 if(t.attemptCount>=5)add("High transaction velocity",20,`${t.attemptCount} payment attempts detected.`);
 if(t.accountAgeDays<=7)add("Very new customer account",20,`Account is only ${t.accountAgeDays} days old.`);
 if(t.previousTransactions===0)add("No previous transaction history",15,"No established payment history.");
 if(t.chargebacks>0)add("Previous chargeback history",30,`${t.chargebacks} previous chargeback(s).`);
 if(t.failedAttempts>=3)add("Multiple failed attempts",15,`${t.failedAttempts} failed attempts recorded.`);
 score=Math.min(score,100);
 let level="LOW",decision="ALLOW",recommendation="Allow transaction normally.";
 if(score>=75){level="HIGH";decision="BLOCK";recommendation=t.chargebacks?"Block the transaction and investigate the customer.":"Temporarily block the transaction and require verification."}
 else if(score>=40){level="MEDIUM";decision="REVIEW";recommendation="Require step-up verification before completing the payment."}
 return {score,level,decision,factors,exposure:decision==="ALLOW"?0:decision==="REVIEW"?t.amount*.5:t.amount,recommendation};
}
export function analyzeTransactions(ts){return ts.map(t=>({...t,risk:calculateRisk(t)}))}
