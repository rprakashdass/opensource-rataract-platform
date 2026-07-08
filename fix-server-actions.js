const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/features');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    let useServerIndex = -1;
    
    // Find "use server";
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '"use server";' || lines[i].trim() === "'use server';") {
            useServerIndex = i;
            break;
        }
    }
    
    if (useServerIndex > 0) {
        // Remove it from its current position
        const useServerLine = lines.splice(useServerIndex, 1)[0];
        // Insert it at the very top
        lines.unshift(useServerLine);
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Fixed ${file}`);
    }
});

