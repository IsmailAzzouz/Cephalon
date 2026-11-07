import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { createHandler } from './http.mjs';

const {values}=parseArgs({options:{
  host:{type:'string',default:'0.0.0.0'},
  port:{type:'string'},
  dist:{type:'boolean',default:false},
  'log-requests':{type:'boolean',default:false},
}});
const dist=values.dist;
const host=values.host;
const root=fileURLToPath(new URL(dist?'../dist/':'../',import.meta.url));
const port=Number(values.port??process.env.PORT??5173);
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT must be an integer between 1 and 65535.');process.exit(1);}
if(dist&&!existsSync(resolve(root,'index.html'))){console.error('Run npm run build before npm run preview.');process.exit(1);}
const handler=createHandler(root,dist);
const server=createServer((req,res)=>{
  if(values['log-requests'])res.once('finish',()=>{
    console.log(`${req.socket.remoteAddress} ${req.method} ${req.url} → ${res.statusCode}`);
  });
  return handler(req,res);
});
server.on('error',error=>{
  if(error.code==='EADDRINUSE')console.error(`Port ${port} is in use. Try PORT=${port+1} npm run dev.`);
  else if(error.code==='EPERM'||error.code==='EACCES')console.error(`This environment cannot open port ${port}. Run npm run dev in a local terminal.`);
  else console.error(error.message);
  process.exitCode=1;
});
server.listen(port,host,()=>{
  console.log(`  Listening: ${host}:${port}`);
  console.log(`\n  CÉPHALON · Avatar playground (browser)\n\n  On this computer: http://localhost:${port}\n`);
  let found=false;
  try{
    for(const interfaces of Object.values(networkInterfaces())){
      for(const address of interfaces||[]){
        if(address.family==='IPv4'&&!address.internal){
          console.log(`  Phone: http://${address.address}:${port}`);found=true;
        }
      }
    }
  }catch{}
  if(!found)console.log(`  Phone: http://<computer local IP>:${port}`);
  console.log('\n  Connect your phone to the same Wi-Fi / local network.\n  Ctrl+C to stop.\n');
});
