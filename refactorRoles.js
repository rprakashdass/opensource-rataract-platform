const fs = require('fs');
const glob = require('glob'); // Not available? We can just use recursive readdir
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace standard session checks
  content = content.replace(/session\.role !== "ADMIN" && session\.role !== "CLUB_ADMIN"/g, 
    "!(session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN'))");
  
  content = content.replace(/session\.role === "ADMIN" \|\| session\.role === "CLUB_ADMIN"/g, 
    "(session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN'))");

  // For currentUser?.role in pages
  content = content.replace(/currentUser\?\.role === "ADMIN" \|\| currentUser\?\.role === "CLUB_ADMIN"/g, 
    "(currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('CLUB_ADMIN'))");

  // Finance route specifically:
  // ["ADMIN", "CLUB_ADMIN", "TREASURER"].includes(session.role)
  content = content.replace(/\["ADMIN", "CLUB_ADMIN", "TREASURER"\]\.includes\(session\.role\)/g, 
    "session.roles?.some(r => ['ADMIN', 'CLUB_ADMIN', 'TREASURER'].includes(r))");

  // Login page logic: data.role === "ADMIN" ...
  content = content.replace(/data\.role === "ADMIN" \|\| data\.role === "CLUB_ADMIN" \|\| data\.role === "FINANCE_ADMIN"/g,
    "data.roles?.some(r => ['ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN'].includes(r))");

  // user.role in Accounts page
  content = content.replace(/\{acc\.role \|\| "NONE"\}/g, "{acc.roles?.join(', ') || 'NONE'}");
  content = content.replace(/setRole\(account\.role \|\| "ADMIN"\);/g, "setRole(account.roles?.[0] || 'ADMIN');");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated", filePath);
  }
});
