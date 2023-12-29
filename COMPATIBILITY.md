# Player compatibility

### Legend
- Perfect: Works flawlessly
- Working: Works, but additional work is needed OR caveats apply.
- Detected: Sunamu detects it, but it doesn't work.
- Not working: Sunamu cannot detect it.

|Name|Status|Comments|
|-|-|-|
|Spotify|Perfect|They fixed their shit recently! Yay!|
|VLC|Perfect||
|Strawberry|Perfect||
|elementary Music|Perfect|Reported by @KorbsStudio|
|Rhythmbox|Perfect|Reported by @KorbsStudio|
|Spot|Perfect|Reported by @KorbsStudio|
|Clementine|Perfect|Reported by @KorbsStudio|
|Tauon Music Box|Perfect|Reported by @KorbsStudio|
|Pithos|Perfect|Reported by @KorbsStudio|
|Sonixd|Perfect||
|GNOME Music|Working|Cover arts are not shown "at first try". Possibly, the `PropertiesChanged` event is not handled well enough.|
|QMMP|Working|Please enable the MPRIS plugin|
|Spotifyd|Working|While the MPRIS2 implementation is kinda okay, they still need to raise the appropriate D-Bus `PropertiesChanged` event. See [their issue tracker](https://github.com/Spotifyd/spotifyd/issues/457).|
|Spotify-Qt|Working|The developer has an issue ticket detailing some of the caveats [here](https://github.com/kraxarn/spotify-qt/issues/4).
|MPV|Working|With the [mpv-mpris](https://github.com/hoyon/mpv-mpris) plugin|
|Plasma Browser Integration|Working|It all depends on the website, really|
|Lollypop|Detected|It doesn't implement the `PropertiesChanged` signal|
|Amarok|Detected|Seems to not report the song information; Reported by @KorbsStudio|
|Amberol|Detected|Non-compliant MPRIS2 implementation. Sunamu cannot support players not reporting `mpris:trackId`|
