const Main = imports.ui.main;
const Volume = imports.ui.status.volume;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

function init() {}

function showLabel(percentage) {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;
	volumeIndicator._percentageLabel.text = percentage + '%';
}

function updateVolume() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;
	let percent = 0;
	let muted;
	if (volumeIndicator._volumeMenu._output.stream != null) {
		muted = volumeIndicator._volumeMenu._output._stream.is_muted;
	} else {
		muted = true;
		percent = '?'
	}

	if (!muted) {
		let volume = volumeIndicator._volumeMenu._output.stream.volume;
		let virtMax = volumeIndicator._volumeMenu._control.get_vol_max_norm();
		percent = Math.round(volume / virtMax * 100);
	}

	showLabel(percent);
}

let SIGNAL_ID;

function enable() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;
	
	
	volumeIndicator._percentageLabel = new St.Label({ y_expand: true,
											y_align: Clutter.ActorAlign.CENTER });
	volumeIndicator.indicators.add(volumeIndicator._percentageLabel, { expand: true, y_fill: true });
//	volumeIndicator.indicators.add_style_class_name('power-status');

	updateVolume();
	
	SIGNAL_ID = volumeIndicator._volumeMenu._output.connect('stream-updated', updateVolume);
}

function disable() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;
	volumeIndicator._volumeMenu._output.disconnect(SIGNAL_ID);
	volumeIndicator._percentageLabel.destroy();
}



