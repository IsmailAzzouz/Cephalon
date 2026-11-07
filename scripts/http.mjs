import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { browserFiles, browserDirectories } from './layout.mjs';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.zip':'application/zip'};

export function requestFile(requestUrl,root,dist=false){
  let pathname;
  try{pathname=decodeURIComponent(new URL(requestUrl,'http://localhost').pathname);}catch{return null;}
  if(pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').includes('..'))return null;
  const relative=pathname==='/'?'index.html':pathname.slice(1);
  const entry=browserFiles.find(([url])=>relative===url);
  if(entry)return resolve(root,dist?entry[0]:entry[1]);
  const directory=browserDirectories.find(([url])=>relative.startsWith(url));
  if(!directory)return null;
  const [url,source]=directory;
  const base=resolve(root,dist?url:source);
  const file=resolve(base,relative.slice(url.length));
  return file.startsWith(base+sep)?file:null;
}

export function createHandler(root,dist=false){
  return async(req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){
      res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;
    }
    const file=requestFile(req.url,root,dist);
    if(!file){res.writeHead(404);res.end('Not found');return;}
    try{
      if(!(await stat(file)).isFile())throw new Error('Not a file');
      const body=await readFile(file);
      res.writeHead(200,{
        'Content-Type':types[extname(file)]||'application/octet-stream',
        'Content-Length':body.length,
        'Cache-Control':'no-cache',
        'X-Content-Type-Options':'nosniff',
      });
      res.end(req.method==='HEAD'?undefined:body);
    }catch{res.writeHead(404);res.end('Not found');}
  };
}
