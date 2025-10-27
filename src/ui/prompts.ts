import * as vscode from 'vscode';

/**
 * User input prompts and dialogs
 */

export interface PromptOptions {
	readonly title?: string;
	readonly placeholder?: string;
	readonly value?: string;
	readonly validateInput?: (value: string) => string | undefined;
}

export interface QuickPickOptions {
	readonly title?: string;
	readonly placeholder?: string;
	readonly canPickMany?: boolean;
	readonly ignoreFocusOut?: boolean;
}

export async function showInputBox(
	message: string,
	options: PromptOptions = {},
): Promise<string | undefined> {
	const inputBoxOptions: vscode.InputBoxOptions = {
		prompt: message,
		ignoreFocusOut: true,
		...(options.title && { title: options.title }),
		...(options.placeholder && { placeHolder: options.placeholder }),
		...(options.value && { value: options.value }),
		...(options.validateInput && { validateInput: options.validateInput }),
	};

	return vscode.window.showInputBox(inputBoxOptions);
}

export async function showQuickPick<T extends vscode.QuickPickItem>(
	items: readonly T[],
	options: QuickPickOptions = {},
): Promise<T | readonly T[] | undefined> {
	const quickPickOptions: vscode.QuickPickOptions = {
		...(options.title && { title: options.title }),
		...(options.placeholder && { placeHolder: options.placeholder }),
		...(options.canPickMany && { canPickMany: options.canPickMany }),
		...(options.ignoreFocusOut && { ignoreFocusOut: options.ignoreFocusOut }),
	};

	return vscode.window.showQuickPick(items, quickPickOptions);
}

export async function showConfirmation(
	message: string,
	detail?: string,
	modal: boolean = false,
): Promise<boolean> {
	const messageOptions: vscode.MessageOptions = {
		modal,
		...(detail && { detail }),
	};

	const result = await vscode.window.showWarningMessage(
		message,
		messageOptions,
		'Yes',
		'No',
	);

	return result === 'Yes';
}

export async function showInfo(
	message: string,
	...items: string[]
): Promise<string | undefined> {
	return await vscode.window.showInformationMessage(message, ...items);
}

export async function showWarning(
	message: string,
	...items: string[]
): Promise<string | undefined> {
	return await vscode.window.showWarningMessage(message, ...items);
}

export async function showError(
	message: string,
	...items: string[]
): Promise<string | undefined> {
	return await vscode.window.showErrorMessage(message, ...items);
}

export async function showProgress<T>(
	title: string,
	task: (
		progress: vscode.Progress<{ message?: string; increment?: number }>,
		token: vscode.CancellationToken,
	) => Promise<T>,
): Promise<T> {
	return await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title,
			cancellable: true,
		},
		task,
	);
}

export async function showSaveDialog(
	title: string = 'Save File',
	defaultUri?: vscode.Uri,
	filters?: { [name: string]: string[] },
): Promise<vscode.Uri | undefined> {
	const options: vscode.SaveDialogOptions = {
		title,
		...(defaultUri && { defaultUri }),
		...(filters && { filters }),
	};

	return vscode.window.showSaveDialog(options);
}

export async function showOpenDialog(
	title: string = 'Open File',
	canSelectMany: boolean = false,
	filters?: { [name: string]: string[] },
): Promise<readonly vscode.Uri[] | undefined> {
	const options: vscode.OpenDialogOptions = {
		title,
		canSelectMany,
		...(filters && { filters }),
	};

	return vscode.window.showOpenDialog(options);
}

export async function showFolderPicker(
	title: string = 'Select Folder',
): Promise<vscode.Uri | undefined> {
	const result = await vscode.window.showOpenDialog({
		title,
		canSelectMany: false,
		canSelectFolders: true,
		canSelectFiles: false,
	});

	return result?.[0];
}

export function createQuickPickItem(
	label: string,
	description?: string,
	detail?: string,
): vscode.QuickPickItem {
	return {
		label,
		...(description && { description }),
		...(detail && { detail }),
	};
}

export function validateFilePath(value: string): string | undefined {
	if (!value || value.trim().length === 0) {
		return 'Path cannot be empty';
	}

	const invalidChars = /[<>:"|?*]/;
	if (invalidChars.test(value)) {
		return 'Path contains invalid characters';
	}

	const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
	if (reservedNames.test(value)) {
		return 'Path uses a reserved name';
	}

	return undefined;
}

export function validateNumber(
	value: string,
	min?: number,
	max?: number,
): string | undefined {
	const num = Number(value);

	if (Number.isNaN(num)) {
		return 'Please enter a valid number';
	}

	if (min !== undefined && num < min) {
		return `Value must be at least ${min}`;
	}

	if (max !== undefined && num > max) {
		return `Value must be at most ${max}`;
	}

	return undefined;
}

export function validateUrl(value: string): string | undefined {
	if (!value || value.trim().length === 0) {
		return 'URL cannot be empty';
	}

	try {
		new URL(value);
		return undefined;
	} catch {
		return 'Please enter a valid URL';
	}
}
