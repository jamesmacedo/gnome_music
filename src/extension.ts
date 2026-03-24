import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Cluster } from "./cluster";

import { md5 } from 'js-md5';

export default class PilulaExtension {

    _widget = null;
    _signalId = null;

    current_hash = null

    constructor() {}

    enable() {

        console.log('[MPRIS Listener] Extensão ativada. A escutar o barramento D-Bus...');

        this._signalId = Gio.DBus.session.signal_subscribe(
            null,                                 // sender: qualquer aplicação
            'org.freedesktop.DBus.Properties',    // interface do sinal
            'PropertiesChanged',                  // nome do sinal
            '/org/mpris/MediaPlayer2',            // caminho do objeto MPRIS
            null,                                 // argumento a filtrar
            Gio.DBusSignalFlags.NONE,
            this._onPropertiesChanged.bind(this)  // callback com o contexto da classe amarrado (bind)
        );

        this._widget = new St.Label({
            y_align: Clutter.ActorAlign.CENTER
        });

        Main.panel._leftBox.insert_child_at_index(this._widget, 1);
        
    }

    disable() {
        if (this._widget) {
            Main.panel._leftBox.remove_child(this._widget);
            this._widget.destroy();
            this._widget = null;
        }

        if (this._signalId) {
            Gio.DBus.session.signal_unsubscribe(this._signalId);
            this._signalId = null;
        }
    }

    _onPropertiesChanged(connection, senderName, objectPath, interfaceName, signalName, parameters) {
        let [iface, changedProps, invalidatedProps] = parameters.deep_unpack();

        if (iface === 'org.mpris.MediaPlayer2.Player') {
            
            if (changedProps['PlaybackStatus']) {
                let status = changedProps['PlaybackStatus'].deep_unpack();
                console.log(`[MPRIS Listener] [${senderName}] Estado alterado para: ${status}`);
            }

            if (changedProps['Metadata']) {
                let metadata = changedProps['Metadata'].deep_unpack();

                console.log(metadata)

                let artist = 'Desconhecido';

                let meta_artist = metadata['xesam:artist'].deep_unpack()
                if (meta_artist && meta_artist.length > 0) {
                    artist = meta_artist.join(', ');
                }

                let title = metadata['xesam:title'].deep_unpack() || 'Sem Título';
                let cover_url = metadata['mpris:artUrl'] ? metadata['mpris:artUrl'].deep_unpack() : null;

                let new_hash = md5(title + cover_url);

                if(this.current_hash != new_hash){

                    this.current_hash = new_hash


                    if(cover_url){
                        const style = new Cluster(cover_url).run();
                        this._widget.set_style(style)
                    }

                    this._widget.set_text(title)

                }
            }
        }
    }
}


