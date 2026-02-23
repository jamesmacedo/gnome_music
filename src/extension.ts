import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const MPRIS_IFACE = `
<node>
  <interface name="org.mpris.MediaPlayer2.Player">
    <property name="Metadata" type="a{sv}" access="read" />
    <method name="PlayPause" />
    <method name="Next" />
    <method name="Previous" />
  </interface>
</node>`;

const MprisProxy = Gio.DBusProxy.makeProxyWrapper(MPRIS_IFACE);

export default class MyMprisExtension extends Extension {

    proxy = null;
    signalId = null;

    enable() {
        // findAndConnectPlayer();
    }

    // _findAndConnectPlayer() {
    //     Gio.DBus.session.call(
    //         'org.freedesktop.DBus',
    //         '/org/freedesktop/DBus',
    //         'org.freedesktop.DBus',
    //         'ListNames',
    //         null, null, Gio.DBusCallFlags.NONE, -1, null,
    //         (conn, res) => {
    //             try {
    //                 const result = conn.call_finish(res);
    //                 const [names] = result.deepUnpack();
    //                 const mprisPlayers = names.filter(name => name.startsWith('org.mpris.MediaPlayer2.'));
    //                 
    //                 if (mprisPlayers.length === 0) {
    //                     console.log('Nenhum media player ativo no momento.');
    //                     return;
    //                 }
    //                 
    //                 const activePlayer = mprisPlayers[0];
    //                 console.log(`Conectando dinamicamente ao player: ${activePlayer}`);
    //                 
    //                 this.proxy = new MprisProxy(
    //                     Gio.DBus.session,
    //                     activePlayer,
    //                     '/org/mpris/MediaPlayer2',
    //                     (proxy, error) => {
    //                         if (error) {
    //                             console.error(`Erro: ${error.message}`);
    //                             return;
    //                         }
    //                         
    //                         this._logCurrentSong(proxy.Metadata);
    //
    //                         this.signalId = proxy.connect('g-properties-changed', (proxy, changed, invalidated) => {
    //                             // changed é um GLib.Variant contendo as propriedades que foram alteradas
    //                             const changedProps = changed.deepUnpack();
    //                             
    //                             // Verifica se a propriedade Metadata (que contém a música) foi atualizada
    //                             if (changedProps.Metadata) {
    //                                 this._logCurrentSong(changedProps.Metadata);
    //                             }
    //                         });
    //                     }
    //                 );
    //             } catch (e) {
    //                 console.error(`Erro: ${e.message}`);
    //             }
    //         }
    //     );
    // }

    // _logCurrentSong(metadataVariant) {
    //     if (!metadataVariant) return;
    //     
    //     const metadata = metadataVariant instanceof GLib.Variant ? metadataVariant.deepUnpack() : metadataVariant;
    //     
    //     if (metadata['xesam:title']) {
    //         const title = metadata['xesam:title'] instanceof GLib.Variant ? metadata['xesam:title'].unpack() : metadata['xesam:title'];
    //         const artist = metadata['xesam:artist'] ? (metadata['xesam:artist'] instanceof GLib.Variant ? metadata['xesam:artist'].deepUnpack()[0] : metadata['xesam:artist'][0]) : 'Artista Desconhecido';
    //         
    //         console.log(`🎵 Tocando agora: ${title} - ${artist}`);
    //     }
    // }

    disable() {
        if (this.proxy && this.signalId) {
            this.proxy.disconnect(this.signalId);
        }
        this.proxy = null;
        this.signalId = null;
    }
}
