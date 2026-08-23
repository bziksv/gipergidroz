
$(document).ready(function(){

    saveHeaderNavWidth();
    calcPaddingsForHeaderfixedCenterMenu();
    $(window).on('resize', function(){
        calcPaddingsForHeaderfixedCenterMenu();
        fitHeaderNav();
    });

    // these two events for calculating in which direction dropdown menu should go
    $(document).on('mouseover', '.header-nav-dropdown li', function(e){
        e.stopPropagation();

        let $dropdown = $(this).find('> ul');

        if (!$dropdown.length) {
            return;
        }

        let dropdownWidth = $dropdown.width() * ($(this).parents('ul.header-nav-dropdown').length + 1);
        let parentWidth = $(this).closest('.header-nav').width();
        let freeSpaceRight = parentWidth - $(this).closest('td').position().left;

        if (freeSpaceRight < dropdownWidth) {
            $dropdown.css('right', '100%');
            $dropdown.css('left', 'unset');
        } else {
            $dropdown.css('left', '100%');
            $dropdown.css('right', 'unset');
        }
    });
    $(document).on('mouseover', '.header-nav td', function(e){
        let $dropdown = $(this).find('> ul.header-nav-dropdown');
        let dropdownWidth = $dropdown.width();
        let parentWidth = $(this).closest('.header-nav').width();
        let freeSpaceRight = parentWidth - $(this).position().left;

        if (freeSpaceRight < dropdownWidth) {
            let moveLeftPx = freeSpaceRight - dropdownWidth;
            $dropdown.css('left', moveLeftPx);
        }
    });

    // set the position and size of the full drop down menu
    $(document).on('mouseenter', '.header-nav td:not(.header-nav-more)', function(e){
        const $dropdown = $(this).find('.header-nav-full-dropdown');
        if ($dropdown.length) {
            $dropdown.removeClass('loading');

            if ($dropdown.hasClass('header-nav-by_size')) {
                const $wrapper = $dropdown.closest('.maxwidth-theme');
                const wrapperWidth = $wrapper.width();

                const wrapperLeftOffset = parseInt($wrapper.offset().left);
                const wrapperBorderLeftWidth = parseInt($wrapper.css('border-left-width'));
                const wrapperLeftPadding = parseInt($wrapper.css('padding-left'));

                $dropdown.offset({left: wrapperLeftOffset + wrapperBorderLeftWidth + wrapperLeftPadding});
                $dropdown.css('width', wrapperWidth);
            }

            if ($dropdown.hasClass('header-nav-full')) {
                $dropdown.offset({left: 0});
                $dropdown.css('width', $('body').width());
            }
        }
    });
});

function saveHeaderNavWidth()
{
    if ($('.header-nav').length) {
        $('.header-nav td > a').each(function(){
            $(this).data('width', $(this).outerWidth());
            $(this).attr('data-width', $(this).outerWidth());
        });
    }
    fitHeaderNav();
}

function fitHeaderNav()
{
    // if we have nav on the page, calc width and hide some elements to dots
    if ($('.header-nav-wrap').length) {
        $('.header-nav-wrap').each(function(){ // loop, because fixed header have nav too
            let $navWrap = $(this);
            let $nav = $navWrap.find('.header-nav');
            let parentWidth = $navWrap.parent().width();

            // calc total width of all siblings
            let siblingsWidth = 0;
            $navWrap.siblings().each(function(){
                siblingsWidth += $(this).outerWidth(true); // width with paddings and margins
            });

            // now we have allowed width for our navbar
            let maxNavWidth = parentWidth - siblingsWidth;

            // calc width of nav elements
            let totalNavWidth = 0;
            if ($nav.find('.header-nav-more').is(':visible')) {
                totalNavWidth += $('.header-nav-more').outerWidth(true);
            }
            let hideNextElements = false;
            let hidedElements = [];

            // hide elements, that doesn't fit
            $nav.find('td').each(function(){
                if ($(this).hasClass('header-nav-more')) {
                    return false;
                }

                totalNavWidth += $(this).outerWidth(true);

                if (totalNavWidth > maxNavWidth) {
                    hideNextElements = true;
                }

                if (hideNextElements) {
                    let innerHtml = $(this).html();

                    innerHtml = '<li>' + innerHtml + '</li>';
                    hidedElements.push(innerHtml);

                    $(this).remove();

                    if (!$nav.find('.header-nav-more').is(':visible')) {
                        $nav.find('.header-nav-more').show();
                    }
                }
            });

            // add hided elements to dots
            if (hidedElements.length) {
                $nav.find('.header-nav-more > ul.header-nav-dropdown').prepend(hidedElements.join(''));
            }

            let newTotalNavWidth = $nav.width();

            // if wide nav, calc width manually
            if ($nav.hasClass('header-nav-wide')) {
                newTotalNavWidth = 0;

                $nav.find('td > a').each(function(){
                    newTotalNavWidth += $(this).data('width');
                });
            }

            // show elements that fit
            if (newTotalNavWidth < maxNavWidth) {
                $nav.find('.header-nav-more > ul.header-nav-dropdown > li').each(function(){
                    let itemWidth = $(this).find('a').data('width');
                    if (newTotalNavWidth + itemWidth < maxNavWidth) {
                        newTotalNavWidth += itemWidth;

                        let innerHtml = $(this).html();
                        innerHtml = '<td>' + innerHtml + '</td>';

                        $nav.find('.header-nav-more').before(innerHtml);

                        $(this).remove();
                    } else {
                        return false;
                    }
                });
            }

            // if no elements in dots, hide it
            if (!$nav.find('.header-nav-more > ul.header-nav-dropdown').children().length) {
                $nav.find('.header-nav-more').hide();
            }
        });
    }
}

function calcPaddingsForHeaderfixedCenterMenu()
{
    let $headerMenuCenter = $('.headerfixed-menu-center');
    if ($headerMenuCenter.length) {
        let paddingLeft = 20;
        let paddingRight = 20;

        $headerMenuCenter.siblings('.pull-left').each(function(){
            paddingLeft += $(this).outerWidth(true);
        });

        $headerMenuCenter.siblings('.pull-right').each(function(){
            paddingRight += $(this).outerWidth(true);
        });

        $headerMenuCenter.css('padding-left', paddingLeft);
        $headerMenuCenter.css('padding-right', paddingRight);
    }
}
