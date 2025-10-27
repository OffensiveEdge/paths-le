/**
 * Mock VS Code API for testing
 */

export interface UriInterface {
	readonly scheme: string;
	readonly authority: string;
	readonly path: string;
	readonly query: string;
	readonly fragment: string;
	readonly fsPath: string;
	with(change: {
		scheme?: string;
		authority?: string;
		path?: string;
		query?: string;
		fragment?: string;
	}): Uri;
	toString(skipEncoding?: boolean): string;
	toJSON(): any;
}

export interface WorkspaceFolder {
	readonly uri: Uri;
	readonly name: string;
	readonly index: number;
}

export const workspace = {
	workspaceFolders: undefined as WorkspaceFolder[] | undefined,
	getWorkspaceFolder: (_uri: Uri) => undefined as WorkspaceFolder | undefined,
	fs: {
		readFile: async (_uri: Uri) => new Uint8Array(),
		writeFile: async (_uri: Uri, _content: Uint8Array) => {},
		stat: async (_uri: Uri) => ({ type: 1, ctime: 0, mtime: 0, size: 0 }),
	},
};

export class Uri {
	scheme: string;
	authority: string;
	path: string;
	query: string;
	fragment: string;

	constructor(
		scheme: string,
		authority: string,
		path: string,
		query: string,
		fragment: string,
	) {
		this.scheme = scheme;
		this.authority = authority;
		this.path = path;
		this.query = query;
		this.fragment = fragment;
	}

	get fsPath(): string {
		return this.path;
	}

	with(change: {
		scheme?: string;
		authority?: string;
		path?: string;
		query?: string;
		fragment?: string;
	}): Uri {
		return new Uri(
			change.scheme ?? this.scheme,
			change.authority ?? this.authority,
			change.path ?? this.path,
			change.query ?? this.query,
			change.fragment ?? this.fragment,
		);
	}

	toString(_skipEncoding?: boolean): string {
		return `${this.scheme}://${this.authority}${this.path}`;
	}

	toJSON(): any {
		return {
			scheme: this.scheme,
			authority: this.authority,
			path: this.path,
			query: this.query,
			fragment: this.fragment,
		};
	}

	static file(path: string): Uri {
		return new Uri('file', '', path, '', '');
	}

	static parse(value: string): Uri {
		const match = value.match(/^(\w+):\/\/([^/]*)(.*)$/);
		if (match?.[1] && match[2] && match[3]) {
			return new Uri(match[1], match[2], match[3], '', '');
		}
		return new Uri('file', '', value, '', '');
	}
}

export const FileType = {
	Unknown: 0,
	File: 1,
	Directory: 2,
	SymbolicLink: 64,
};
