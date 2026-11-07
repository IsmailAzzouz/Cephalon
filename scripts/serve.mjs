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
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT doit être un entier entre 1 et 65535.');process.exit(1);}
if(dist&&!existsSync(resolve(root,'index.html'))){console.error('Lancez npm run build avant npm run preview.');process.exit(1);}
const handler=createHandler(root,dist);
const server=createServer((req,res)=>{
  if(values['log-requests'])res.once('finish',()=>{
    console.log(`${req.socket.remoteAddress} ${req.method} ${req.url} → ${res.statusCode}`);
  });
  return handler(req,res);
});
server.on('error',error=>{
  if(error.code==='EADDRINUSE')console.error(`Le port ${port} est occupé. Essayez PORT=${port+1} npm run dev.`);
  else if(error.code==='EPERM'||error.code==='EACCES')console.error(`L’environnement refuse l’ouverture du port ${port}. Lancez npm run dev dans un terminal normal du PC.`);
  else console.error(error.message);
  process.exitCode=1;
});
server.listen(port,host,()=>{
  console.log(`  Écoute : ${host}:${port}`);
  console.log(`\n  CÉPHALON · Atelier d’avatar (navigateur)\n\n  Sur ce PC : http://localhost:${port}\n`);
  let found=false;
  try{
    for(const interfaces of Object.values(networkInterfaces())){
      for(const address of interfaces||[]){
        if(address.family==='IPv4'&&!address.internal){
          console.log(`  Téléphone : http://${address.address}:${port}`);found=true;
        }
      }
    }
  }catch{}
  if(!found)console.log(`  Téléphone : http://<IP locale du PC>:${port}`);
  console.log('\n  Connectez le téléphone au même Wi-Fi / réseau local.\n  Ctrl+C pour arrêter.\n');
});
