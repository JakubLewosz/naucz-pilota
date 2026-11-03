import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash,randomUUID,randomBytes} from 'node:crypto';
import type {RuleEvidence} from '@piko/core';
import type {Envelope,Exchange} from '@piko/contracts';
export type StoredSession={id:string;revision:number;tokenHash:string;expires:number;evidence:RuleEvidence[];exchanges:Exchange[];sceneId:string};
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
export class Store {
 db:DatabaseSync;
 constructor(path:string){
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
  this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL,revision INTEGER NOT NULL,expires INTEGER NOT NULL,data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS turns(session_id TEXT NOT NULL,turn_id TEXT NOT NULL,body_hash TEXT NOT NULL,status TEXT NOT NULL,response TEXT,created INTEGER NOT NULL,PRIMARY KEY(session_id,turn_id));
  CREATE TABLE IF NOT EXISTS budget(day TEXT PRIMARY KEY,count INTEGER NOT NULL);
  UPDATE turns SET status='interrupted' WHERE status='pending';`);
 }
 close(){this.db.close();}
 clean(){const cutoff=Date.now()-86400000;this.db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());this.db.prepare('DELETE FROM turns WHERE created < ?').run(cutoff);this.db.prepare('DELETE FROM budget WHERE day < ?').run(new Date(cutoff*1-86400000*30).toISOString().slice(0,10));}
 createSession(){const token=randomBytes(32).toString('hex');const s:StoredSession={id:randomUUID(),revision:0,tokenHash:hash(token),expires:Date.now()+86400000,evidence:[],exchanges:[],sceneId:''};this.db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)').run(s.id,s.tokenHash,0,s.expires,JSON.stringify(s));return {session:s,token};}
 authenticate(token:string|undefined):StoredSession|null {
  if(!token||token.length>128)return null;
  const row=this.db.prepare('SELECT id,revision,data FROM sessions WHERE token_hash=? AND expires>?').get(hash(token),Date.now());
  return row?{...JSON.parse(row.data as string),revision:row.revision as number}:null;
 }
 updateSession(s:StoredSession){this.db.prepare('UPDATE sessions SET data=? WHERE id=?').run(JSON.stringify(s),s.id);}
 getTurn(sid:string,tid:string){return this.db.prepare('SELECT * FROM turns WHERE session_id=? AND turn_id=?').get(sid,tid);}
 beginTurn(sid:string,tid:string,revision:number,body:string):boolean{
  this.db.exec('BEGIN IMMEDIATE');try{
   const changed=this.db.prepare('UPDATE sessions SET revision=revision+1 WHERE id=? AND revision=?').run(sid,revision).changes;
   if(!changed){this.db.exec('ROLLBACK');return false;}
   this.db.prepare('INSERT INTO turns VALUES(?,?,?,\'pending\',NULL,?)').run(sid,tid,hash(body),Date.now());this.db.exec('COMMIT');return true;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 finishTurn(sid:string,tid:string,envelope:Envelope){this.db.prepare('UPDATE turns SET status=\'done\',response=? WHERE session_id=? AND turn_id=?').run(JSON.stringify(envelope),sid,tid);}
 bodyHash(body:string){return hash(body);}
 recentCount(sid:string){return (this.db.prepare('SELECT COUNT(*) AS n FROM turns WHERE session_id=? AND created>?').get(sid,Date.now()-60000)?.n??0) as number;}
 reserve(limit:number){
  const day=new Date().toISOString().slice(0,10);this.db.exec('BEGIN IMMEDIATE');
  try{
   this.db.prepare('INSERT OR IGNORE INTO budget VALUES(?,0)').run(day);
   const count=this.db.prepare('SELECT count FROM budget WHERE day=?').get(day)!.count as number;
   if(count>=limit){this.db.exec('ROLLBACK');return false;}
   this.db.prepare('UPDATE budget SET count=count+1 WHERE day=?').run(day);this.db.exec('COMMIT');return true;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
}
