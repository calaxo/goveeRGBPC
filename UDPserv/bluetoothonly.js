const noble = require("@abandonware/noble");


const LED_MAC_ADDRESS = "xx:xx:xx:xx:xx:xx".toLowerCase(); // Remplace avec ton adresse MAC
const SERVICE_UUID = "00010203-0405-0607-0809-0a0b0c0d1910";
const CHARACTERISTIC_UUID = "00010203-0405-0607-0809-0a0b0c0d2b11";






let commands = {
    "turnOn": "3301010000000000000000000000000000000033",
    "turnOff": "3301000000000000000000000000000000000032",
    "keepAlive": "aa010000000000000000000000000000000000ab",
    //music
    "energetic": "3305130563000000000000000000000000000043",
    "spectrum": "3305130463000000000000000000000000000042",
    "rythm": "3305130363000000000000000000000000000045",
    "separation": "3305133263000000000000000000000000000074",
    "rolling": "3305130663000000000000000000000000000040",

    //scenes
    "sunrise": "3305040000000000000000000000000000000032",
    "sunset": "3305040100000000000000000000000000000033",
    "movie": "3305040400000000000000000000000000000036",
    "dating": "3305040500000000000000000000000000000037",
    "romantic": "3305040700000000000000000000000000000035",
    "blinking": "330504080000000000000000000000000000003a",
    "candlelight": "330504090000000000000000000000000000003b",
    "snowflake": "3305040f0000000000000000000000000000003d",
    "rainbow": "3305041600000000000000000000000000000024",


    get(command) {
        let hex = this[command];

        return new Uint8Array(
            hex.match(/[\da-f]{2}/gi).map(function (h) {
                return parseInt(h, 16);
            })
        );

    },
    convert(string) {
        return new Uint8Array(
            string.match(/[\da-f]{2}/gi).map(function (h) {
                return parseInt(h, 16);
            })
        );
    }

}




// Fonction pour convertir une chaîne hex en buffer
function hexToBuffer(hex) {
    return Buffer.from(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)));
}

// Fonction pour calculer le checksum
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

// Commandes pour allumer et éteindre la LED
const TURN_ON = "3301010000000000000000000000000000000033";
const TURN_OFF = "3301000000000000000000000000000000000032";
const KEEPALIVE = "aa010000000000000000000000000000000000ab";

const MusicMode1 = "a3000102413207ff0000ff7f00ffff0000ff0054";
const MusicMode2 = "a3ff0000ff00ffff8b00ff0300610000000000b5";

const COLORSEG1 =    "33050b"
        
        // RED, GREEN, BLUE, LEFT, RIGHT, 
const COLORSEG2 ="0000000000000000000000"


const ALL1 = "33051501"

const ALL2 = "0000000000ff7f0000000000"

// xor

const COLORMODE = "3305150100000000000000000000000000000022";

// Liste des couleurs à tester
const COLORS = [
    "ff0000", // Rouge
    "00ff00", // Vert
    "0000ff", // Bleu
    "ffff00", // Jaune
    "00ffff", // Cyan
    "ff00ff", // Magenta
    "ffffff"  // Blanc
];

// Fonction pour tester les couleurs de la LED
async function testColors() {
    // Démarrer la recherche de périphériques
    noble.on('stateChange', (state) => {
        if (state === 'poweredOn') {
            noble.startScanning();
        } else {
            noble.stopScanning();
        }
    });

    noble.on('discover', async (device) => {
        // Filtrer pour l'adresse MAC de la LED
        if (device.address.toLowerCase() === LED_MAC_ADDRESS) {
            console.log("✅ Bande LED trouvée !");
            noble.stopScanning();

            try {
                await device.connectAsync();
                console.log("🔗 Connecté à la bande LED");

                const { characteristics } = await device.discoverSomeServicesAndCharacteristicsAsync(
                    [SERVICE_UUID],
                    [CHARACTERISTIC_UUID]
                );

                const characteristic = characteristics[0];




                // // Allumer la LED
                console.log("💡 Allumage de la LED...");
                await characteristic.writeAsync(hexToBuffer(TURN_ON), true);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // console.log("❌ Extinction de la LED...");
                // await characteristic.writeAsync(hexToBuffer(TURN_OFF), true);
                // await new Promise(resolve => setTimeout(resolve, 500));
                
                // console.log("passage en keepAlive");
                // await characteristic.writeAsync(hexToBuffer(KEEPALIVE), true);
                // await new Promise(resolve => setTimeout(resolve, 500));

                // console.log("1er mode musique");
                // await characteristic.writeAsync(hexToBuffer(MusicMode1), true);
                // await new Promise(resolve => setTimeout(resolve, 500));

                // console.log("2eme mode musique");
                // await characteristic.writeAsync(hexToBuffer(MusicMode2), true);
                // await new Promise(resolve => setTimeout(resolve, 500));

                // console.log("passage en mode couleur");
                // await characteristic.writeAsync(hexToBuffer(COLORMODE), true);


                //segmnent






                // console.log("segment");

                //  console.log("remetre en vert avant test");
                // let colortemp = "00ff00";

                // let hexBytestemp = ALL1+colortemp+ ALL2
                // let checksumtemp = getChecksum(hexBytestemp);
                //     hexBytestemp += checksumtemp;
                // await characteristic.writeAsync(hexToBuffer(hexBytestemp), true);

                // await new Promise(resolve => setTimeout(resolve, 500));


                // let segmentsMap = {
                //     1: "0100",
                //     2: "0200",
                //     3: "0400",
                //     4: "0800",

                //     5: "1000",
                //     6: "2000",
                //     7: "4000",
                //     8: "8000",

                //     9: "0001",
                //     10: "0002",
                //     11: "0004",
                //     12: "0008",

                //     13: "0010",
                //     14: "0020",
                //     15: "0040",


                // }



                // let color = "ff0000";


                // await characteristic.writeAsync(hexToBuffer(COLORMODE), true);

                // let hexBytes = "33051501"+color+"0000000000"+segmentsMap[15] +"0000000000"
                // let checksum = getChecksum(hexBytes);
                //     hexBytes += checksum;
                // await characteristic.writeAsync(hexToBuffer(hexBytes), true);







                for (let i = 0; i < 15; i++) {


                // console.log("segment");

                //  console.log("remetre en vert avant test");
                // let colortemp = "00ff00";

                // let hexBytestemp = ALL1+colortemp+ ALL2
                // let checksumtemp = getChecksum(hexBytestemp);
                //     hexBytestemp += checksumtemp;
                // await characteristic.writeAsync(hexToBuffer(hexBytestemp), true);

                // await new Promise(resolve => setTimeout(resolve, 500));


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


                    
                    


                let color = "ff0000";
                await characteristic.writeAsync(hexToBuffer(MusicMode1), true);
                await characteristic.writeAsync(hexToBuffer(MusicMode2), true);
                    
                await characteristic.writeAsync(hexToBuffer(COLORMODE), true);
                    

                let hexBytes = "33051501"+color+"0000000000"+segmentsMap[i] +"0000000000"
                let checksum = getChecksum(hexBytes);
                    hexBytes += checksum;
                await characteristic.writeAsync(hexToBuffer(hexBytes), true);


await new Promise(resolve => setTimeout(resolve, 1000));


                 color = "00ff00";
                await characteristic.writeAsync(hexToBuffer(MusicMode1), true);
                await characteristic.writeAsync(hexToBuffer(MusicMode2), true);
                    
                await characteristic.writeAsync(hexToBuffer(COLORMODE), true);
                    

                 hexBytes = "33051501"+color+"0000000000"+segmentsMap[i] +"0000000000"
                 checksum = getChecksum(hexBytes);
                    hexBytes += checksum;
                await characteristic.writeAsync(hexToBuffer(hexBytes), true);



await new Promise(resolve => setTimeout(resolve, 1000));






                }

                // // full
                //  console.log("tout en rouge");
                // let color = "00ff00";

                // let hexBytes = ALL1+color+ ALL2
                // let checksum = getChecksum(hexBytes);
                //     hexBytes += checksum;
                // await characteristic.writeAsync(hexToBuffer(hexBytes), true);
                


                // await new Promise((resolve) => setTimeout(resolve, 2000)); // Petite pause

                // // Tester les couleurs
                // for (let color of COLORS) {
                //     console.log(`🎨 Changer la couleur en ${color}...`);
                //     let hexBytes = `33051501${color}0000000000ff7f0000000000`;
                //     // Calculer le checksum et l'ajouter à la commande
                //     let checksum = getChecksum(hexBytes);
                //     hexBytes += checksum;
                //     await characteristic.writeAsync(hexToBuffer(hexBytes), true);
                //     await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes entre chaque couleur
                // }











                // Éteindre la LED après le test
                // console.log("❌ Extinction de la LED...");
                // await characteristic.writeAsync(hexToBuffer(TURN_OFF), true);
                // console.log("LED éteinte.");

            } catch (err) {
                console.log("Erreur de connexion ou de communication avec la LED", err);
            }
        }
    });
}

testColors();
