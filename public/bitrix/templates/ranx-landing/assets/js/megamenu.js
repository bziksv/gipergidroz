$(document).ready(function(){
    $('.js-megamenu-close').on('click', function(e){
        e.preventDefault();

        $('#megamenu').hide();
    });

    $(document).on('keydown', function (e){
        if (e.keyCode === 27) {
            $('#megamenu').hide();
        }
    });

    $(document).on('click', '#megamenu a', function (e) {
        $('#megamenu').hide();
    });

    $('.js-megamenu-open').on('click', function(e){
        e.preventDefault();

        $('#megamenu').css('display', 'flex');
    });
});
