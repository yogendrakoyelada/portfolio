const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');

const files = {
  profile: 'profile.json',
  skills: 'skills.json',
  projects: 'projects.json',
  experience: 'experience.json',
  certifications: 'certifications.json',
  sql: 'sql.json',
  dax: 'dax.json'
};

const combinedData = {};

for (const [key, filename] of Object.entries(files)) {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    combinedData[key] = JSON.parse(fileData);
  } else {
    console.error(`Missing file: ${filePath}`);
  }
}

fs.writeFileSync(path.join(dataDir, 'data.json'), JSON.stringify(combinedData, null, 2));
console.log('Successfully created data.json');
