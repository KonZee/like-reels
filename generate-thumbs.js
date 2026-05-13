const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, 'videos');
const thumbsDir = path.join(__dirname, 'thumbs');

if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir);

fs.readdirSync(videosDir)
  .filter(f => /\.(mp4|MP4)$/i.test(f))
  .forEach(file => {
    const input = path.join(videosDir, file);
    const output = path.join(thumbsDir, path.basename(file, path.extname(file)) + '.jpg');
    execSync(`ffmpeg -i "${input}" -ss 0.1 -vframes 1 -vf scale=360:-1 -q:v 8 "${output}" -y 2>/dev/null`);
    console.log(output);
  });
