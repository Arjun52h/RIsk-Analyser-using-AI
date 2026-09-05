import {useRef,useState} from 'react';
import {Upload,FileSpreadsheet,Download,RotateCcw} from 'lucide-react';

const sample=`id,amount,timestamp,customerId,deviceId,ip,location,paymentMethod,attemptCount,accountAgeDays,previousTransactions,chargebacks,failedAttempts,status\nTX2001,85000,2026-09-04 12:10,C901,D901,10.0.0.21,Mumbai,Card,6,3,0,1,4,success\nTX2002,2499,2026-09-04 12:12,C902,D902,10.0.0.22,Delhi,UPI,1,180,12,0,0,success`;

function parseCSV(text){
 const lines=text.trim().split(/\r?\n/); if(lines.length<2) throw new Error('CSV must contain a header and at least one row.');
 const parseLine=line=>{const out=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'){cur+='"';i++;}else if(c==='"')quote=!quote;else if(c===','&&!quote){out.push(cur.trim());cur='';}else cur+=c;}out.push(cur.trim());return out;};
 const headers=parseLine(lines[0]).map(h=>h.replace(/^"|"$/g,'').trim());
 const required=['id','amount']; const missing=required.filter(x=>!headers.includes(x)); if(missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}`);
 const num=['amount','attemptCount','accountAgeDays','previousTransactions','chargebacks','failedAttempts'];
 return lines.slice(1).filter(Boolean).map((line,idx)=>{const vals=parseLine(line);const obj={};headers.forEach((h,i)=>obj[h]=vals[i]??'');num.forEach(k=>obj[k]=Number(obj[k]||0));obj.id=obj.id||`CSV-${idx+1}`;obj.customerId=obj.customerId||'CSV-CUSTOMER';obj.timestamp=obj.timestamp||new Date().toISOString().slice(0,16).replace('T',' ');obj.paymentMethod=obj.paymentMethod||'Unknown';obj.status=obj.status||'success';return obj;});
}

export default function CsvUploader({onImport,onReset,count}){
 const ref=useRef(null); const [msg,setMsg]=useState(''); const [error,setError]=useState('');
 const handle=file=>{if(!file)return;setMsg('');setError('');const reader=new FileReader();reader.onload=e=>{try{const rows=parseCSV(e.target.result);onImport(rows);setMsg(`Imported ${rows.length} transaction(s) successfully.`);}catch(err){setError(err.message);}};reader.readAsText(file);};
 const download=()=>{const blob=new Blob([sample],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='riskpilot-sample.csv';a.click();URL.revokeObjectURL(a.href);};
 return <section className="uploadPanel panel"><div><div className="uploadIcon"><FileSpreadsheet size={20}/></div><div><b>Analyze your own transaction data</b><p>Upload a CSV and RiskPilot will score every row locally. No API or data upload required.</p></div></div><div className="uploadActions"><input ref={ref} type="file" accept=".csv,text/csv" hidden onChange={e=>handle(e.target.files?.[0])}/><button className="primaryBtn" onClick={()=>ref.current?.click()}><Upload size={14}/> Upload CSV</button><button className="secondaryBtn" onClick={download}><Download size={14}/> Sample CSV</button><button className="secondaryBtn" onClick={()=>{onReset();setMsg(`Restored ${count} demo transactions.`);setError('')}}><RotateCcw size={14}/> Reset demo</button></div>{msg&&<div className="uploadMsg">✓ {msg}</div>}{error&&<div className="uploadError">{error}</div>}<div className="csvHint">Required: <b>id, amount</b> · Recommended: customerId, paymentMethod, attemptCount, accountAgeDays, previousTransactions, chargebacks, failedAttempts</div></section>
}
