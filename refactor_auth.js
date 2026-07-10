const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const actionFiles = findFiles('src/features', filePath => filePath.includes('/actions/') && filePath.endsWith('.ts'));
const apiFiles = findFiles('src/app/api', filePath => filePath.endsWith('.ts'));
const allFiles = [...actionFiles, ...apiFiles];

const helperMap = {
  'attendance': 'canManageClub',
  'publishing': 'canManageClub',
  'projects': 'canManageClub',
  'initiatives': 'canManageClub',
  'storage': 'canManageClub',
  'public': 'canManageWebsite',
  'finance': 'canManageFinance',
  'members': 'canManageMembers',
  'documents': 'canManageClub',
  'communication': 'canManageCommunication',
  'events': 'canManageClub',
  'media': 'canManageClub',
  'admin/club': 'canManageClub',
  'admin/portfolios': 'canManageClub',
  'admin/club-roles': 'canManageClub',
  'admin/announcements': 'canManageCommunication',
  'admin/sponsors': 'canManageWebsite',
  'admin/accounts': 'canManageSystem',
  'admin/finance': 'canManageFinance',
  'admin/members': 'canManageMembers',
  'admin/events': 'canManageClub',
  'finance/requests': 'canManageFinance',
  'events/[id]/calendar': 'canManageClub',
};

const noAuthOrCustom = [
  'registerForEvent.ts',
  'submitInquiry.ts',
  'createInitiative.ts',
  'auth/me',
  'auth/login',
  'auth/logout',
  'member/profile'
];

allFiles.forEach(file => {
  if (noAuthOrCustom.some(ex => file.includes(ex))) return;

  let content = fs.readFileSync(file, 'utf8');
  let matchedModule = Object.keys(helperMap).find(mod => file.includes('/' + mod + '/'));
  let helper = matchedModule ? helperMap[matchedModule] : null;

  if (!helper) return;

  // Replace block auth checks first
  const blockRegex = /if\s*\(\!session[^\{]*\)\s*\{\s*return\s*\{[^}]*error:\s*["']Unauthorized["'][^}]*\}\s*;\s*\}/g;
  content = content.replace(blockRegex, `if (!session || !${helper}(session)) { return { error: "Unauthorized" }; }`);

  // Replace block api auth checks
  const apiBlockRegex = /if\s*\(\!session[^\{]*\)\s*\{\s*return\s+(?:new\s+Response|NextResponse)[^}]*\}\s*;\s*\}/g;
  content = content.replace(apiBlockRegex, `if (!session || !${helper}(session)) { return new Response("Unauthorized", { status: 403 }); }`);

  // Replace inline auth checks
  const inlineRegex = /if\s*\(\!session[^)]*\)\s*return\s*\{\s*error:\s*["']Unauthorized["']\s*\}\s*;/g;
  content = content.replace(inlineRegex, `if (!session || !${helper}(session)) return { error: "Unauthorized" };`);
  
  const apiInlineRegex = /if\s*\(\!session[^)]*\)\s*return\s+(?:new\s+Response|NextResponse)[^;]*;/g;
  content = content.replace(apiInlineRegex, `if (!session || !${helper}(session)) return new Response("Unauthorized", { status: 403 });`);

  fs.writeFileSync(file, content);
});

console.log("Refactoring complete 2");
