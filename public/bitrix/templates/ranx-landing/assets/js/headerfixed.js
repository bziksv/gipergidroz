
// hiding/showing fixed header on scroll
window.addEventListener('scroll', function() {
    if (!document.getElementById('headerfixed')) {
        return;
    }
    if (pageYOffset > 200) {
        document.getElementById('headerfixed').style.top = 0;
    } else {
        document.getElementById('headerfixed').style.top = '-200px';
    }

    let centerYPosition = $(window).scrollTop() + Math.round($(window).height() / 2);

    let slideToGo = null;
    $('.anchors-list a').each(function(){
        let link = $(this).attr('href');

        if (!$(link).length) {
            return;
        }

        if (parseInt($(link).offset().top) < centerYPosition) {
            slideToGo = $(this).closest('.slick-slide').data('slick-index');
        }
    });

    if (slideToGo) {
        $('.anchors-list').slick('slickGoTo', slideToGo);
    }
});

document.addEventListener('DOMContentLoaded', function(event) { 
    // scroll to block on anchor clicking
    let anchorsList = document.querySelectorAll('.anchors-list a');

    for (let i = 0; i < anchorsList.length; i++) {
        anchorsList[i].addEventListener('click', function(e){
            e.preventDefault();

            var $this = $(this);
            let link = this.attributes.href.value;
            //let offset = document.querySelector(link).getBoundingClientRect().top + pageYOffset;

            if (link.length) {
                $('html, body').animate({
                    scrollTop: $(link).offset().top - $('#headerfixed').height()
                }, 1000);
                setTimeout(function(){
                    $('.anchors-list').slick('slickGoTo', $this.closest('.slick-slide').data('slick-index'));
                }, 1100);
            }
        });
    }

    // scroll to top, when double click on fixed header
    $('#headerfixed').on('dblclick', function(){
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });

    $('.anchors-list').slick({
        variableWidth: true,
        infinite: false,
        prevArrow: '',
        nextArrow: '',
        centerMode: true
    });
});
