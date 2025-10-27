import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import type { Configuration } from '../types';
import { createEnhancedError, type EnhancedError } from './errorHandling';

const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export interface SafetyResult {
	readonly proceed: boolean;
	readonly message: string;
	readonly error?: EnhancedError;
	readonly warnings: readonly string[];
}

export interface SafetyCheckOptions {
	readonly showProgress?: boolean;
	readonly allowOverride?: boolean;
	readonly customThresholds?: {
		readonly fileSizeBytes?: number;
		readonly lineCount?: number;
		readonly pathCount?: number;
	};
}

export function handleSafetyChecks(
	document: vscode.TextDocument,
	config: Configuration,
	options: SafetyCheckOptions = {},
): SafetyResult {
	if (!config.safetyEnabled) {
		return Object.freeze({ proceed: true, message: '', warnings: [] });
	}

	const content = document.getText();
	const fileSizeThreshold =
		options.customThresholds?.fileSizeBytes ?? config.safetyFileSizeWarnBytes;

	if (content.length > fileSizeThreshold) {
		return buildFileSizeError(
			content.length,
			fileSizeThreshold,
			document.fileName,
		);
	}

	const warnings = collectSafetyWarnings(content, config, options);

	return Object.freeze({
		proceed: true,
		message: buildSafetyMessage(warnings),
		warnings: Object.freeze(warnings),
	});
}

function buildFileSizeError(
	fileSize: number,
	threshold: number,
	fileName: string,
): SafetyResult {
	const error = createEnhancedError(
		new Error(
			localize(
				'runtime.safety.file-size',
				'File size ({0} bytes) exceeds safety threshold ({1} bytes)',
				fileSize,
				threshold,
			),
		),
		'safety',
		{ fileSize, threshold, fileName },
		{
			recoverable: false,
			severity: 'high',
			suggestion: localize(
				'runtime.safety.file-size.suggestion',
				'Consider splitting the file or increasing the safety threshold in settings',
			),
		},
	);

	return Object.freeze({
		proceed: false,
		message: error.userMessage,
		error,
		warnings: [],
	});
}

function collectSafetyWarnings(
	content: string,
	config: Configuration,
	options: SafetyCheckOptions,
): string[] {
	const warnings: string[] = [];
	const lines = content.split('\n');
	const lineCountThreshold =
		options.customThresholds?.lineCount ??
		config.safetyLargeOutputLinesThreshold;

	if (lines.length > lineCountThreshold) {
		warnings.push(
			localize(
				'runtime.safety.line-count.warning',
				'Large file detected: {0} lines (threshold: {1})',
				lines.length,
				lineCountThreshold,
			),
		);
	}

	const estimatedPaths = estimatePathCount(content);
	if (estimatedPaths > 1000) {
		warnings.push(
			localize(
				'runtime.safety.path-count.warning',
				'Large number of paths detected: estimated {0} paths',
				estimatedPaths,
			),
		);
	}

	const complexPatterns = countComplexPatterns(content);
	if (complexPatterns > 100) {
		warnings.push(
			localize(
				'runtime.safety.complex-patterns.warning',
				'Complex patterns detected: {0} patterns',
				complexPatterns,
			),
		);
	}

	return warnings;
}

function buildSafetyMessage(warnings: string[]): string {
	if (warnings.length === 0) {
		return localize('runtime.safety.passed', 'Safety checks passed');
	}

	return localize(
		'runtime.safety.warnings',
		'Safety checks passed with {0} warnings',
		warnings.length,
	);
}

export async function handleSafetyChecksWithUserConfirmation(
	document: vscode.TextDocument,
	config: Configuration,
	options: SafetyCheckOptions = {},
): Promise<SafetyResult> {
	const result = handleSafetyChecks(document, config, options);

	if (!result.proceed && options.allowOverride) {
		const shouldContinue = await promptUserOverride(result.message);
		if (shouldContinue) {
			return Object.freeze({
				...result,
				proceed: true,
				message: localize(
					'runtime.safety.override.approved',
					'Safety override approved by user',
				),
			});
		}
	}

	return result;
}

async function promptUserOverride(message: string): Promise<boolean> {
	const override = await vscode.window.showWarningMessage(
		message,
		{
			modal: true,
			detail: localize(
				'runtime.safety.override.detail',
				'This operation may take a long time or consume significant resources. Do you want to continue?',
			),
		},
		localize('runtime.safety.override.continue', 'Continue Anyway'),
		localize('runtime.safety.override.cancel', 'Cancel'),
	);

	return (
		override === localize('runtime.safety.override.continue', 'Continue Anyway')
	);
}

function estimatePathCount(content: string): number {
	const unixPaths = (content.match(/\/[^\s"'<>|*?]+/g) ?? []).length;
	const windowsPaths = (content.match(/[A-Za-z]:\\[^\s"'<>|*?]+/g) ?? [])
		.length;
	const relativePaths = (content.match(/\.\.?\/[^\s"'<>|*?]+/g) ?? []).length;
	const quotedPaths = (content.match(/["'][^"']*["']/g) ?? []).filter(
		(path) => path.includes('/') || path.includes('\\'),
	).length;

	return unixPaths + windowsPaths + relativePaths + quotedPaths;
}

function countComplexPatterns(content: string): number {
	const nestedObjects = (content.match(/\{[^{}]*\{[^{}]*\}[^{}]*\}/g) ?? [])
		.length;
	const nestedArrays = (content.match(/\[[^[\]]*\[[^[\]]*\][^[\]]*\]/g) ?? [])
		.length;
	const regexPatterns = (content.match(/\/[^/\n]+\/[gimuy]*/g) ?? []).length;
	const templateLiterals = (content.match(/`[^`]*\$\{[^}]*\}[^`]*`/g) ?? [])
		.length;

	return nestedObjects + nestedArrays + regexPatterns + templateLiterals;
}

export function shouldCancelOperation(
	processedItems: number,
	threshold: number,
	startTime: number,
	maxTimeMs: number = 30000,
): boolean {
	const elapsedTime = Date.now() - startTime;
	return processedItems > threshold || elapsedTime > maxTimeMs;
}

export function createSafetyWarning(
	message: string,
	details: Record<string, unknown> = {},
): EnhancedError {
	return createEnhancedError(new Error(message), 'safety', details, {
		severity: 'medium',
		recoverable: true,
		suggestion: localize(
			'runtime.safety.warning.suggestion',
			'Consider adjusting safety settings or breaking down the operation',
		),
	});
}
