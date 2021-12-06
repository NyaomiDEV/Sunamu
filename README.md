<img alt="Logo" src="assets/icon.svg" width="128px" height="128px" align="left"/>

# Sunamu (スナム)
Show your currently playing song in a stylish way!

<div style="display: flex; justify-items: space-between; flex-wrap: wrap; width: 100%">
<img alt="Lyrics preview" src="assets/preview_lyrics.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Browser preview" src="assets/preview_browser.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Widget preview" src="assets/preview_widget.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="OBS source preview" src="assets/preview_obs.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Like its father, it can play Little Talks" src="assets/preview_widget_2.png" style="width: 45%; height: auto; margin: 2%" />
<img alt="Hey!" src="assets/preview_widget_3.png" style="width: 45%; height: auto; margin: 2%" />

</div>

## OwO wats dis?

Sunamu (pronounced as it is written) is a fancy music controller whose only purpose is to look as fancy as possible on secondary displays.

_It effectively is the WAY TOO COMPLEX successor of MPRISLyrics, a project I made back when synchronized lyrics on Linux was a niche thing to have._

It only supports Linux for now. macOS and Windows support are not planned. Pull request, someone?

## Features

- Display what you are playing in your TV, secondary display, or (heck) around the entire house!
- Get lyrics for your songs!
- Get a _GOOD_ Discord Rich Presence, finally!*
- Bragging rights for your particular taste in music!**

  *To be _GOOD_ you need to get yourself a Spotify Client ID and Client Secret and link Sunamu to them; but it looks nice regardless

  **No responsibility is taken from the Sunamu devs and contributors if you have bad taste in music

## Installation

### Every Linux distro

Get the latest release from the [Releases](https://github.com/AryToNeX/Sunamu/releases/latest) section. The AppImage is recommended since it runs basically everywhere.

### Arch Linux

`sunamu` and `sunamu-git` are available as AUR packages. Install either of them via your AUR helper of choice.

## Configuration

Sunamu's configuration file is located in `~/.config/sunamu/config.json5`. You can use it to enable or disable features, and there are a LOT of them!

Do you want to give it a read? [Here it is!](assets/config.json5)

## Usage

Just launch it and preferably put it in fullscreen!

## How-to: Lyrics from Musixmatch

You'd have to install the official Musixmatch Desktop App on your computer. Then launch it once; login is not really required. Sunamu will automatically configure itself based on your Musixmatch Desktop installation.

## Notable observed quirks

- Spotify (official app): Their MPRIS2 implementation sucks; as such, you lose synchronized lyrics, the seekbar and the ability to seek to specific parts of a song.
- Spotify-qt: ~~The album tag is a JSON object: Since it is nonstandard MPRIS2 implementation, the dev of that project should just follow the spec. Sunamu shows it as a JSON object to show *something relevant* at all, otherwise it'd be just `[object Object]`.~~ Fixed, however other MPRIS2 quirks apply to that project, so check [their issue tracker](https://github.com/kraxarn/spotify-qt/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).
- Spotifyd: While the MPRIS2 implementation is kinda okay, they still need to raise the appropriate D-Bus `PropertyChanged` event. See [their issue tracker](https://github.com/Spotifyd/spotifyd/issues/457).

## License

See the [LICENSE](LICENSE) file.
