import moduleA from './multiple-replacement-test/source-a.js';
import moduleB from './multiple-replacement-test/source-b.js';

console.log(`Message from source.js`);
moduleA.showMessage();
moduleB.showMessage();
