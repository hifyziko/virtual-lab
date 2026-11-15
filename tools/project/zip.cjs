'use strict';
// ZIP32, UTF-8 names, raw DEFLATE; no credentials or platform-specific libraries.
const C=require('./common.cjs'),zlib=require('node:zlib'),{fs,path}=C;
function create(base,target,paths){
 const fd=fs.openSync(target,'wx'),central=[];let offset=0;
 const put=b=>{fs.writeSync(fd,b);offset+=b.length;if(offset>=0xffffffff)throw Error('ZIP32 size limit exceeded');};
 try{for(const rel of paths){const p=C.inside(base,rel),data=fs.readFileSync(p),name=Buffer.from(rel),packed=zlib.deflateRawSync(data,{level:6}),crc=zlib.crc32(data);const start=offset;
 const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(packed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);put(local);put(name);put(packed);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(start,42);central.push(Buffer.concat([c,name]));}
 const start=offset;for(const c of central)put(c);if(paths.length>=65535)throw Error('Too many ZIP entries');const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(paths.length,8);end.writeUInt16LE(paths.length,10);end.writeUInt32LE(offset-start,12);end.writeUInt32LE(start,16);put(end);
 }finally{fs.closeSync(fd);}
}
function verify(file,manifest){const fd=fs.openSync(file,'r'),stat=fs.fstatSync(fd);const read=(n,pos)=>{const b=Buffer.alloc(n);if(fs.readSync(fd,b,0,n,pos)!==n)throw Error('Truncated ZIP');return b;};try{const end=read(22,stat.size-22);if(end.readUInt32LE()!==0x06054b50)throw Error('Invalid ZIP');let pos=end.readUInt32LE(16);const expected=new Map(manifest.map(f=>[f.path,f]));for(let i=0;i<end.readUInt16LE(10);i++){const c=read(46,pos),name=read(c.readUInt16LE(28),pos+46).toString('utf8');C.inside(path.dirname(file),name);const local=read(30,c.readUInt32LE(42)),start=c.readUInt32LE(42)+30+local.readUInt16LE(26)+local.readUInt16LE(28),data=zlib.inflateRawSync(read(c.readUInt32LE(20),start));if(zlib.crc32(data)!==c.readUInt32LE(16))throw Error('ZIP CRC: '+name);const f=expected.get(name);if(!f||f.bytes!==data.length||f.sha256!==C.sha(data))throw Error('ZIP hash: '+name);expected.delete(name);pos+=46+c.readUInt16LE(28)+c.readUInt16LE(30)+c.readUInt16LE(32);}if(expected.size)throw Error('Missing ZIP files');}finally{fs.closeSync(fd);}}
module.exports={create,verify};
