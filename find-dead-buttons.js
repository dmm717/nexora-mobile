const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.tsx');
let hasDead = false;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  // Simple check: how many <TouchableOpacity and how many onPress?
  // A better regex: match `<TouchableOpacity[^>]*>` and check if it contains onPress.
  const regex = /<(TouchableOpacity|Pressable)[^>]*>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[0].includes('/>')) continue; // Self-closing could be anything, but usually not buttons. Actually it can be.
    if (!match[0].includes('onPress=') && !match[0].includes('onPressIn=') && !match[0].includes('onPressOut=')) {
      if (match[0].includes('asChild')) continue; // NextJS/Expo Router Link asChild
      console.log('Dead button found in:', file);
      console.log(match[0]);
      hasDead = true;
    }
  }
}
if (!hasDead) console.log('No dead buttons found.');
