<img alt="Logo" src="assets/icon.svg" width="128px" height="128px" align="left"/>

# Sunamu (スナム)
Show your currently playing song in a stylish way!

![Preview](assets/preview_control.png)
![Preview](assets/preview_lyrics.png)

## OwO wats dis?

Sunamu (pronounced as it is written) is a fancy music controller whose only purpose is to look as fancy as possible on secondary displays.

It only supports Linux for now. macOS and Windows support are not planned.

## Features

- Display what you are playing in your TV, secondary display, or (heck) around the entire house!
- Get lyrics for your songs!
- Bragging rights for your particular taste in music!*

  *No responsibility is taken from the Sunamu devs and contributors if you have bad taste in music

## Installation

### Every Linux distro

Get the latest release from the [Releases](https://github.com/AryToNeX/Sunamu/releases/latest) section. The AppImage is recommended since it runs basically everywhere.

### Arch Linux

`sunamu` and `sunamu-git` are available as AUR packages. Install either of them via your AUR helper of choice.

## Configuration

Sunamu's configuration file is located in `~/.config/sunamu/config.json5`. You can use it to enable or disable features.

Quick preview*:
```js
{
	// Specify your Last.FM username here to get the fancy play count in the details section
	"lfmUsername": "",
	// Specify your Spotify Developer Client ID and Secret here to get the Spotify URL for the playing tracks
	"spotify": {
		"clientID": "",
		"clientSecret": ""
	}
}
```

*It might be outdated easily! Please check [the actual config file](assets/config.json5) instead.

## Usage

Just launch it and preferably put it in fullscreen!

## How-to: Lyrics from Musixmatch

You'd have to install the official Musixmatch Desktop App on your computer. Then launch it once; login is not really required. Sunamu will automatically configure itself based on your Musixmatch Desktop installation.

## Notable observed quirks

- Spotify (official app): Their MPRIS2 implementation sucks; as such, you lose synchronized lyrics, the seekbar and the ability to seek to specific parts of a song.
- Spotify-qt: The album tag is a JSON object: Since it is nonstandard MPRIS2 implementation, the dev of that project should just follow the spec. Sunamu shows it as a JSON object to show *something relevant* at all, otherwise it'd be just `[object Object]`.
- Spotifyd: While the MPRIS2 implementation is kinda okay, they still need to raise the appropriate D-Bus `PropertyChanged` event. See [their issue tracker](https://github.com/Spotifyd/spotifyd/issues/457).

## License

See the [LICENSE](LICENSE) file.
