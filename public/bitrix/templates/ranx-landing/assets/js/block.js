$(document).ready(function(){
    initBlocks();
    setPaddingForFirstBlock();

    $(window).on('resize', function(){
        initBlocksHeight();
        setPaddingForFirstBlock();
    });

    $(document).on('click', '.js-card-modal', function(e){
        e.preventDefault();

        const $this = $(this);
        const code = $this.data('code');
        const id = parseInt($this.data('id'));
        const blockId = parseInt($this.closest('.block').data('id'));

        startBtnLoad($this);

        if (code && id > 0) {
            rxRunComponentAction('block', 'cardModal', {data: {post: {code, id, blockId}}}).then(function(res){
                $('#cardModal .modal-title').html(res.data.title);
                $('#cardModal .modal-body').html(res.data.body);
                $('#cardModal').modal();

                endBtnLoad($this);
            });
        }
    });

    $(document).on('click', '.js-video-modal', function(e) {
        e.preventDefault();

        let $this = $(this);
        let code = $this.data('code');
        let id = parseInt($this.data('id'));

        startBtnLoad($this);

        if (code && id > 0) {
            rxRunComponentAction('block', 'videoModal', {data: {post: {code: code, id: id}}}).then(function(res){
                $('#videoModal .modal-body').html(res.data.body);
                $('#videoModal').modal();

                endBtnLoad($this);
            });
        }
    });

    $(document).on('click', '.tab-button', function(e) {
        const $this = $(this);
        const $block = $this.closest('.block');
        const newTabId = $this.data('target-tab');

        $block.find('.tab-button').removeClass('active');
        $this.addClass('active');
        $block.find('.tab-item').removeClass('tab-item--show');
        $block.find(`.tab-item[data-tab-id="${newTabId}"]`).addClass('tab-item--show');
        $block.attr('data-tab', newTabId);

        $block.trigger('tabs.change');
    });
});

function initBlocks()
{
    initBlocksHeight();
    initFancybox();
    initTooltip();
    initTabs();
    initParallax();
}

function initBlocksHeight()
{
    $('.js-save-height').each(function(){
        $(this).css('height', '');
        $(this).css('height', $(this).outerHeight());
    });
}

function initFancybox()
{
    $('.fancybox').fancybox();
}

function initParallax()
{
    setTimeout(function () {
        if (typeof simpleParallax === 'function') {
            const selector = '.parallax-effect img.parallax-picture';
            new simpleParallax(document.querySelectorAll(selector), {scale: 1.5});
        }
    });
}

function setPaddingForFirstBlock() {
    let headerHeight = $('header').height();
    if ($(window).width() > 767) {
        $('body.header-is-transparent .block-wrap[data-order="1"] .maxwidth-theme').css({ 'padding-top': headerHeight });
        $('body.header-is-transparent .block-wrap[data-order="1"] .block_edit_btns').css({ 'top': headerHeight + 20 });
        $('body.header-is-transparent .block-wrap[data-order="1"] .block_edit.block_edit_label').css({ 'top': headerHeight + 20 });
    } else {
        $('body.header-is-transparent .block-wrap[data-order="1"] .maxwidth-theme').css({ 'padding-top': 0 });
        $('body.header-is-transparent .block-wrap[data-order="1"] .block_edit_btns').css({ 'top': 20 });
        $('body.header-is-transparent .block-wrap[data-order="1"] .block_edit.block_edit_label').css({ 'top': 20 });
    }
}

function initTabs()
{
    $('.block-tabs').each(function() {
        const $activeTab = $(this).find('.active');
        const activeTabId = $activeTab.data('target-tab');
        const $block = $activeTab.closest('.block');

        $block.attr('data-tab', activeTabId);
        $block.find(`.tab-item[data-tab-id="${activeTabId}"]`).addClass('tab-item--show');

        $block.trigger('tabs.init');
    });
}

function startBlockLoad(blockId)
{
    let $block = $(`#block_${blockId} > .block`);
    let $loadingNode = $('<div class="block-loading-wrap"><div class="spinner-grow theme-bg"></div></div>');

    $loadingNode.prependTo($block.find('.block-loading-content'));
    $block.addClass('block-loading');
}

function endBlockLoad(blockId)
{
    let $block = $(`#block_${blockId} > .block`);

    $block.find('.block-loading-content .block-loading-wrap').remove();
    $block.removeClass('block-loading');
}
