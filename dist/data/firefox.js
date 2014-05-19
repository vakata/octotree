var data = require('sdk/self').data;
require('sdk/page-mod').PageMod({
	include: '*.github.com',
	contentScriptFile: data.url('octotree-vakata.js'),
	contentStyleFile: data.url('octotree-vakata.css'),
	contentScriptWhen: 'start'
});