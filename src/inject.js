// fix for translate

(function($, undefined) {
	$(document).ready(function() {
		var href = null,
			hash = null,
			repo = [ null, null, null, null, null ],
			temp = [ null, null, null, null, null ],
			tree = null,
			html = null,
			tokn = window.localStorage.getItem('octotree.token'),
			detectLocationChange = function() {
				if (!repo[1] || location.href !== href || location.hash != hash) {
					href = location.href;
					hash = location.hash;
					temp = location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
					if(
						temp &&
						window.location.host.indexOf('gist.') === -1 &&
						$.inArray(temp[1], ['settings', 'orgs', 'organizations', 'site', 'blog', 'about', 'styleguide', 'showcases', 'trending', 'stars', 'dashboard', 'notifications']) === -1 && 
						$.inArray(temp[2], ['followers', 'following']) === -1 && 
						(!temp[3] || $.inArray(temp[3], ['tree', 'blob']) !== -1) && 
						!$('#parallax_wrapper').length
					) {
						html.show();
						temp[4] = $('*[data-master-branch]').data('ref') || 'master';
						if(repo[1] !== temp[1] || repo[2] !== temp[2] || repo[4] !== temp[4]) {
							repo = temp.slice();
							html[window.localStorage.getItem('octotree.visible.' + repo[1] + '.' + repo[2]) ? 'addClass' : 'removeClass']('octotree-visible');
							html.width(window.localStorage.getItem('octotree.width.' + repo[1] + '.' + repo[2]) || 250);
							html.find('h1').text(repo[1] + ' / ' + repo[2]).end().find('h2').text(repo[4]);
							tree.settings.state.key = 'octotree.' + repo[1] + '.' + repo[2];
							tree.deselect_all();
							tree.get_container().one('refresh.jstree', function (e, data) {
								data.instance.select_node(window.location.pathname.toString().replace('/' + repo[1] + '/' + repo[2] + '/', ''));
							});
							tree.refresh();
						}
						else {
							tree.deselect_all();
							tree.select_node(window.location.pathname.toString().replace('/' + repo[1] + '/' + repo[2] + '/', ''));
						}
					}
					else {
						html.hide();
					}
				}
				window.setTimeout(detectLocationChange, 200);
			};
		html = $('<nav class="octotree-sidebar octotree-visible">' +
					'<hgroup class="octotree-header">' +
						'<h1></h1>' + 
						'<h2></h2>' + 
					'</hgroup>' +
					'<form class="octotree-form">' +
						'<p class="octotree-message"></p>' +
						'<input name="token" type="text" placeholder="Paste access token here" value="'+tokn+'"></input>' +
						'<button type="submit" class="button">Save</button>' +
					'</form>' +
					'<div class="octotree-tree"></div>' +
					'<a class="octotree-toggle button"><span></span></a>' +
					'<div class="octotree-resizer"></div>' +
				'</nav>')
				.on('mousedown', '.octotree-resizer', function (e) {
					return $.vakata.dnd.start(e, { 'octotree' : true, 'x' : e.pageX, 'w' : parseInt(html.width(),10) }, false);
				})
				.on('click', '.octotree-toggle', function () {
					$(this).closest('.octotree-sidebar').toggleClass('octotree-visible');
					window.localStorage.setItem('octotree.visible.' + repo[1] + '.' + repo[2], !window.localStorage.getItem('octotree.visible.' + repo[1] + '.' + repo[2]));
				})
				.on('submit', '.octotree-form', function (e) {
					e.preventDefault();
					tokn = $(this).find('input').val();
					window.localStorage.setItem('octotree.token', tokn);
					$(this).find('.octotree-message').text('').end().hide();
					$(window).resize();
					repo = null;
				})
				.find('.octotree-tree')
					.on('changed.jstree', function (e, data) {
						if(data.event) {
							$.pjax({ 
								'url' : '/' + repo[1] + '/' + repo[2] + '/' + data.selected[0],
								'timeout' : 5000, // TODO: progress indicator (detect from github)
								'container' : $('#js-repo-pjax-container') 
							});
						}
					})
					.on('dblclick.jstree', '.jstree-open, .jstree-closed', function(e) {
						e.stopImmediatePropagation();
						tree.toggle_node(this);
					})
					.jstree({
						'core' : {
							'multiple' : false,
							'themes' : {
								'responsive' : false
							},
							'data' : function (node, cb) {
								if(node && node.id === '#' && repo[1] && repo[2]) {
									var git = new Github({ 'token' : tokn }),
										api = git.getRepo(repo[1], repo[2]), i, j, data = [], item = {}, m;
									api.getTree(encodeURIComponent(repo[4]) + '?recursive=true', function(err, tree) {
										if(err) {
											switch(err.error) {
												case 401:
													m = '<strong>Invalid token!</strong><br />The token is invalid. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create a new token and paste it in the textbox below.';
													break;
												case 404:
													m = tokn ?
														'<strong>Private or invalid repository!</strong><br />You are not allowed to access this repository.' :
														'<strong>Private or invalid repository!</strong><br />Accessing private repositories requires a GitHub access token. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create one and paste it in the textbox below.';
													break;
												default:
													m = tokn ?
														'<strong>API limit exceeded!</strong><br />Whoa, you have exceeded the API hourly limit, please create a new access token or take a break :).' :
														'<strong>API limit exceeded!</strong><br />You have exceeded the GitHub API hourly limit and need GitHub access token to make extra requests. Follow <a href="https://github.com/settings/tokens/new" target="_blank">this link</a> to create one and paste it in the textbox below.';
													break;
											}
											html.find('.octotree-message').html(m).closest('form').show();
											$(window).resize();
											cb(false);
										}
										else {
											for(i = 0, j = tree.length; i < j; i++) {
												if(tree[i].type !== 'tree' && tree[i].type !== 'blob') { continue; }
												item = {};
												item.id = tree[i].type + '/' + repo[4] + '/' + tree[i].path;
												item.text = $('<div/>').text(tree[i].path.split('/').reverse()[0]).html();
												item.parent = tree[i].path.indexOf('/') === -1 ? '#' : 'tree/' + repo[4] + '/' + tree[i].path.split('/').slice(0,-1).join('/');
												item.icon = tree[i].type;
												data.push(item);
											}
											cb(data);
										}
									});
								}
								else {
									cb(false);
								}
							}
						},
						'sort' : function (a, b) {
							var c = a.indexOf('tree') === 0,
								d = b.indexOf('tree') === 0;
							if(c && !d) { return -1; }
							if(!c && d) { return 1; }
							return this.get_text(a) > this.get_text(b) ? 1 : -1;
						},
						'state' : {
							'filter' : function (s) {
								delete s.core.selected;
								return s;
							},
							'key' : 'octotree.default'
						},
						'plugins' : [ 'sort' , 'state', 'wholerow' ]
					}).end()
				.appendTo('body');
		tree = $('.octotree-tree').jstree(true);
		$(window)
			.on('resize', function () {
				html.children('.octotree-tree').outerHeight($(window).height() - (html.children('.octotree-header').outerHeight() + (html.children('.octotree-form').is(':visible') ? html.children('.octotree-form').outerHeight() : 0)));
			})
			.resize();
		$(document).bind('dnd_move.vakata', function (e, data) {
				if(!data.data.octotree) { return; }
				html.width(data.data.w + (data.event.pageX - data.data.x));
			})
			.bind('dnd_stop.vakata', function (e, data) {
				window.localStorage.setItem('octotree.width.' + repo[1] + '.' + repo[2], html.width());
			});
		detectLocationChange();
	});
})(jQuery);