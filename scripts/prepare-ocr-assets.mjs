import {copyFileSync,mkdirSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const pkgRoot=name=>path.dirname(require.resolve(name+'/package.json'));
const dest=path.join(root,'public/ocr');
mkdirSync(path.join(dest,'core'),{recursive:true});mkdirSync(path.join(dest,'lang'),{recursive:true});
copyFileSync(path.join(pkgRoot('tesseract.js'),'dist/worker.min.js'),path.join(dest,'worker.min.js'));
const core=pkgRoot('tesseract.js-core');
for(const suffix of ['','-simd','-lstm','-simd-lstm','-relaxedsimd','-relaxedsimd-lstm'])for(const ext of ['.wasm.js','.wasm']){
 const file='tesseract-core'+suffix+ext;copyFileSync(path.join(core,file),path.join(dest,'core',file));
}
const language=pkgRoot('@tesseract.js-data/eng');
copyFileSync(path.join(language,'4.0.0_best_int/eng.traineddata.gz'),path.join(dest,'lang/eng.traineddata.gz'));
// Fail early instead of silently falling back to a remote OCR asset provider.
if(statSync(path.join(dest,'lang/eng.traineddata.gz')).size<100000)throw new Error('OCR language asset missing');
console.log('Prepared self-hosted OCR engine and English/MRZ model; no user documents involved.');
