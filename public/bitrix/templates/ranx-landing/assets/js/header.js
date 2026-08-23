$(document).ready(function(){
    $(document).mousedown(function(e){
        let $cityWrap = $('.header-city-wrap');
        let $dropdown = $('.header-city-dropdown');

        if (!$cityWrap.is(e.target) && $cityWrap.has(e.target).length === 0) {
            $dropdown.fadeOut('fast');
        }
    });

    $(document).on('click', '.js-change-city', function(e){
        e.preventDefault();

        let id = parseInt($(this).data('id'));
        let branchId = parseInt($(this).data('branch-id'));
        let url = $(this).data('url') || '';

        if (id > 0) {
            setCookie('current_region', id);
            if (branchId > 0) {
                setCookie('current_branch', branchId);
            }
            if (url.length) {
                document.location.href = url;
            } else {
                document.location.reload(false);
            }
        } else {
            let $headerCity = $('header').find('.header-city').first();
            let $dropdown = $headerCity.siblings('.header-city-dropdown');
            let $modal = $('#regionsModal');

            if ($dropdown.length) {
                $dropdown.fadeIn('fast');
            } else if ($modal.length) {
                $modal.modal();
            }
        }

        $('.header-city-confirm').remove();
    });
});
