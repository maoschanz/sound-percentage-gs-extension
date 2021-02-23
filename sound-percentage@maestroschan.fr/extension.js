// sound-percentage@maestroschan.fr/extension.js
// GPL v3
// Copyright Romain F. T.

const { Clutter, St } = imports.gi;
const Main = imports.ui.main;
const Volume = imports.ui.status.volume;

const ShellVersion = imports.misc.config.PACKAGE_VERSION;
let PRIMARY_SIGNAL_ID, INPUT_SIGNAL_ID, INPUT_VISIBLE_SIGNAL_ID;

function init() {}

//------------------------------------------------------------------------------

function showLabel(outputPercentage, inputPercentage) {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;

	volumeIndicator._outputPercentageLabel.text = outputPercentage;
	volumeIndicator._inputPercentageLabel.text = inputPercentage;
}

function updateVolume() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;

	let outputPercent = 0, inputPercent = 0;
	let virtMax, outputMuted, outputVolume, inputMuted, inputVolume;

	try {
		outputMuted = volumeIndicator._volumeMenu._output._stream.is_muted;
	} catch (e) {
		outputMuted = true;
		outputPercent = '?';
	}

	try {
		inputMuted = volumeIndicator._volumeMenu._input._stream.is_muted;
	} catch (e) {
		inputMuted = true;
		inputPercent = '?';
	}

	try {
		virtMax = volumeIndicator._volumeMenu._control.get_vol_max_norm();
	} catch (e) {
		outputMuted = true;
		inputMuted = true;
		outputPercent = '?';
		inputPercent = '?';
	}

	if (!outputMuted) {
		let volume = volumeIndicator._volumeMenu._output.stream.volume;
		outputPercent = Math.round(volume / virtMax * 100);
	}

	if (!inputMuted) {
		let volume = volumeIndicator._volumeMenu._input.stream.volume;
		inputPercent = Math.round(volume / virtMax * 100);
	}

	outputPercent += '%';
	inputPercent += '%';
	if (!volumeIndicator._inputIndicator.visible) {
		inputPercent = '';  // no idea how to handle this better
	}

	showLabel(outputPercent, inputPercent);
}

//------------------------------------------------------------------------------

function enable() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;

	volumeIndicator._outputPercentageLabel = new St.Label({
		y_expand: true,
		y_align: Clutter.ActorAlign.CENTER
	});
	volumeIndicator._inputPercentageLabel = new St.Label({
		y_expand: true,
		y_align: Clutter.ActorAlign.CENTER
	});

	volumeIndicator.add(volumeIndicator._outputPercentageLabel);
	volumeIndicator.set_child_at_index(volumeIndicator._outputPercentageLabel, 1);
	volumeIndicator.add(volumeIndicator._inputPercentageLabel);
	volumeIndicator.add_style_class_name('power-status');

	updateVolume();
	PRIMARY_SIGNAL_ID = volumeIndicator._volumeMenu._output.connect('stream-updated', updateVolume);
	INPUT_SIGNAL_ID = volumeIndicator._volumeMenu._input.connect('stream-updated', updateVolume);
	INPUT_VISIBLE_SIGNAL_ID = volumeIndicator._volumeMenu.connect('input-visible-changed', updateVolume);
}

function disable() {
	let volumeIndicator = Main.panel.statusArea.aggregateMenu._volume;

	volumeIndicator._volumeMenu._output.disconnect(PRIMARY_SIGNAL_ID);
	volumeIndicator._volumeMenu._input.disconnect(INPUT_SIGNAL_ID);
	volumeIndicator._volumeMenu.disconnect(INPUT_VISIBLE_SIGNAL_ID);
	volumeIndicator._outputPercentageLabel.destroy();
	volumeIndicator._inputPercentageLabel.destroy();
}

//------------------------------------------------------------------------------

