#!/usr/bin/env gjs -m

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
// Mantive o seu import do cluster, assumindo que ele suporta rodar fora do GNOME Shell
import { Cluster } from "./cluster.js"; 

class PilulaExtension {
    _signalId = null;

    constructor() {}

    enable() {
        console.log('[MPRIS Listener] Extensão ativada. A escutar o barramento D-Bus...');

        this._signalId = Gio.DBus.session.signal_subscribe(
            null,
            'org.freedesktop.DBus.Properties',
            'PropertiesChanged',
            '/org/mpris/MediaPlayer2',
            null,
            Gio.DBusSignalFlags.NONE,
            this._onPropertiesChanged.bind(this)
        );
    }

    disable() {
        if (this._signalId) {
            Gio.DBus.session.signal_unsubscribe(this._signalId);
            this._signalId = null;
            console.log('\n[MPRIS Listener] Inscrição removida. Saindo...');
        }
    }

    _onPropertiesChanged(connection, senderName, objectPath, interfaceName, signalName, parameters) {
        let [iface, changedProps, invalidatedProps] = parameters.deep_unpack();

        if (iface === 'org.mpris.MediaPlayer2.Player') {
            
            if (changedProps['PlaybackStatus']) {
                let status = changedProps['PlaybackStatus'].deep_unpack();
                console.log(`\n[MPRIS Listener] [${senderName}] Estado alterado para: ${status}`);
            }

            if (changedProps['Metadata']) {
                let metadata = changedProps['Metadata'].deep_unpack();

                // Lógica defensiva: verificar se a chave existe antes do deep_unpack()
                let artist = 'Desconhecido';
                if (metadata['xesam:artist']) {
                    let meta_artist = metadata['xesam:artist'].deep_unpack();
                    if (meta_artist && meta_artist.length > 0) {
                        artist = meta_artist.join(', ');
                    }
                }

                let title = metadata['xesam:title'] ? metadata['xesam:title'].deep_unpack() : 'Sem Título';
                let cover_url = metadata['mpris:artUrl'] ? metadata['mpris:artUrl'].deep_unpack() : null;

                console.log(`[MPRIS Listener] A tocar: ${artist} - ${title}`);

                if (cover_url) {
                    console.log(`[MPRIS Listener] Capa encontrada: ${cover_url}`);
                    
                    try {
                        const style = new Cluster(cover_url).run();
                        console.log('[MPRIS Listener] Cores geradas:', style);
                    } catch (e) {
                        console.error('[MPRIS Listener] Erro no Cluster:', e.message);
                    }
                } else {
                    console.log(`[MPRIS Listener] Sem capa disponível para esta mídia.`);
                }
            }
        }
    }
}

// =========================================================================
// INICIALIZAÇÃO STANDALONE
// =========================================================================

// 1. Instanciamos a nossa classe de teste
const app = new PilulaExtension();
app.enable();

// 2. Criamos o "ouvido" do GNOME (Main Loop)
const loop = new GLib.MainLoop(null, false);

// 3. Capturamos o Ctrl+C (SIGINT) no terminal para sair graciosamente
// No GLib, o sinal 2 corresponde ao SIGINT
GLib.unix_signal_add(GLib.PRIORITY_DEFAULT, 2, () => {
    app.disable();
    loop.quit();
    return GLib.SOURCE_REMOVE;
});

// 4. Mandamos o loop rodar. O script vai ficar "preso" aqui escutando os eventos
// até que o loop.quit() seja chamado (quando você apertar Ctrl+C).
loop.run();
