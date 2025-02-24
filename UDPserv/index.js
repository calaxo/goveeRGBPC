require('dotenv').config();
const noble = require("@abandonware/noble");
const dgram = require("dgram");

const LED_MAC_ADDRESS = process.env.MACBluetooth.toLowerCase();
const SERVICE_UUID = "00010203-0405-0607-0809-0a0b0c0d1910";
const CHARACTERISTIC_UUID = "00010203-0405-0607-0809-0a0b0c0d2b11";

const KEEPALIVE = "aa010000000000000000000000000000000000ab";
const TURN_ON = "3301010000000000000000000000000000000033";

const ALL1 = "33051501";
const ALL2 = "0000000000ff7f0000000000";

const PORT = 4003;
const HOST = "0.0.0.0";

const server = dgram.createSocket("udp4");
let characteristic;
let previousColors = new Array(15).fill(null);

const segmentsMap = {
    1: "0100", 2: "0200", 3: "0400", 4: "0800",
    5: "1000", 6: "2000", 7: "4000", 8: "8000",
    9: "0001", 10: "0002", 11: "0004", 12: "0008",
    13: "0010", 14: "0020", 15: "0040",
};

function getChecksum(bytes) {
    let numChunks = bytes.length / 2;
    let xor = "00";
    for (let i = 0; i < numChunks; i++) {
        let chunk = bytes.slice(i * 2, (i + 1) * 2);
        const buf1 = Buffer.from(xor, 'hex');
        const buf2 = Buffer.from(chunk, 'hex');
        xor = buf1.map((b, i) => b ^ buf2[i]).toString('hex');
    }
    return xor;
}

function hexToBuffer(hex) {
    return Buffer.from(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)));
}

async function keepAlive() {
    while (true) {
        try {
            await characteristic.writeAsync(hexToBuffer(KEEPALIVE), true);
        } catch (e) {
            console.log("[KeepAlive]: Échec de l'envoi", e);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', async (device) => {
    if (device.address.toLowerCase() === LED_MAC_ADDRESS) {
        noble.stopScanning();
        try {
            await device.connectAsync();
            console.log("🔗 Connecté");

            let { characteristics } = await device.discoverSomeServicesAndCharacteristicsAsync(
                [SERVICE_UUID], [CHARACTERISTIC_UUID]
            );

            characteristic = characteristics[0];
            if (!characteristic) return console.error("❌ Erreur caractéristiques");

            keepAlive();
            await characteristic.writeAsync(hexToBuffer(TURN_ON), true);
        } catch (err) {
            console.log("❌ Connexion échouée", err);
        }
    }
});



// Envoi optimisé des couleurs
async function sendColorsToLED(colors) {
    if (!characteristic) return console.error("Pas de connexion à la bande LED");
    if (!Array.isArray(colors) || colors.length < 3) return console.error("Format invalide");

    // Étape 1 : Analyse des couleurs
    let colorCounts = {};
    let segmentChanges = [];

    for (let i = 0; i < 15; i++) {
        let color = colors.slice(i * 3, (i + 1) * 3).join('');
        if (!colorCounts[color]) colorCounts[color] = 0;
        colorCounts[color]++;
        if (!previousColors[i] || previousColors[i].join('') !== color) {
            segmentChanges.push(i + 1); // On note les segments à modifier
        }
    }

    let dominantColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    let dominantPercentage = (colorCounts[dominantColor] / 15) * 100;

    // Étape 2 : Si la majorité (> 80%) des segments ont une couleur dominante, on optimise
    if (dominantPercentage > 80 && segmentChanges.length > 2) {
        console.log("🎨 Uniformisation avec la couleur dominante :", dominantColor);

        let hexColor = dominantColor.match(/.{1,2}/g).join('');
        let hexBytes = ALL1 + hexColor + ALL2;
        let checksum = getChecksum(hexBytes);
        hexBytes += checksum;
        await characteristic.writeAsync(hexToBuffer(hexBytes), true);
        await new Promise(resolve => setTimeout(resolve, 200)); // Petite pause pour éviter de saturer le contrôleur

        // Mise à jour de tous les segments avec la couleur dominante
        previousColors.fill(dominantColor.match(/.{1,2}/g).map(c => parseInt(c, 16)));
    }

    // Étape 3 : Modification des segments spécifiques
    let segmentIndexes = segmentChanges.sort(() => Math.random() - 0.5);
    for (let segmentNumber of segmentIndexes) {
        let i = (segmentNumber - 1) * 3;
        let color = colors.slice(i, i + 3);
        
        if (previousColors[segmentNumber - 1] && previousColors[segmentNumber - 1].every((val, idx) => val === color[idx])) {
            console.log("🚫 Couleur identique pour le segment", segmentNumber);
            continue; // Ne pas envoyer si la couleur est identique
        }

        previousColors[segmentNumber - 1] = [...color];

        let hexColor = color.map(c => c.toString(16).padStart(2, '0')).join('');
        let segment = segmentsMap[segmentNumber];
        let hexBytes = `33051501${hexColor}0000000000${segment}0000000000`;
        let checksum = getChecksum(hexBytes);
        hexBytes += checksum;

        await characteristic.writeAsync(hexToBuffer(hexBytes), true);
        await new Promise(resolve => setTimeout(resolve, 150)); // Délai réduit pour optimisation
    }
}


let isSending = false;

server.on("message", async (msg) => {
    if (isSending) {
        console.log("🚫 Envoi en cours, message ignoré");
        return;

    } 

    const message = JSON.parse(msg.toString());
    if (message.msg?.cmd === "colorwc" && message.msg.data?.color) {
        isSending = true;
        await sendColorsToLED(message.msg.data.color);
        isSending = false;
    }
});

server.on("listening", () => {
    console.log(`Serveur UDP en écoute sur ${HOST}:${PORT}`);
});

server.bind(PORT, HOST);
