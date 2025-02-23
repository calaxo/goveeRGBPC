# goveeRGBPC

I created this repository to showcase my work on controlling my Govee RGB LED strip (model: H618F) using various software solutions:

- **OpenRGB/Artemis/Aurora**: Unfortunately, I was not successful with these.
- **SignalRGB**: I had to create a relay between the SignalRGB UDP stream and the Govee controller using a messy piece of code (index2). This was necessary because I couldn't import the npm package `@abandonware/noble`, which is needed for Bluetooth communication. With the majority of Govee LED strips, you can only control the LED segments one by one through the official app, which uses AWS to communicate with the strip (even on the same local network). Currently, in SignalRGB, you can only control the entire LED strip, except for DreamView or Razer-compatible strips.

Please note that this code only works with the H618F model; for other models, the commands may differ.

Use this code carefully. While it does not damage my LED strip, I cannot guarantee that there are no risks involved.

This project is based on the following repositories:

- [RGB-PC](https://github.com/ib0b/RGB-PC)
- [Govee-H6127-Reverse-Engineering](https://github.com/BeauJBurroughs/Govee-H6127-Reverse-Engineering)
- [Govee-Reverse-Engineering](https://github.com/egold555/Govee-Reverse-Engineering)

## A Message to Govee

> In the U.S., Section 103(f) of the Digital Millennium Copyright Act (DMCA) [(17 USC § 1201 (f) - Reverse Engineering)](https://www.law.cornell.edu/uscode/text/17/1201) specifically states that it is legal to reverse engineer and circumvent protections to achieve interoperability between computer programs (such as information transfer between applications). Interoperability is defined in paragraph 4 of Section 103(f).
>
> It is also often lawful to reverse-engineer an artifact or process as long as it is obtained legitimately. If the software is patented, it does not necessarily need to be reverse-engineered, as patents require a public disclosure of the invention. It should be noted that just because a piece of software is patented, that does not mean the entire thing is patented; there may be parts that remain undisclosed.

If @Govee would like me to take this down, please contact me via email or create an issue on this repository.
