<img alt="Logo" src="assets/icons/icon.svg" width="128px" height="128px" align="left"/>
<a href="https://discord.gg/cnkMUu9Z7b"><img alt="Chat on Discord" align="right" src="https://img.shields.io/discord/1002639896600645732?color=blue&label=Chat%20on%20Discord&logo=discord&logoColor=white&style=for-the-badge"></a>

# Sunamu (スナム)
Show your currently playing song in a stylish way!

## Screenshots

<div style="display: flex; justify-items: space-between; flex-wrap: wrap; width: 100%">
<img alt="Lyrics preview" src="assets/preview_lyrics.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Browser preview" src="assets/preview_browser.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Widget preview" src="assets/preview_widget.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="OBS source preview" src="assets/preview_obs.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Sunamu will never gonna give you up" src="assets/preview_widget_2.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Hey!" src="assets/preview_widget_3.png" style="width: 45%; height: auto; margin: 2%" />

</div>

## OwO wats dis?

Sunamu (pronounced as it is written) is a fancy music controller whose only purpose is to look as fancy as possible on secondary displays.

_It effectively is the WAY TOO COMPLEX successor of MPRISLyrics, a project I made back when synchronized lyrics on Linux was a niche thing to have._

## Features

- Display what you are playing in your TV, secondary display, or (heck) around the entire house!
- Get the Spotify link for every song you listen to!*
- Get lyrics for your songs!
- Get a _GOOD_ Discord Rich Presence, finally!*
- Bragging rights for your particular taste in music!**

  *This feature, or part of it, requires a Spotify Client ID and Client Secret.

  **No responsibility is taken from the Sunamu devs and contributors if you have bad taste in music

## Installation

**Sunamu only works on Linux! Do not spam the issue section regarding Windows or macOS, as it cannot be ported to those computers!**

### Linux

#### NOTE: Sunamu is very slow on development, mostly because there's hardly anything to implement that I can do (local girl needs help). Please consider this when running a tagged release, as you can easily run a months-old, or even years-old, version. Please try compiling Sunamu from this repo instead!

Get the latest release from the [Releases](https://github.com/NyaomiDEV/Sunamu/releases/latest) section.

## Configuration

Sunamu's configuration file is located in:
- Linux: Usually `~/.config/sunamu/config.json5` (`$XDG_CONFIG_HOME/sunamu/config.json5`);
- Linux Flatpak: `~/.var/app/xyz.nyaomi.sunamu/config/sunamu/config.json5` (unsupported! but you can compile it yourself);

You can use it to enable or disable features, and there are a LOT of them!

Do you want to give it a read? [Here it is!](assets/config.json5)

## Usage

Just launch it and preferably put it in fullscreen!

## Notable observed quirks

Check and contribute to the compatibility table [here](COMPATIBILITY.md).

## License

See the [LICENSE](LICENSE) file.
