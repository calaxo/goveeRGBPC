# goveeRGBPC

I created this repository to showcase my work on controlling my Govee RGB LED strip (model: H618F) using various software solutions:

- **OpenRGB/Artemis/Aurora**: Unfortunately, I was not successful with these.
- **SignalRGB**: I had to create a relay between the SignalRGB UDP stream and the Govee controller using a messy piece of code (index2). This was necessary because I couldn't import the npm package `@abandonware/noble`, which is needed for Bluetooth communication. With the majority of Govee LED strips, you can only control the LED segments one by one through the official app, which uses AWS to communicate with the strip (even on the same local network). Currently, in SignalRGB, you can only control the entire LED strip, except for DreamView or Razer-compatible strips.

Please note that this code only works with the H618F model; for other models, the commands may differ.

SignalRGB, please open an issue if this repository bothers you or if you need help integrating it with better code in your app.

## How it works

```
SignalRGB ──(UDP JSON, 127.0.0.1:4003)──► UDPserv/index.js ──(Bluetooth LE)──► Govee H618F
```

- `signalRGB/Govee.js` is a modified SignalRGB Govee plugin that sends the colors of the 15 segments
  to a local UDP port instead of the Govee cloud/LAN API.
- `UDPserv/index.js` listens on UDP port `4003`, connects to the strip over Bluetooth LE
  (`@abandonware/noble`) and writes one command per changed segment (or one command for the whole
  strip when more than 80 % of the segments share the same color).

## Installation

Requirements: Node.js 18+, a Bluetooth LE adapter supported by
[noble](https://github.com/abandonware/noble), and SignalRGB.

```bash
cd UDPserv
npm install
cp .env.example .env   # then set the Bluetooth MAC address of your strip
npm start
```

Then copy `signalRGB/Govee.js` into the SignalRGB plugin folder
(`Documents\WhirlwindFX\Plugins`) and restart SignalRGB.

`npm run test-send` (`UDPserv/testsender.js`) sends a test frame to the relay without SignalRGB.

### Configuration

| Variable | Description |
|---|---|
| `MACBluetooth` | Bluetooth MAC address of the Govee controller (`xx:xx:xx:xx:xx:xx`), read from `UDPserv/.env` |

`UDPserv/bluetoothonly.js` and `UDPserv/other.js` are standalone Bluetooth test scripts: set the
`LED_MAC_ADDRESS` constant at the top of the file before running them.



Use this code carefully. While it does not damage my LED strip, I cannot guarantee that there are no risks involved.

This project is based on the following repositories:

- [RGB-PC](https://github.com/ib0b/RGB-PC)
- [Govee-H6127-Reverse-Engineering](https://github.com/BeauJBurroughs/Govee-H6127-Reverse-Engineering)
- [Govee-Reverse-Engineering](https://github.com/egold555/Govee-Reverse-Engineering)

## A Message to Govee

> In the U.S., Section 103(f) of the Digital Millennium Copyright Act (DMCA) [(17 USC § 1201 (f) - Reverse Engineering)](https://www.law.cornell.edu/uscode/text/17/1201) specifically states that it is legal to reverse engineer and circumvent protections to achieve interoperability between computer programs (such as information transfer between applications). Interoperability is defined in paragraph 4 of Section 103(f).
>
> It is also often lawful to reverse-engineer an artifact or process as long as it is obtained legitimately. If the software is patented, it does not necessarily need to be reverse-engineered, as patents require a public disclosure of the invention. It should be noted that just because a piece of software is patented, that does not mean the entire thing is patented; there may be parts that remain undisclosed.

If @Govee would like me to take this down, please open an issue on this repository.

## License

[MIT](LICENSE) © calaxo: you can reuse, modify and redistribute this code, including commercially,
as long as you keep the copyright and license notice. A link back to this repository is appreciated.

`signalRGB/Govee.js` is derived from the Govee plugin published by WhirlwindFX for SignalRGB
(<https://gitlab.com/signalrgb/Govee>); the original code remains the property of its authors.
This project is not affiliated with Govee or WhirlwindFX.
