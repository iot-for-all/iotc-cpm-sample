const fs = require('fs');

const path = './env.json';
try {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '{}');
    }
}
catch (err) {
    console.error(err);
}
