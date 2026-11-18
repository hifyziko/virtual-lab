'use strict';
// Windows scanners can briefly hold a freshly generated delivery file open.
// Retry only transient open failures; preserve the original operation and error.
const fs=require('node:fs'),write=fs.writeFileSync,delay=new Int32Array(new SharedArrayBuffer(4));
fs.writeFileSync=function(...args){for(let attempt=0;;attempt++){try{return write.apply(this,args);}catch(error){if(process.platform!=='win32'||!['EBUSY','EPERM','UNKNOWN'].includes(error.code)||error.syscall!=='open'||attempt>=20)throw error;Atomics.wait(delay,0,0,100);}}};
