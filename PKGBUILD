# Maintainer: Naomi Calabretta <arytonex.pw>

pkgname=sunamu

_pkgver=v1.0.6
pkgver=${_pkgver#v}
pkgrel=1

pkgdesc="Show your currently playing song in a stylish way!"
url="https://github.com/AryToNeX/Sunamu"
license=('MPL-2.0')

arch=('x86_64')

conflicts=(${pkgname}-appimage)
depends=(c-ares ffmpeg gtk3 http-parser libevent libvpx libxslt libxss minizip nss re2 snappy libnotify libappindicator-gtk3)

_filename=${pkgname}-${pkgver}.pacman
source=("$url/releases/download/${_pkgver}/${_filename}")
noextract=("${_filename}")

md5sums=('92224dc1353c7137066080bb27f921ca')

options=(!strip)

package() {
  tar -xJv -C "${pkgdir}" -f "${srcdir}/${_filename}" usr opt
  mkdir -p "$pkgdir/usr/bin"
  ln -s "/opt/Sunamu/Sunamu" "$pkgdir/usr/bin/sunamu"
}
