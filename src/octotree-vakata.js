// configure page (for the token & left/right & html shift (yes or no))

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
				if (!repo[1] || location.href !== href || location.hash !== hash) {
					href = location.href;
					hash = location.hash;
					temp = location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
					if(
						temp &&
						window.location.host.indexOf('gist.') === -1 &&
						$.inArray(temp[1], ['settings', 'orgs', 'organizations', 'site', 'blog', 'explore', 'about', 'styleguide', 'showcases', 'trending', 'stars', 'dashboard', 'notifications']) === -1 && 
						$.inArray(temp[2], ['followers', 'following']) === -1 && 
						(!temp[3] || $.inArray(temp[3], ['tree', 'blob']) !== -1) && 
						!$('#parallax_wrapper').length
					) {
						html.show();
						temp[4] = $('*[data-master-branch]').data('ref') || 'master';
						if(repo[1] !== temp[1] || repo[2] !== temp[2] || repo[4] !== temp[4]) {
							repo = temp.slice();
							html[parseInt(window.localStorage.getItem('octotree.visible.' + repo[1] + '.' + repo[2]), 10) ? 'addClass' : 'removeClass']('octotree-visible');
							html.width(parseInt(window.localStorage.getItem('octotree.width.' + repo[1] + '.' + repo[2]), 10) || 250);
							html.find('h1').html('<i class="octicon octicon-repo"></i>' + repo[1] + ' / ' + repo[2]).end().find('h2').html('<i class="octicon octicon-git-branch"></i>' + repo[4]);
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
							tree.open_node(window.location.pathname.toString().replace('/' + repo[1] + '/' + repo[2] + '/', ''));
						}
					}
					else {
						html.hide();
					}
				}
				window.setTimeout(detectLocationChange, 200);
			};
		html = $('<nav class="octotree-sidebar ' + (parseInt(window.localStorage.getItem('octotree.right'),10) ? 'octotree-sidebar-right' : '') + '">' +
					'<hgroup class="octotree-header">' +
						'<h1></h1>' + 
						'<h2></h2>' + 
					'</hgroup>' +
					'<form class="octotree-form">' +
						'<p class="octotree-message"></p>' +
						'<input name="token" type="text" placeholder="Paste access token here" value="'+(tokn || '')+'"></input>' +
						'<button type="submit" class="button">Save</button>' +
					'</form>' +
					'<div class="octotree-tree"></div>' +
					'<a class="octotree-toggle button"><span></span></a>' +
					'<div class="octotree-resizer"></div>' +
					'<div class="octotree-operations"><a href="#" class="octotree-change-token"><span class="octicon octicon-key"></span></a> <a href="#" class="octotree-toggle-lt"><span class="octicon octicon-code"></span></a></div>' +
				'</nav>')
				.on('mousedown', '.octotree-resizer', function (e) {
					return $.vakata.dnd.start(e, { 'octotree' : true, 'x' : e.pageX, 'w' : parseInt(html.width(),10) }, false);
				})
				.on('click', '.octotree-change-token', function (e) {
					e.preventDefault();
					html.find('.octotree-form').show();
					$(window).resize();
				})
				.on('click', '.octotree-toggle-lt', function (e) {
					e.preventDefault();
					html.toggleClass('octotree-sidebar-right');
					window.localStorage.setItem('octotree.right', html.hasClass('octotree-sidebar-right') ? 1 : 0);
				})
				.on('click', '.octotree-toggle', function (e) {
					e.preventDefault();
					html.toggleClass('octotree-visible');
					window.localStorage.setItem('octotree.visible.' + repo[1] + '.' + repo[2], html.hasClass('octotree-visible') ? 1 : 0);
				})
				.on('submit', '.octotree-form', function (e) {
					e.preventDefault();
					tokn = $(this).find('input').val();
					window.localStorage.setItem('octotree.token', tokn);
					$(this).find('.octotree-message').text('').end().hide();
					$(window).resize();
					repo = [ null, null, null, null, null ];
				})
				.find('.octotree-tree')
					.on('changed.jstree', function (e, data) {
						if(data.event) {
							$('h1 > .page-context-loader').addClass('is-context-loading');
							$.pjax({ 
								'url' : '/' + repo[1] + '/' + repo[2] + '/' + data.selected[0],
								'timeout' : 5000,
								'container' : $('#js-repo-pjax-container')
							}).done(function (resp) {
								$('h1 > .page-context-loader').removeClass('is-context-loading');
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
									var cnf = {
											'method' : 'GET',
											'url' : 'https://api.github.com/repos/' + repo[1] + '/' + repo[2] + '/git/trees/' + encodeURIComponent(repo[4]) + '?recursive=true'
										},
										i, j, rslt = [], item = {}, m;
									if(tokn) {
										cnf.headers.Authorization = 'token ' + tokn;
									}
									$.ajax(cnf)
										.fail(function (xhr, err) {
											switch(parseInt(xhr.status,10)) {
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
										})
										.done(function (data) {
											var tree = data.tree;
											for(i = 0, j = tree.length; i < j; i++) {
												if(tree[i].type !== 'tree' && tree[i].type !== 'blob') { continue; }
												item = {};
												item.id = tree[i].type + '/' + repo[4] + '/' + tree[i].path;
												item.text = $('<div/>').text(tree[i].path.split('/').reverse()[0]).html();
												item.parent = tree[i].path.indexOf('/') === -1 ? '#' : 'tree/' + repo[4] + '/' + tree[i].path.split('/').slice(0,-1).join('/');
												item.icon = tree[i].type === 'tree' ? 'octicon octicon-file-directory' : 'octicon octicon-file-text';
												rslt.push(item);
											}
											cb(rslt);
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
				html.children('.octotree-tree').outerHeight($(window).height() - (20 + html.children('.octotree-header').outerHeight() + (html.children('.octotree-form').is(':visible') ? html.children('.octotree-form').outerHeight() : 0)));
			})
			.resize();
		$(document)
			.bind('dnd_move.vakata', function (e, data) {
				if(!data.data.octotree) { return; }
				html.width(data.data.w + (data.event.pageX - data.data.x) * (html.hasClass('octotree-sidebar-right') ? -1 : 1) );
			})
			.bind('dnd_stop.vakata', function (e, data) {
				window.localStorage.setItem('octotree.width.' + repo[1] + '.' + repo[2], parseInt(html.width(),10));
			});
		detectLocationChange();
	});
})(jQuery);