import * as vscode from 'vscode';
import type { Configuration } from '../types';

export function getConfiguration(): Configuration {
	const config = vscode.workspace.getConfiguration('paths-le');

	return Object.freeze({
		copyToClipboardEnabled: readBoolean(
			config,
			'copyToClipboardEnabled',
			false,
		),
		dedupeEnabled: readBoolean(config, 'dedupeEnabled', false),
		notificationsLevel: readNotificationLevel(config),
		postProcessOpenInNewFile: readBoolean(
			config,
			'postProcess.openInNewFile',
			false,
		),
		openResultsSideBySide: readBoolean(config, 'openResultsSideBySide', false),
		safetyEnabled: readBoolean(config, 'safety.enabled', true),
		safetyFileSizeWarnBytes: readNumber(
			config,
			'safety.fileSizeWarnBytes',
			1000000,
			1000,
		),
		safetyLargeOutputLinesThreshold: readNumber(
			config,
			'safety.largeOutputLinesThreshold',
			50000,
			100,
		),
		safetyManyDocumentsThreshold: readNumber(
			config,
			'safety.manyDocumentsThreshold',
			8,
			1,
		),
		showParseErrors: readBoolean(config, 'showParseErrors', false),
		statusBarEnabled: readBoolean(config, 'statusBar.enabled', true),
		telemetryEnabled: readBoolean(config, 'telemetryEnabled', false),
		analysisEnabled: readBoolean(config, 'analysis.enabled', true),
		analysisIncludeValidation: readBoolean(
			config,
			'analysis.includeValidation',
			true,
		),
		analysisIncludePatterns: readBoolean(
			config,
			'analysis.includePatterns',
			true,
		),
		validationEnabled: readBoolean(config, 'validation.enabled', true),
		validationCheckExistence: readBoolean(
			config,
			'validation.checkExistence',
			true,
		),
		validationCheckPermissions: readBoolean(
			config,
			'validation.checkPermissions',
			false,
		),
		performanceEnabled: readBoolean(config, 'performance.enabled', true),
		performanceMaxDuration: readNumber(
			config,
			'performance.maxDuration',
			5000,
			1000,
		),
		performanceMaxMemoryUsage: readNumber(
			config,
			'performance.maxMemoryUsage',
			104857600,
			1048576,
		),
		performanceMaxCpuUsage: readNumber(
			config,
			'performance.maxCpuUsage',
			1000000,
			100000,
		),
		performanceMinThroughput: readNumber(
			config,
			'performance.minThroughput',
			1000,
			100,
		),
		performanceMaxCacheSize: readNumber(
			config,
			'performance.maxCacheSize',
			1000,
			100,
		),
		keyboardShortcutsEnabled: readBoolean(
			config,
			'keyboard.shortcuts.enabled',
			true,
		),
		keyboardExtractShortcut: readString(
			config,
			'keyboard.extractShortcut',
			'ctrl+alt+p',
		),
		keyboardValidateShortcut: readString(
			config,
			'keyboard.validateShortcut',
			'ctrl+alt+v',
		),
		keyboardAnalyzeShortcut: readString(
			config,
			'keyboard.analyzeShortcut',
			'ctrl+alt+a',
		),
		presetsEnabled: readBoolean(config, 'presets.enabled', true),
		defaultPreset: readPreset(config),
		resolution: Object.freeze({
			resolveSymlinks: readBoolean(config, 'resolution.resolveSymlinks', false),
			resolveWorkspaceRelative: readBoolean(
				config,
				'resolution.resolveWorkspaceRelative',
				false,
			),
		}),
		validation: Object.freeze({
			enabled: readBoolean(config, 'validation.enabled', true),
			checkExistence: readBoolean(config, 'validation.checkExistence', true),
			checkPermissions: readBoolean(
				config,
				'validation.checkPermissions',
				false,
			),
		}),
	});
}

function readBoolean(
	config: vscode.WorkspaceConfiguration,
	key: string,
	defaultValue: boolean,
): boolean {
	return Boolean(config.get(key, defaultValue));
}

function readString(
	config: vscode.WorkspaceConfiguration,
	key: string,
	defaultValue: string,
): string {
	return String(config.get(key, defaultValue));
}

function readNumber(
	config: vscode.WorkspaceConfiguration,
	key: string,
	defaultValue: number,
	minValue: number,
): number {
	return Math.max(minValue, Number(config.get(key, defaultValue)));
}

function readNotificationLevel(
	config: vscode.WorkspaceConfiguration,
): 'all' | 'important' | 'silent' {
	const notifRaw = config.get(
		'notificationLevel',
		config.get('notificationsLevel', 'silent'),
	) as unknown as string;

	if (isValidNotificationLevel(notifRaw)) {
		return notifRaw;
	}

	return 'silent';
}

function readPreset(
	config: vscode.WorkspaceConfiguration,
): 'minimal' | 'balanced' | 'comprehensive' | 'performance' | 'validation' {
	const presetValue = config.get('presets.defaultPreset', 'balanced');

	if (isValidPreset(presetValue)) {
		return presetValue as
			| 'minimal'
			| 'balanced'
			| 'comprehensive'
			| 'performance'
			| 'validation';
	}

	return 'balanced';
}

export type NotificationLevel = 'all' | 'important' | 'silent';

export function isValidNotificationLevel(v: unknown): v is NotificationLevel {
	return v === 'all' || v === 'important' || v === 'silent';
}

export type PresetType =
	| 'minimal'
	| 'balanced'
	| 'comprehensive'
	| 'performance'
	| 'validation';

export function isValidPreset(v: unknown): v is PresetType {
	return (
		v === 'minimal' ||
		v === 'balanced' ||
		v === 'comprehensive' ||
		v === 'performance' ||
		v === 'validation'
	);
}
