
const noble = require("@abandonware/noble");
//required to use bluetooth in JS

const dgram = require("dgram");
//to create UDP serve but i think there is other method to not use this module

const LED_MAC_ADDRESS = "xx:xx:xx:xx:xx:xx".toLowerCase(); // "xx:xx:xx:xx:xx:xx" is the bluethooth Mac address of the LED controller

const SERVICE_UUID = "00010203-0405-0607-0809-0a0b0c0d1910";
const CHARACTERISTIC_UUID = "00010203-0405-0607-0809-0a0b0c0d2b11";

const KEEPALIVE = "aa010000000000000000000000000000000000ab";


const TURN_ON = "3301010000000000000000000000000000000033";

const PORT = 4003;
const HOST = "0.0.0.0"; // listen on all interfaces

const server = dgram.createSocket("udp4");

let characteristic; // global variable


// to get the xor checksum needed at the end the message
function getChecksum(bytes) {
    let numChunks = bytes.length / 2;
    let xor = "00";
    for (let i = 0; i < numChunks; i++) {
        let chunk = bytes.slice(i * 2, (i + 1) * 2);

        const buf1 = Buffer.from(xor, 'hex');
        const buf2 = Buffer.from(chunk, 'hex');
        const bufResult = buf1.map((b, i) => b ^ buf2[i]);
        xor = bufResult.toString('hex');
    }
    return xor;
}

function hexToBuffer(hex) {
    return Buffer.from(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)));
}


//to reconnect if too much paquet has been send but i think it's not necessary
async function reconnectToLED() {
    try {

        noble.on('discover', async (device) => {
        // same code as the first connection
        if (device.address.toLowerCase() === LED_MAC_ADDRESS) {
            console.log("✅ LED strip founded!");
            noble.stopScanning();

            try {
                await device.connectAsync();
                console.log("🔗 connected");

                let { characteristics } = await device.discoverSomeServicesAndCharacteristicsAsync(
                    [SERVICE_UUID],
                    [CHARACTERISTIC_UUID]
                );

                characteristic = characteristics[0]; // Assignez la caractéristique ici
                if (!characteristic) {
                    console.error("❌ error with the characteristics");
                    return;
                }

            } catch (err) {
                console.log("cant reconnect to led", err);
            }
            }
        }
    );



    } catch (err) {
        console.log("Error to recconect", err);
    }
}

async function keepAlive() {
    while (true) {
            try {
                await characteristic.writeAsync(hexToBuffer(KEEPALIVE), true);
                console.log("[KeepAlive]: Message keep-alive envoyé");
            } catch (e) {
                console.log("[KeepAlive]: Échec de l'envoi du keep-alive", e);
            }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
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
        // to connect precisely to the led strip witout user input
        if (device.address.toLowerCase() === LED_MAC_ADDRESS) {
            console.log("✅ LED strip founded!");
            noble.stopScanning();

            try {
                await device.connectAsync();
                console.log("🔗 Connected");

                let { characteristics } = await device.discoverSomeServicesAndCharacteristicsAsync(
                    [SERVICE_UUID],
                    [CHARACTERISTIC_UUID]
                );

                characteristic = characteristics[0]; // Assignez la caractéristique ici
                if (!characteristic) {
                    console.error("❌ error with the characteristics");
                    return;
                }

                keepAlive();
                //because it dont know if the led strip is powerered on
                console.log("💡 turning on ");
                await characteristic.writeAsync(hexToBuffer(TURN_ON), true);
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (err) {
                console.log("error, can't connect", err);
            }
    }
});

                //i have 15 segment with code that i dont undersant for each
                let segmentsMap = {
                    1: "0100",
                    2: "0200",
                    3: "0400",
                    4: "0800",

                    5: "1000",
                    6: "2000",
                    7: "4000",
                    8: "8000",

                    9: "0001",
                    10: "0002",
                    11: "0004",
                    12: "0008",

                    13: "0010",
                    14: "0020",
                    15: "0040",


                }

// to send color to the led strip via the paquet of signalRGB
async function sendColorsToLED(colors) {
    if (!characteristic) {
        console.error("Pas de connexion à la bande LED");
        return;
    }

    // to avoid strange data
    if (!Array.isArray(colors)) {
        console.error("Les données de couleur ne sont pas au format attendu (tableau).");
        return;
    }
    let numerosegment=1
    // to gather rgb data by three
    for (let i = 0; i < colors.length; i += 3) {

        let color = colors.slice(i, i + 3);
        

        if (color.length < 3) {
            console.error(`Couleur incomplète à l'index ${i}:`, color);
            continue; // to avoid strange data
        }

        // to convert from rgb value 0-255 to hex value
        let hexColor = color.map(c => c.toString(16).padStart(2, '0')).join('');
                console.log("couleur acutelle rgb ", color);
        console.log("couleur acutelle hex", hexColor);
        console.log("numero semgnet", numerosegment);
        let segment = segmentsMap[numerosegment]; // Utilisez le mapping approprié pour votre bande

        let hexBytes = `33051501${hexColor}0000000000${segment}0000000000`;
        let checksum = getChecksum(hexBytes);
        hexBytes += checksum;
        console.log("Envoi de la couleur:", hexBytes);
        await characteristic.writeAsync(hexToBuffer(hexBytes), true);
        console.log(hexToBuffer(hexBytes));
        numerosegment++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Attendre entre les envois
    }
    numerosegment=1;
}



let isSending = false; // Variable maded to reduce the number of paquet send

// on each received paquet
server.on("message", async (msg, rinfo) => {
    if (isSending) {
        console.log("paquet deleted");
        return; // the led strip cant receive to much paquet and i dont know ho to speed down signalRGB
    }

    const message = JSON.parse(msg.toString());
    if (message.msg && message.msg.cmd === "colorwc" && message.msg.data.color) {
        console.log(`Message reçu de ${rinfo.address}:${rinfo.port} -> ${msg.toString()}`);
        
        isSending = true; // stop recepetion
        await sendColorsToLED(message.msg.data.color); // send color to led strip
        isSending = false; // re-start reception
    }
});

server.on("listening", () => {
    const address = server.address();
    console.log(`Serveur UDP listenning on ${address.address}:${address.port}`);
});

server.bind(PORT, HOST);

