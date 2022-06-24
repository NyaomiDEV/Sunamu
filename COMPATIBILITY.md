# Player compatibility

### Legend
- Perfect: Works flawlessly
- Working: Works, but additional work is needed OR caveats apply.
- Detected: Sunamu detects it, but it doesn't work.
- Not working: Sunamu cannot detect it.

## On Linux (MPRIS2 backend)

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

## On Windows (GlobalSystemMediaTransportControlsSession -> WinPlayer backend)

|Name|Status|Comments|
|-|-|-|
|Spotify|Perfect||
|Sonixd|Working|Seekbar, current position and synchronized lyrics are not working. Displays as `org.erb.sonixd`.|
|Groove Music|Working|Seekbar doesn't work|
|foobar2000|Working|Seekbar, current position and synchronized lyrics are not working. Using [foo_mediacontrol](https://github.com/Hual/foo_mediacontrol)|
|AIMP|Working|Seekbar, current position and synchronized lyrics are not working. Using [Windows 10 Media Control](https://www.aimp.ru/?do=catalog&rec_id=1097)|
|MusicBee|Working|Seekbar, current position and synchronized lyrics are not working. Using [Windows 10 Media Control Overlay](https://getmusicbee.com/addons/plugins/98/windows-10-media-control-overlay/)|
|Microsoft Edge|Working|Seekbar, current position and synchronized lyrics are not working. Displays as `MSEdge`.|
|Google Chrome|Working|Seekbar, current position and synchronized lyrics are not working.|
|VLC UWP|Working|Seekbar, current position and synchronized lyrics are not working.|
|iTunes|Not working|It doesn't expose itself through the GlobalSystemMediaTransportControlsSession API.|
|VLC Classic|Not working|It doesn't expose itself through the GlobalSystemMediaTransportControlsSession API.|
