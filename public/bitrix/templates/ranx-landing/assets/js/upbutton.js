$(document).ready(function () {
    const $upBtn = $('.up-button');

    $upBtn.click(function(e){
        e.preventDefault();
        $('body, html').animate({ scrollTop : 0 }, 500);
        return false;
    });

    $(window).on('scroll', function() {
        const pageOffset = $(window).scrollTop() + $(window).height();
        const footerOffset = $('footer').offset().top || $(document).height();

        $upBtn.toggleClass('hide', $(window).scrollTop() < 200);
        $upBtn.toggleClass('sticky', pageOffset > footerOffset);
    });

    $(window).trigger('scroll');
});
