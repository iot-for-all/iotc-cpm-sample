import Express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js'
import * as fs from 'fs';


export enum CredentialTypes {
    QRCODE = 1,
    NUMERIC = 2,
    ALL = 3
}
export type Credentials = {
    deviceId: string,
    modelId: string,
    patientId: string,
    deviceKey: string,
    scopeId: string,
    types: CredentialTypes
}


const app = Express();
const port = process.env.PORT || 3700;
const dbPath = path.join(__dirname, '../db.json');
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '{}');
}
let db = JSON.parse(fs.readFileSync(dbPath).toString());
// define a route handler for the default home page

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
app.post('/creds', async (req, res) => {
    const creds: Credentials = req.body;
    if (!creds['scopeId']) {
        res.status(500).send('Invalid body');
        return;
    }
    let response: { qrCode?: string, numeric?: number } = {};
    let credType = +creds.types;
    const { types, ...credentials } = creds;
    let cr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(credentials)));
    const codeStr = creds.patientId ? CryptoJS.AES.encrypt(cr, creds.patientId).toString() : cr;
    if (credType == CredentialTypes.ALL.valueOf() || credType == CredentialTypes.QRCODE.valueOf()) {
        response['qrCode'] = await QRCode.toDataURL(codeStr);
    }
    if (credType == CredentialTypes.ALL.valueOf() || credType == CredentialTypes.NUMERIC.valueOf()) {
        const numCode = Math.floor(Math.random() * 100000);
        db[numCode] = codeStr;
        fs.writeFileSync(dbPath, JSON.stringify(db));
        response['numeric'] = numCode;
    }

    res.send(response);
});
app.get('/numeric', (req, res) => {
    let numeric = req.query.numeric as string;
    if (db[numeric]) {
        res.send(db[numeric]);
    }
    else {
        res.send(-1);
    }
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});