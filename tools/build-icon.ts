import {mkdir,writeFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {chromium} from 'playwright';
import {Piko} from '../apps/web/src/Piko';

const svg=renderToStaticMarkup(createElement(Piko)).replace('<svg ',
 '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" ');
await mkdir('apps/web/public',{recursive:true});
await writeFile('apps/web/public/piko.svg',svg+'\n');
const browser=await chromium.launch();
try{
 const sizes=[16,32,48,64,128,256],images:Buffer[]=[];
 const page=await browser.newPage();
 for(const size of sizes){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
  images.push(await page.screenshot({omitBackground:true}));
 }
 await writeFile('apps/desktop/icon.png',images.at(-1)!);
 const header=Buffer.alloc(6+16*sizes.length);
 header.writeUInt16LE(1,2);
 header.writeUInt16LE(sizes.length,4);
 let offset=header.length;
 for(const [i,size] of sizes.entries()){
  const entry=6+i*16;
  header[entry]=size%256;header[entry+1]=size%256;
  header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);
  header.writeUInt32LE(images[i].length,entry+8);header.writeUInt32LE(offset,entry+12);
  offset+=images[i].length;
 }
 await writeFile('apps/desktop/icon.ico',Buffer.concat([header,...images]));
 console.log('Built offline SVG, PNG and Windows ICO from the shared Piko glyph.');
}finally{await browser.close();}
