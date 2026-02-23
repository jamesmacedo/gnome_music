import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class PilulaExtension {
    constructor() {
        this._widget = null;
    }

    enable() {
        this._widget = new St.Label({
            text: 'Texto da Pílula',
            style_class: 'pilula-widget',
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
    }
}
