// sound-percentage@maestroschan.fr/extension.js
// GPL v3
// Copyright Romain F. T. 2018-2022
// Copyright Ignaz Kraft  2023-2024

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class SoundPercentageExtension {
	OUTPUT_SIGNAL_ID = undefined;
	INPUT_SIGNAL_ID = undefined;
	INPUT_STREAM_ADDED_SIGNAL_ID = undefined;
	INPUT_STREAM_REMOVED_SIGNAL_ID = undefined;
	//---------------------------------------------------------------------------
	getVolumeInput() {
		return Main.panel.statusArea.quickSettings._volumeInput;
	}
	getVolumeOutput() {
		return Main.panel.statusArea.quickSettings._volumeOutput;
	}
	updateVolume() {
		for (const indicator of [this.getVolumeOutput(), this.getVolumeInput()]) {
			let percent = '';
			let virtualMax = 0;
			let muted = false;
			let error = false;
			const IO = indicator._output || indicator._input;

			try {
				muted = IO._stream.is_muted;
			} catch (e) {
				error = true;
			}

			try {
				virtualMax = indicator._control.get_vol_max_norm();
			} catch (e) {
				error = true;
			}

			if (error) {
				percent = '?';
			} else {
				let volume = muted ? 0 : IO.stream.volume;
				percent = Math.round(volume / virtualMax * 100) + '%';
			}

			if (!indicator._indicator.visible) {
				percent = '';
			}

			indicator._percentageLabel.text = percent;
		}
	}
	//---------------------------------------------------------------------------
	connect() {
		let output = this.getVolumeOutput()._output;
		let input = this.getVolumeInput()._input;

		const self = this;
		const update = () => {self.updateVolume()};

		this.OUTPUT_SIGNAL_ID = output.connect('stream-updated', update);
		this.INPUT_SIGNAL_ID = input.connect('stream-updated', update);
		this.INPUT_STREAM_ADDED_SIGNAL_ID = input._control.connect('stream-added', update);
		this.INPUT_STREAM_REMOVED_SIGNAL_ID = input._control.connect('stream-removed', update);
	}
	disconnect() {
		let output = this.getVolumeOutput()._output;
		let input = this.getVolumeInput()._input;

		output.disconnect(this.OUTPUT_SIGNAL_ID);
		input.disconnect(this.INPUT_SIGNAL_ID);
		input._control.disconnect(this.INPUT_STREAM_ADDED_SIGNAL_ID);
		input._control.disconnect(this.INPUT_STREAM_REMOVED_SIGNAL_ID);
	}
	//---------------------------------------------------------------------------
	enable() {
		for (const indicator of [this.getVolumeOutput(), this.getVolumeInput()]) {
			indicator._percentageLabel = new St.Label({
				y_expand: true,
				y_align: Clutter.ActorAlign.CENTER
			});

			indicator.add_child(indicator._percentageLabel);
			indicator.add_style_class_name('power-status');
		}

		this.updateVolume();
		this.connect();
	}
	disable() {
		this.disconnect();
		this.getVolumeOutput()._percentageLabel.destroy();
		this.getVolumeInput()._percentageLabel.destroy();
	}
}
