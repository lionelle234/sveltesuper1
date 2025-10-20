
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/adm" | "/login-client" | "/login" | "/profile" | "/signup-client" | "/signup";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/adm": Record<string, never>;
			"/login-client": Record<string, never>;
			"/login": Record<string, never>;
			"/profile": Record<string, never>;
			"/signup-client": Record<string, never>;
			"/signup": Record<string, never>
		};
		Pathname(): "/" | "/adm" | "/adm/" | "/login-client" | "/login-client/" | "/login" | "/login/" | "/profile" | "/profile/" | "/signup-client" | "/signup-client/" | "/signup" | "/signup/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}