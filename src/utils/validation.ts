import * as vscode from 'vscode';
import type { Configuration, ValidationResult } from '../types';
import {
	getWorkspaceFolderForPath,
	type PathResolutionOptions,
} from './pathResolver';
import {
	detectPathType,
	isValidPath,
	resolvePathCanonical,
	validatePathFormat,
} from './pathValidation';

export async function validatePaths(
	paths: string[],
	config: Configuration,
): Promise<ValidationResult[]> {
	const results: ValidationResult[] = [];

	for (const path of paths) {
		const result = await validatePath(path, config);
		results.push(result);
	}

	return results;
}

async function validatePath(
	path: string,
	config: Configuration,
): Promise<ValidationResult> {
	const formatValidation = validatePathFormat(path);
	if (!formatValidation.isValid) {
		return buildInvalidResult(path, formatValidation.errors.join(', '));
	}

	if (!isValidPath(path)) {
		return buildInvalidResult(
			path,
			'Path contains invalid characters or reserved names',
		);
	}

	const pathType = detectPathType(path);
	if (pathType === 'url') {
		return buildValidResult(path, true);
	}

	const resolvedPath = await resolvePathIfNeeded(path, config);

	if (!config.validation?.checkExistence) {
		return buildValidResultWithResolution(path, resolvedPath, config);
	}

	return await checkPathExistence(path, resolvedPath, config);
}

function buildInvalidResult(path: string, error: string): ValidationResult {
	return Object.freeze({
		path,
		status: 'invalid',
		error,
	});
}

function buildValidResult(path: string, exists: boolean): ValidationResult {
	return Object.freeze({
		path,
		status: 'valid',
		exists,
	});
}

function buildValidResultWithResolution(
	path: string,
	resolvedPath: string,
	config: Configuration,
): ValidationResult {
	const result: ValidationResult = {
		path,
		status: 'valid',
		exists: true,
	};

	if (config.validation?.checkPermissions) {
		result.permissions = 'read-write';
	}

	if (resolvedPath !== path) {
		result.resolvedPath = resolvedPath;
	}

	return Object.freeze(result);
}

async function resolvePathIfNeeded(
	path: string,
	config: Configuration,
): Promise<string> {
	if (!config.validation?.enabled) {
		return path;
	}

	if (
		!config.resolution?.resolveSymlinks &&
		!config.resolution?.resolveWorkspaceRelative
	) {
		return path;
	}

	const workspaceFolder = getWorkspaceFolderForPath(path);
	const resolveOptions: Partial<PathResolutionOptions> = {
		resolveSymlinks: config.resolution?.resolveSymlinks ?? true,
		resolveWorkspaceRelative:
			config.resolution?.resolveWorkspaceRelative ?? true,
		...(workspaceFolder && { workspaceFolder }),
	};

	return await resolvePathCanonical(path, resolveOptions);
}

async function checkPathExistence(
	path: string,
	resolvedPath: string,
	config: Configuration,
): Promise<ValidationResult> {
	const uri = vscode.Uri.file(resolvedPath);

	await vscode.workspace.fs.stat(uri);

	const result: ValidationResult = {
		path,
		status: 'valid',
		exists: true,
	};

	if (config.validation?.checkPermissions) {
		result.permissions = 'read-write';
	}

	if (resolvedPath !== path) {
		result.resolvedPath = resolvedPath;
	}

	return Object.freeze(result);
}
