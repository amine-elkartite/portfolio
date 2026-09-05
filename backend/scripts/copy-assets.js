import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('../frontend/assets/vendor',{recursive:true});
await copyFile('node_modules/chart.js/dist/chart.umd.js','../frontend/assets/vendor/chart.umd.js');
await copyFile('node_modules/chart.js/LICENSE.md','../frontend/assets/vendor/chart.LICENSE.md');
await copyFile('node_modules/lucide/dist/umd/lucide.js','../frontend/assets/vendor/lucide.js');
await copyFile('node_modules/lucide/LICENSE','../frontend/assets/vendor/lucide.LICENSE');
console.log('Bibliothèques locales copiées.');
