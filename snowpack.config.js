const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development' || process.env.NODE_ENV == undefined;

let mount;
if (production) {
	mount = {
		'source/frontend': '/',
	};
} else if (development) {
	mount = {
		'content': { url: '/', static: true, resolve: false },
		'source/frontend': '/',
	};
}

module.exports = {
	mount,
	routes: [
		{ match: 'routes', src: '/api/(.*)', dest: 'http://localhost:4000/api/$1' },
		{ match: 'routes', src: '/login', dest: 'http://localhost:4000/login' },
		{ match: 'routes', src: '/export', dest: 'http://localhost:4000/export' },
		{ match: 'all', src: '.*', dest: '/index.html' },
	],
	plugins: [
		['@snowpack/plugin-build-script', { cmd: 'postcss', input: ['.css'], output: ['.css'] }],
		// ['@snowpack/plugin-optimize', {}], // can not enable this as in combination with the webpack plugin errors __SNOWPACK__ENV
		// ['@snowpack/plugin-webpack', {}],
	],
	devOptions: {
		out: 'build/frontend',
		hmrErrorOverlay: false,
	},
	buildOptions: {
		clean: true,
		metaUrlPath: '__meta__',
	},
};
