# Player compatibility

### Legend
- Perfect: Works flawlessly
- Working: Works, but additional work is needed OR caveats apply.
- Detected: Sunamu detects it, but it doesn't work.
- Not working: Sunamu cannot detect it.

## On Linux (MPRIS2 backend)

|Name|Status|Comments|
|-|-|-|
|VLC|Perfect||
|Strawberry|Perfect||
|elementary Music|Perfect|Reported by @KorbsStudio|
|Rhythmbox|Perfect|Reported by @KorbsStudio|
|Spot|Perfect|Reported by @KorbsStudio|
|Clementine|Perfect|Reported by @KorbsStudio|
|Tauon Music Box|Perfect|Reported by @KorbsStudio|
|Pithos|Perfect|Reported by @KorbsStudio|
|QMMP|Working|Please enable the MPRIS plugin|
|GNOME Music|Working|Doesn't seem to show cover arts properly. Reported by @KorbsStudio|
|Spotify|Working|Seekbar, current position and synchronized lyrics are not working|
|Spotifyd|Working|While the MPRIS2 implementation is kinda okay, they still need to raise the appropriate D-Bus `PropertyChanged` event. See [their issue tracker](https://github.com/Spotifyd/spotifyd/issues/457).|
|Spotify-Qt|Working|The developer has an issue ticket detailing some of the caveats [here](https://github.com/kraxarn/spotify-qt/issues/4).
|Sonixd|Working|Seekbar, current position and synchronized lyrics are not working|
|MPV|Working|With the [mpv-mpris](https://github.com/hoyon/mpv-mpris) plugin|
|Plasma Browser Integration|Working|It all depends on the website, really|
|Lollypop|Detected|It doesn't implement the `MetadataChanged` signal|
|Amarok|Detected|Seems to not report the song information; Reported by @KorbsStudio|

## On Windows (SystemMediaControls -> WinPlayer backend)

|Name|Status|Comments|
|-|-|-|
|Spotify|Perfect||
|Groove Music|Working|Seekbar doesn't work|
|foobar2000|Working|Seekbar, current position and synchronized lyrics are not working. Using [foo_mediacontrol](https://github.com/Hual/foo_mediacontrol)|
|AIMP|Working|Seekbar, current position and synchronized lyrics are not working. Using [Windows 10 Media Control](https://www.aimp.ru/?do=catalog&rec_id=1097)|
