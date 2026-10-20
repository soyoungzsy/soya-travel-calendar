import fs from 'node:fs';
import path from 'node:path';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8')),destination=path.resolve('.release','server-v'+pkg.version);
if(fs.existsSync(destination))throw new Error('Server package already exists; use a new version or explicitly review existing output.');
if(!fs.existsSync('dist/client/index.html'))throw new Error('Run the production build first.');
fs.mkdirSync(destination,{recursive:true});
for(const source of ['dist/client','server/node-server.mjs','worker','drizzle','licenses','LICENSE','THIRD_PARTY_NOTICES.md','deploy/aliyun/README.md','deploy/aliyun/nginx.conf.example','deploy/aliyun/scenicdue.service.example','docs/media-credits.md']){const target=path.join(destination,source);fs.mkdirSync(path.dirname(target),{recursive:true});fs.cpSync(source,target,{recursive:true});}
fs.writeFileSync(path.join(destination,'package.json'),JSON.stringify({name:pkg.name,version:pkg.version,private:true,type:'module',engines:pkg.engines,scripts:{start:'node server/node-server.mjs'}},null,2)+'\n');
fs.writeFileSync(path.join(destination,'START-HERE.txt'),'Requires Node.js 22.12 or newer. No npm install is needed.\nStart: node server/node-server.mjs\nDefault: http://127.0.0.1:8080\nSee deploy/aliyun/README.md for the migration status, ICP and HTTPS steps.\n');
console.log(destination);
