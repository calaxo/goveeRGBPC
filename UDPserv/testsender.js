const dgram = require("dgram");

const PORT = 4003; // Port du serveur
const HOST = "127.0.0.1"; // Adresse du serveur (localhost dans ce cas)

const client = dgram.createSocket("udp4");

// Exemple de données de couleur (RGB) pour 15 segments
const colors = [
    0, 255, 0,   // Segment 1
    0, 0, 255,    // Segment 2
    255, 0, 0,    // Segment 3
    0, 255, 0,   // Segment 4
    0, 0, 255,     // Segment 5
    255, 0, 6,   // Segment 6
    255, 0, 6,   // Segment 7
    0, 255, 0,   // Segment 8
    232, 0, 6,   // Segment 9
    232, 0, 6,   // Segment 10
    0, 255, 0,   // Segment 11
    255, 0, 0,   // Segment 12
    0, 255, 0,   // Segment 13
    0, 0, 255,    // Segment 14
    255, 255, 0     // Segment 15
];

// Création du message JSON à envoyer
const message = JSON.stringify({
    msg: {
        cmd: "colorwc",
        data: {
            color: colors
        }
    }
});

// Envoi du message au serveur
client.send(message, PORT, HOST, (err) => {
    if (err) {
        console.error("Erreur lors de l'envoi du message:", err);
    } else {
        console.log(`Message envoyé au serveur UDP: ${message}`);
    }
    client.close(); // Fermer le client après l'envoi
});
