const fs = require('fs');
const path = require('path');

const addRevalidateTags = (filePath, tags) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add import if not exists
    if (!content.includes('revalidateTag')) {
        if (content.includes('revalidatePath')) {
            content = content.replace('revalidatePath', 'revalidatePath, revalidateTag');
        } else {
            content = `import { revalidateTag } from "next/cache";\n` + content;
        }
    }
    
    // Create the statements
    const tagStatements = tags.map(t => `revalidateTag("${t}");`).join(' ');
    
    // Insert after revalidatePath calls if they exist, or before return { success: true }
    if (content.includes('revalidatePath')) {
        content = content.replace(/(revalidatePath\([^)]+\);)/g, `$1\n    ${tagStatements}`);
    } else if (content.includes('return { success: true')) {
        content = content.replace(/(return \{ success: true)/g, `${tagStatements}\n    $1`);
    } else {
        content = content.replace(/(return \{ [^}]+ \})/g, `${tagStatements}\n    $1`);
    }

    // Write back
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
};

const map = [
    { pattern: 'features/events/actions', tags: ['events', 'homepage'] },
    { pattern: 'features/projects/actions', tags: ['projects', 'homepage'] },
    { pattern: 'features/communication/actions/sendAnnouncement', tags: ['announcements', 'homepage'] },
    { pattern: 'features/public/actions/saveWebsiteSettings', tags: ['website-settings', 'layout', 'club', 'homepage'] },
    { pattern: 'features/public/actions/manageMilestones', tags: ['club', 'homepage'] },
    { pattern: 'features/members/actions', tags: ['team', 'homepage'] },
    { pattern: 'features/publishing/actions/publishContent', tags: ['homepage', 'events', 'projects', 'gallery'] }
];

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/features');

files.forEach(file => {
    for (const { pattern, tags } of map) {
        if (file.includes(pattern)) {
            addRevalidateTags(file, tags);
            break; // Apply only the first matching pattern
        }
    }
});

