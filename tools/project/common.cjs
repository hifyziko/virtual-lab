'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const relative=p=>path.relative(root,p).replaceAll('\\','/');
function inside(base,rel){if(typeof rel!=='string'||!rel||rel.includes('\\')||rel.split('/').some(x=>x==='..'||x==='')||path.isAbsolute(rel))throw Error('Unsafe relative path: '+rel);const p=path.resolve(base,rel);if(!p.startsWith(path.resolve(base)+path.sep))throw Error('Path outside project');return p;}
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlinks are not packaged: '+p);return e.isDirectory()?walk(p):[p]});}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function writeJSON(p,data){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');}
function copy(from,to){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);}
function git(args,opts={}){return cp.execFileSync('git',args,{cwd:root,encoding:'utf8',...opts}).trim();}
function policy(){return json(path.join(root,'config/project-files.json'));}
function webFiles(manifest=json(path.join(root,'versions/aktualni/manifest.json'))){
 const generated=manifest.progressiveFiles||[];
 for(const rel of generated)if(!/^lazy\/[a-z0-9-]+-[a-f0-9]{16}\.js$/.test(rel))throw Error('Unexpected generated web asset: '+rel);
 return [...new Set([...policy().webFiles,...generated])].sort();
}
function repositoryFiles(){const p=policy();return [...new Set([...p.sourceFiles,...walk(path.join(root,'tools/project')).map(relative),...walk(path.join(root,'.github/workflows')).map(relative),'config/project-files.json','.gitignore','.gitattributes'])].sort();}
function assertPublic(rel){inside(root,rel);if(/(^|\/)(\.env(?:\..*)?|\.git|\.ssh|\.aws|\.codex|\.browser|node_modules|tmp|archiv|TEs knizka)(\/|$)|\.(pdf|zip|npz|aedt|aedtplt|fld|pem|key|pfx|p12|pyc)$/i.test(rel)||rel.startsWith('docs/fuze/podklady/')||rel.startsWith('versions/1.'))throw Error('Private/generated file cannot enter public repository: '+rel);}
module.exports={fs,path,cp,root,relative,inside,walk,sha,json,writeJSON,copy,git,policy,webFiles,repositoryFiles,assertPublic};
