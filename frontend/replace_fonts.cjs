const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  newContent = newContent.replace(/'Outfit',\s*'Plus\sJakarta\sSans',\s*sans-serif/g, "'DM Sans', sans-serif");
  newContent = newContent.replace(/'Inter',\s*sans-serif/g, "'DM Sans', sans-serif");
  newContent = newContent.replace(/'Inter',\s*'Plus\sJakarta\sSans',\s*sans-serif/g, "'DM Sans', sans-serif");
  newContent = newContent.replace(/'Inter',\s*-apple-system,\s*sans-serif/g, "'DM Sans', sans-serif");

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    } else if (fullPath.endsWith('index.css')) {
      let css = fs.readFileSync(fullPath, 'utf8');
      css = css.replace(/@import url\('[^']+'\);/, "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');");
      
      if (!css.includes('font-family:')) {
        css = css.replace('body {', "body {\n  font-family: 'DM Sans', sans-serif;");
      }
      fs.writeFileSync(fullPath, css);
      console.log('Updated index.css');
    }
  }
}

walk(path.join(__dirname, 'src'));
