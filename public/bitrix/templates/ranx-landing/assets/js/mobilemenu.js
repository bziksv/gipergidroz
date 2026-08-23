$(document).ready(function(){
    $('.js-mobilemenu-close').on('click', function(e){
        e.preventDefault();
        closeMobileMenu();
    });

    $('.js-mobilemenu-open').on('click', function(e){
        e.preventDefault();
        openMobileMenu();
    });

    $('body').rxSwipe({
        swipeRight: function () {
            openMobileMenu();
        },
        swipeLeft: function () {
            closeMobileMenu();
        },
        threshold: 75,
        exclude: ['.slick-slider', '.fancybox-container', 'ymaps', '.swipe-ignore'],
    });

    $(document).on('click', function(e){
        if (e.target.id === 'mobilemenu' ||
            $(e.target).closest('#mobilemenu').length ||
            $(e.target).hasClass('js-mobilemenu-open') ||
            $(e.target).closest('.js-mobilemenu-open').length ||
            $(e.target).closest('[id$="Modal"]').length) {
            return;
        }

        closeMobileMenu();
    });

    $(document).on('click', '#mobilemenu a', function (e) {
        if ($(this).closest('.js-open-mobilemenu-dropdown').length) {
            return;
        }

        closeMobileMenu();
    });

    $('.js-open-mobilemenu-dropdown').on('click', function(e){
        e.preventDefault();

        let dropdownClass = $(this).data('class');
        if (!dropdownClass) {
            return;
        }

        let $mobilemenu = $('#mobilemenu');
        $mobilemenu.addClass(dropdownClass);

        let subsectionId = $(this).data('subsection');
        if (subsectionId) {
            let $section = $mobilemenu.find('[data-id="'+subsectionId+'"]');
            $section.addClass(dropdownClass);
            $section.find('.js-close-mobilemenu-dropdown').attr('data-class', dropdownClass);
        }

        $mobilemenu.animate({scrollTop: $mobilemenu.position().top});
    });
    $('.js-close-mobilemenu-dropdown').on('click', function(e){
        e.preventDefault();

        let dropdownClass = $(this).data('class');
        if (!dropdownClass) {
            return;
        }

        let $mobilemenu = $('#mobilemenu');
        $mobilemenu.removeClass(dropdownClass);
        $(this).closest('.mobilemenu-dropdown').removeClass(dropdownClass);
    });

    $('.js-open-cities-popup').on('click', function(e) {
        e.preventDefault();

        let $modal = $('#regionsModal');
        if ($modal.length) {
            $modal.modal();
        }
    });

    function openMobileMenu() {
        $('#mobilemenu').addClass('open');
        $('#mobilemenu-overlay').show();
    }

    function closeMobileMenu() {
        $('#mobilemenu').removeClass();
        $('#mobilemenu-overlay').hide();
        clearSectionClass();
    }

    function clearSectionClass() {
        let $mobilemenu = $('#mobilemenu');
        $mobilemenu.find('.mobilemenu-dropdown-links').each(function (){
            let dropdownClass = $(this).find('.js-close-mobilemenu-dropdown').data('class');
            if (dropdownClass) {
                $(this).removeClass(dropdownClass);
            }
        });
    }
});
