import {readFile,writeFile} from 'node:fs/promises';
import {crc32,deflateRawSync} from 'node:zlib';
/** Small ZIP writer for the bounded local source package, portable on Node 24. */
export async function writeSourceZip(destination:string,files:string[]){
 const local:Buffer[]=[],central:Buffer[]=[];let offset=0;
 const now=new Date(),year=Math.max(1980,now.getFullYear()),date=((year-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate(),time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
 if(files.length>65535)throw new Error('ZIP64 required');
 for(const file of files){
  const name=Buffer.from(file.replaceAll('\\','/'),'utf8'),bytes=await readFile(file),compressed=deflateRawSync(bytes),crc=crc32(bytes);
  if(offset+compressed.length>0xffffffff)throw new Error('ZIP64 required');
  const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(time,10);h.writeUInt16LE(date,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(name.length,26);
  local.push(h,name,compressed);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(time,12);c.writeUInt16LE(date,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);central.push(c,name);
  offset+=h.length+name.length+compressed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
 await writeFile(destination,Buffer.concat([...local,directory,end]));
}
