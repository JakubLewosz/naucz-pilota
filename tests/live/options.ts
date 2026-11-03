export function parseLiveOptions(args:string[]){
 let filter:string|undefined,maxProviderCalls=44;
 const seen=new Set<string>();
 for(let i=0;i<args.length;i++){
  const flag=args[i];
  if(!['--case','--max-calls'].includes(flag)||seen.has(flag))throw new Error('Unknown or repeated live option. Use --help.');
  const value=args[++i];if(!value||value.startsWith('--'))throw new Error(`${flag} requires a value.`);
  seen.add(flag);if(flag==='--case')filter=value;else maxProviderCalls=Number(value);
 }
 if(!Number.isInteger(maxProviderCalls)||maxProviderCalls<2||maxProviderCalls>44)throw new Error('--max-calls must be an integer from 2 to 44.');
 return {filter,maxProviderCalls};
}
