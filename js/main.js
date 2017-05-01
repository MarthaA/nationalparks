jQuery(document).ready(function($){



	// Slideshow


	jQuery(document).ready(function($){
		var itemInfoWrapper = $('.cd-single-item');

		itemInfoWrapper.each(function(){
			var container = $(this),
				// create slider pagination
				sliderPagination = createSliderPagination(container);

			//update slider navigation visibility
			updateNavigation(container, container.find('.cd-slider li').eq(0));

			container.find('.cd-slider').on('click', function(event){
				//enlarge slider images
				if( !container.hasClass('cd-slider-active') && $(event.target).is('.cd-slider')) {
					itemInfoWrapper.removeClass('cd-slider-active');
					container.addClass('cd-slider-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
						$('body,html').animate({'scrollTop':container.offset().top}, 200);
					});
				}
			});

			container.find('.cd-close').on('click', function(){
				//shrink slider images
				container.removeClass('cd-slider-active');
			});

			//update visible slide
			container.find('.cd-next').on('click', function(){
				nextSlide(container, sliderPagination);
			});

			container.find('.cd-prev').on('click', function(){
				prevSlide(container, sliderPagination);
			});

			container.find('.cd-slider').on('swipeleft', function(){
				var wrapper = $(this),
					bool = enableSwipe(container);
				if(!wrapper.find('.selected').is(':last-child') && bool) {nextSlide(container, sliderPagination);}
			});

			container.find('.cd-slider').on('swiperight', function(){
				var wrapper = $(this),
					bool = enableSwipe(container);
				if(!wrapper.find('.selected').is(':first-child') && bool) {prevSlide(container, sliderPagination);}
			});

			sliderPagination.on('click', function(){
				var selectedDot = $(this);
				if(!selectedDot.hasClass('selected')) {
					var selectedPosition = selectedDot.index(),
						activePosition = container.find('.cd-slider .selected').index();
					if( activePosition < selectedPosition) {
						nextSlide(container, sliderPagination, selectedPosition);
					} else {
						prevSlide(container, sliderPagination, selectedPosition);
					}
				}
			});
		});

		//keyboard slider navigation
		$(document).keyup(function(event){
			if(event.which=='37' && $('.cd-slider-active').length > 0 && !$('.cd-slider-active .cd-slider .selected').is(':first-child')) {
				prevSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
			} else if( event.which=='39' && $('.cd-slider-active').length && !$('.cd-slider-active .cd-slider .selected').is(':last-child')) {
				nextSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
			} else if(event.which=='27') {
				itemInfoWrapper.removeClass('cd-slider-active');
			}
		});

		function createSliderPagination($container){
			var wrapper = $('<ul class="cd-slider-pagination"></ul>').insertAfter($container.find('.cd-slider-navigation'));
			$container.find('.cd-slider li').each(function(index){
				var dotWrapper = (index == 0) ? $('<li class="selected"></li>') : $('<li></li>'),
					dot = $('<a href="#0"></a>').appendTo(dotWrapper);
				dotWrapper.appendTo(wrapper);
				dot.text(index+1);
			});
			return wrapper.children('li');
		}

		function nextSlide($container, $pagination, $n){
			var visibleSlide = $container.find('.cd-slider .selected'),
				navigationDot = $container.find('.cd-slider-pagination .selected');
			if(typeof $n === 'undefined') $n = visibleSlide.index() + 1;
			visibleSlide.removeClass('selected');
			$container.find('.cd-slider li').eq($n).addClass('selected').prevAll().addClass('move-left');
			navigationDot.removeClass('selected')
			$pagination.eq($n).addClass('selected');
			updateNavigation($container, $container.find('.cd-slider li').eq($n));
		}

		function prevSlide($container, $pagination, $n){
			var visibleSlide = $container.find('.cd-slider .selected'),
				navigationDot = $container.find('.cd-slider-pagination .selected');
			if(typeof $n === 'undefined') $n = visibleSlide.index() - 1;
			visibleSlide.removeClass('selected')
			$container.find('.cd-slider li').eq($n).addClass('selected').removeClass('move-left').nextAll().removeClass('move-left');
			navigationDot.removeClass('selected');
			$pagination.eq($n).addClass('selected');
			updateNavigation($container, $container.find('.cd-slider li').eq($n));
		}

		function updateNavigation($container, $active) {
			$container.find('.cd-prev').toggleClass('inactive', $active.is(':first-child'));
			$container.find('.cd-next').toggleClass('inactive', $active.is(':last-child'));
		}

		function enableSwipe($container) {
			var mq = window.getComputedStyle(document.querySelector('.cd-slider'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
			return ( mq=='mobile' || $container.hasClass('cd-slider-active'));
		}
	});




	//cache DOM elements
	var projectsContainer = $('.cd-projects-container'),
		projectsPreviewWrapper = projectsContainer.find('.cd-projects-previews'),
		projectPreviews = projectsPreviewWrapper.children('li'),
		projects = projectsContainer.find('.cd-projects'),
		navigationTrigger = $('.cd-nav-trigger'),
		navigation = $('.cd-primary-nav'),
		//if browser doesn't support CSS transitions...
		transitionsNotSupported = ( $('.no-csstransitions').length > 0);

	var animating = false,
		//will be used to extract random numbers for projects slide up/slide down effect
		numRandoms = projects.find('li').length,
		uniqueRandoms = [];

	//open project
	projectsPreviewWrapper.on('click', 'a', function(event){
		event.preventDefault();
		if( animating == false ) {
			animating = true;
			navigationTrigger.add(projectsContainer).addClass('project-open');
			openProject($(this).parent('li'));
		}
	});

	navigationTrigger.on('click', function(event){
		event.preventDefault();

		if( animating == false ) {
			animating = true;
			if( navigationTrigger.hasClass('project-open') ) {
				//close visible project
				navigationTrigger.add(projectsContainer).removeClass('project-open');
				closeProject();
			} else if( navigationTrigger.hasClass('nav-visible') ) {
				//close main navigation
				navigationTrigger.removeClass('nav-visible');
				navigation.removeClass('nav-clickable nav-visible');
				if(transitionsNotSupported) projectPreviews.removeClass('slide-out');
				else slideToggleProjects(projectsPreviewWrapper.children('li'), -1, 0, false);
			} else {
				//open main navigation
				navigationTrigger.addClass('nav-visible');
				navigation.addClass('nav-visible');
				if(transitionsNotSupported) projectPreviews.addClass('slide-out');
				else slideToggleProjects(projectsPreviewWrapper.children('li'), -1, 0, true);
			}
		}

		if(transitionsNotSupported) animating = false;
	});

	//scroll down to project info
	projectsContainer.on('click', '.scroll', function(){
		projectsContainer.animate({'scrollTop':$(window).height()}, 500);
	});

	//check if background-images have been loaded and show project previews
	projectPreviews.children('a').bgLoaded({
	  	afterLoaded : function(){
	   		showPreview(projectPreviews.eq(0));
	  	}
	});

	function showPreview(projectPreview) {
		if(projectPreview.length > 0 ) {
			setTimeout(function(){
				projectPreview.addClass('bg-loaded');
				showPreview(projectPreview.next());
			}, 150);
		}
	}

	function openProject(projectPreview) {
		var projectIndex = projectPreview.index();
		projects.children('li').eq(projectIndex).add(projectPreview).addClass('selected');

		if( transitionsNotSupported ) {
			projectPreviews.addClass('slide-out').removeClass('selected');
			projects.children('li').eq(projectIndex).addClass('content-visible');
			animating = false;
		} else {
			slideToggleProjects(projectPreviews, projectIndex, 0, true);
		}
	}

	function closeProject() {
		projects.find('.selected').removeClass('selected').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			$(this).removeClass('content-visible').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
			slideToggleProjects(projectsPreviewWrapper.children('li'), -1, 0, false);
		});

		//if browser doesn't support CSS transitions...
		if( transitionsNotSupported ) {
			projectPreviews.removeClass('slide-out');
			projects.find('.content-visible').removeClass('content-visible');
			animating = false;
		}
	}

	function slideToggleProjects(projectsPreviewWrapper, projectIndex, index, bool) {
		if(index == 0 ) createArrayRandom();
		if( projectIndex != -1 && index == 0 ) index = 1;

		var randomProjectIndex = makeUniqueRandom();
		if( randomProjectIndex == projectIndex ) randomProjectIndex = makeUniqueRandom();

		if( index < numRandoms - 1 ) {
			projectsPreviewWrapper.eq(randomProjectIndex).toggleClass('slide-out', bool);
			setTimeout( function(){
				//animate next preview project
				slideToggleProjects(projectsPreviewWrapper, projectIndex, index + 1, bool);
			}, 150);
		} else if ( index == numRandoms - 1 ) {
			//this is the last project preview to be animated
			projectsPreviewWrapper.eq(randomProjectIndex).toggleClass('slide-out', bool).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				if( projectIndex != -1) {
					projects.children('li.selected').addClass('content-visible');
					projectsPreviewWrapper.eq(projectIndex).addClass('slide-out').removeClass('selected');
				} else if( navigation.hasClass('nav-visible') && bool ) {
					navigation.addClass('nav-clickable');
				}
				projectsPreviewWrapper.eq(randomProjectIndex).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
				animating = false;
			});
		}
	}

	//http://stackoverflow.com/questions/19351759/javascript-random-number-out-of-5-no-repeat-until-all-have-been-used
	function makeUniqueRandom() {
	    var index = Math.floor(Math.random() * uniqueRandoms.length);
	    var val = uniqueRandoms[index];
	    // now remove that value from the array
	    uniqueRandoms.splice(index, 1);
	    return val;
	}

	function createArrayRandom() {
		//reset array
		uniqueRandoms.length = 0;
		for (var i = 0; i < numRandoms; i++) {
            uniqueRandoms.push(i);
        }
	}
});

 /*
 * BG Loaded
 * Copyright (c) 2014 Jonathan Catmull
 * Licensed under the MIT license.
 */
 (function($){
 	$.fn.bgLoaded = function(custom) {
	 	var self = this;

		// Default plugin settings
		var defaults = {
			afterLoaded : function(){
				this.addClass('bg-loaded');
			}
		};

		// Merge default and user settings
		var settings = $.extend({}, defaults, custom);

		// Loop through element
		self.each(function(){
			var $this = $(this),
				bgImgs = $this.css('background-image').split(', ');
			$this.data('loaded-count',0);
			$.each( bgImgs, function(key, value){
				var img = value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
				$('<img/>').attr('src', img).load(function() {
					$(this).remove(); // prevent memory leaks
					$this.data('loaded-count',$this.data('loaded-count')+1);
					if ($this.data('loaded-count') >= bgImgs.length) {
						settings.afterLoaded.call($this);
					}
				});
			});

		});
	};
})(jQuery);
