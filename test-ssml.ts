import { buildSsml } from './src/services/ssml';

const testText = "Hãy mô tả kinh nghiệm với React Native, Node.js và TypeScript, CSS";
const ssml = buildSsml(testText, 'vi-VN-HoaiMyNeural');
console.log(ssml);
