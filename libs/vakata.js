(function ($) {
	if(!$.vakata) {
		$.vakata = {};
	}
	// private variable
	var vakata_dnd = {
		element	: false,
		is_down	: false,
		is_drag	: false,
		helper	: false,
		helper_w: 0,
		data	: false,
		init_x	: 0,
		init_y	: 0,
		scroll_l: 0,
		scroll_t: 0,
		scroll_e: false,
		scroll_i: false
	};
	$.vakata.dnd = {
		settings : {
			scroll_speed		: 10,
			scroll_proximity	: 20,
			helper_left			: 5,
			helper_top			: 10,
			threshold			: 5
		},
		_trigger : function (event_name, e) {
			var data = $.vakata.dnd._get();
			data.event = e;
			$(document).triggerHandler("dnd_" + event_name + ".vakata", data);
		},
		_get : function () {
			return {
				"data"		: vakata_dnd.data,
				"element"	: vakata_dnd.element,
				"helper"	: vakata_dnd.helper
			};
		},
		_clean : function () {
			if(vakata_dnd.helper) { vakata_dnd.helper.remove(); }
			if(vakata_dnd.scroll_i) { clearInterval(vakata_dnd.scroll_i); vakata_dnd.scroll_i = false; }
			vakata_dnd = {
				element	: false,
				is_down	: false,
				is_drag	: false,
				helper	: false,
				helper_w: 0,
				data	: false,
				init_x	: 0,
				init_y	: 0,
				scroll_l: 0,
				scroll_t: 0,
				scroll_e: false,
				scroll_i: false
			};
			$(document).off("mousemove touchmove", $.vakata.dnd.drag);
			$(document).off("mouseup touchend", $.vakata.dnd.stop);
		},
		_scroll : function (init_only) {
			if(!vakata_dnd.scroll_e || (!vakata_dnd.scroll_l && !vakata_dnd.scroll_t)) {
				if(vakata_dnd.scroll_i) { clearInterval(vakata_dnd.scroll_i); vakata_dnd.scroll_i = false; }
				return false;
			}
			if(!vakata_dnd.scroll_i) {
				vakata_dnd.scroll_i = setInterval($.vakata.dnd._scroll, 100);
				return false;
			}
			if(init_only === true) { return false; }

			var i = vakata_dnd.scroll_e.scrollTop(),
				j = vakata_dnd.scroll_e.scrollLeft();
			vakata_dnd.scroll_e.scrollTop(i + vakata_dnd.scroll_t * $.vakata.dnd.settings.scroll_speed);
			vakata_dnd.scroll_e.scrollLeft(j + vakata_dnd.scroll_l * $.vakata.dnd.settings.scroll_speed);
			if(i !== vakata_dnd.scroll_e.scrollTop() || j !== vakata_dnd.scroll_e.scrollLeft()) {
				/**
				 * triggered on the document when a drag causes an element to scroll
				 * @event
				 * @plugin dnd
				 * @name dnd_scroll.vakata
				 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
				 * @param {DOM} element the DOM element being dragged
				 * @param {jQuery} helper the helper shown next to the mouse
				 * @param {jQuery} event the element that is scrolling
				 */
				$.vakata.dnd._trigger("scroll", vakata_dnd.scroll_e);
			}
		},
		start : function (e, data, html) {
			if(e.type === "touchstart" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
				e.pageX = e.originalEvent.changedTouches[0].pageX;
				e.pageY = e.originalEvent.changedTouches[0].pageY;
				e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
			}
			if(vakata_dnd.is_drag) { $.vakata.dnd.stop({}); }
			try {
				e.currentTarget.unselectable = "on";
				e.currentTarget.onselectstart = function() { return false; };
				if(e.currentTarget.style) { e.currentTarget.style.MozUserSelect = "none"; }
			} catch(ignore) { }
			vakata_dnd.init_x	= e.pageX;
			vakata_dnd.init_y	= e.pageY;
			vakata_dnd.data		= data;
			vakata_dnd.is_down	= true;
			vakata_dnd.element	= e.currentTarget;
			if(html !== false) {
				vakata_dnd.helper = $("<div id='vakata-dnd'></div>").html(html).css({
					"display"		: "block",
					"margin"		: "0",
					"padding"		: "0",
					"position"		: "absolute",
					"top"			: "-2000px",
					"lineHeight"	: "16px",
					"zIndex"		: "10000"
				});
			}
			$(document).bind("mousemove touchmove", $.vakata.dnd.drag);
			$(document).bind("mouseup touchend", $.vakata.dnd.stop);
			return false;
		},
		drag : function (e) {
			if(e.type === "touchmove" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
				e.pageX = e.originalEvent.changedTouches[0].pageX;
				e.pageY = e.originalEvent.changedTouches[0].pageY;
				e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
			}
			if(!vakata_dnd.is_down) { return; }
			if(!vakata_dnd.is_drag) {
				if(
					Math.abs(e.pageX - vakata_dnd.init_x) > $.vakata.dnd.settings.threshold ||
					Math.abs(e.pageY - vakata_dnd.init_y) > $.vakata.dnd.settings.threshold
				) {
					if(vakata_dnd.helper) {
						vakata_dnd.helper.appendTo("body");
						vakata_dnd.helper_w = vakata_dnd.helper.outerWidth();
					}
					vakata_dnd.is_drag = true;
					/**
					 * triggered on the document when a drag starts
					 * @event
					 * @plugin dnd
					 * @name dnd_start.vakata
					 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
					 * @param {DOM} element the DOM element being dragged
					 * @param {jQuery} helper the helper shown next to the mouse
					 * @param {Object} event the event that caused the start (probably mousemove)
					 */
					$.vakata.dnd._trigger("start", e);
				}
				else { return; }
			}

			var d  = false, w  = false,
				dh = false, wh = false,
				dw = false, ww = false,
				dt = false, dl = false,
				ht = false, hl = false;

			vakata_dnd.scroll_t = 0;
			vakata_dnd.scroll_l = 0;
			vakata_dnd.scroll_e = false;
			$($(e.target).parentsUntil("body").addBack().get().reverse())
				.filter(function () {
					return	(/^auto|scroll$/).test($(this).css("overflow")) &&
							(this.scrollHeight > this.offsetHeight || this.scrollWidth > this.offsetWidth);
				})
				.each(function () {
					var t = $(this), o = t.offset();
					if(this.scrollHeight > this.offsetHeight) {
						if(o.top + t.height() - e.pageY < $.vakata.dnd.settings.scroll_proximity)	{ vakata_dnd.scroll_t = 1; }
						if(e.pageY - o.top < $.vakata.dnd.settings.scroll_proximity)				{ vakata_dnd.scroll_t = -1; }
					}
					if(this.scrollWidth > this.offsetWidth) {
						if(o.left + t.width() - e.pageX < $.vakata.dnd.settings.scroll_proximity)	{ vakata_dnd.scroll_l = 1; }
						if(e.pageX - o.left < $.vakata.dnd.settings.scroll_proximity)				{ vakata_dnd.scroll_l = -1; }
					}
					if(vakata_dnd.scroll_t || vakata_dnd.scroll_l) {
						vakata_dnd.scroll_e = $(this);
						return false;
					}
				});

			if(!vakata_dnd.scroll_e) {
				d  = $(document); w = $(window);
				dh = d.height(); wh = w.height();
				dw = d.width(); ww = w.width();
				dt = d.scrollTop(); dl = d.scrollLeft();
				if(dh > wh && e.pageY - dt < $.vakata.dnd.settings.scroll_proximity)		{ vakata_dnd.scroll_t = -1;  }
				if(dh > wh && wh - (e.pageY - dt) < $.vakata.dnd.settings.scroll_proximity)	{ vakata_dnd.scroll_t = 1; }
				if(dw > ww && e.pageX - dl < $.vakata.dnd.settings.scroll_proximity)		{ vakata_dnd.scroll_l = -1; }
				if(dw > ww && ww - (e.pageX - dl) < $.vakata.dnd.settings.scroll_proximity)	{ vakata_dnd.scroll_l = 1; }
				if(vakata_dnd.scroll_t || vakata_dnd.scroll_l) {
					vakata_dnd.scroll_e = d;
				}
			}
			if(vakata_dnd.scroll_e) { $.vakata.dnd._scroll(true); }

			if(vakata_dnd.helper) {
				ht = parseInt(e.pageY + $.vakata.dnd.settings.helper_top, 10);
				hl = parseInt(e.pageX + $.vakata.dnd.settings.helper_left, 10);
				if(dh && ht + 25 > dh) { ht = dh - 50; }
				if(dw && hl + vakata_dnd.helper_w > dw) { hl = dw - (vakata_dnd.helper_w + 2); }
				vakata_dnd.helper.css({
					left	: hl + "px",
					top		: ht + "px"
				});
			}
			/**
			 * triggered on the document when a drag is in progress
			 * @event
			 * @plugin dnd
			 * @name dnd_move.vakata
			 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
			 * @param {DOM} element the DOM element being dragged
			 * @param {jQuery} helper the helper shown next to the mouse
			 * @param {Object} event the event that caused this to trigger (most likely mousemove)
			 */
			$.vakata.dnd._trigger("move", e);
		},
		stop : function (e) {
			if(e.type === "touchend" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]) {
				e.pageX = e.originalEvent.changedTouches[0].pageX;
				e.pageY = e.originalEvent.changedTouches[0].pageY;
				e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset, e.originalEvent.changedTouches[0].pageY - window.pageYOffset);
			}
			if(vakata_dnd.is_drag) {
				/**
				 * triggered on the document when a drag stops (the dragged element is dropped)
				 * @event
				 * @plugin dnd
				 * @name dnd_stop.vakata
				 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
				 * @param {DOM} element the DOM element being dragged
				 * @param {jQuery} helper the helper shown next to the mouse
				 * @param {Object} event the event that caused the stop
				 */
				$.vakata.dnd._trigger("stop", e);
			}
			$.vakata.dnd._clean();
		}
	};
}(jQuery));