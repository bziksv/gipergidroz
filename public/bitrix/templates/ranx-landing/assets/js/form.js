$(document).ready(function(){

    async function submitForm($form)
    {
        let $button = $form.find('[type="submit"]');
        let captcha = $form.data('captcha');

        startBtnLoad($button);

        $form.find('[data-code="SOURCE"]').val(window.location.href);

        // serializeArray() doesn't work with disabled elements
        $form.find(':disabled').each(function () {
            $(this).addClass('removed-disable');
            $(this).prop('disabled', false);
        });

        // just convert serialized array to obj
        let dataArr   = $form.serializeArray().concat(await loadFilesFromForm($form));
        let data      = convertFormArrToObj(dataArr);
        let settingId = getSettingId();

        // restore disabled elements
        $form.find('.removed-disable').each(function () {
            $(this).removeClass('removed-disable');
            $(this).prop('disabled', true);
        });

        rxRunComponentAction('form', 'submit', {data: {post: data, settingId: settingId}}).then(function(res){
            $form.addClass('form-success');
            $form.removeClass('was-validated')
            $form.trigger('reset');
            initForms();
            endBtnLoad($button);

            if ($form.attr('data-submit-type') === 'payment' && res.data.html) {
                let $payment = $form.siblings('.invoicebox-payment');
                if ($payment.length) {
                    $payment.html(res.data.html);
                    $payment.find('form').submit();
                }
            }

            let eventData = {formCode: $form.find('input[name="FORM_CODE"]').val(),};
            $form.trigger('rxFormSubmitted', eventData);

        }, function(res){

            let errorByCaptcha = (res.errors[0].message === 'captcha');

            if(captcha)
            {
                captcha.reportValidity(!errorByCaptcha);
                if(errorByCaptcha)
                    captcha.reset();
            }

            if(!errorByCaptcha) {
                $form.addClass('form-error');
                console.log(res);
            }

            endBtnLoad($button);
        });
    }

    async function onCaptchaChallengeSucceeded()
    {
        await submitForm($(this));
    }

    function onCaptchaInitialized(event, captcha)
    {
        $(this).data('captcha', captcha);
        checkFormInitialization.call(this);
    }

    $(document).on('challengesuccess.rx.captcha', '.js-form', onCaptchaChallengeSucceeded);
    $(document).on('initialize.rx.captcha',       '.js-form', onCaptchaInitialized);

    $(document).on('submit', '.js-form', async function(e){
        e.preventDefault();

        let $form   = $(this);
        let captcha = $form.data('captcha');

        const isValidFiles = checkCustomFiles($form);
        const isValidCheckboxes = checkCustomCheckboxes($form);
        const isValidFields = $form[0].checkValidity();
        if (isValidFields === false || isValidCheckboxes === false || isValidFiles === false)
        {
            e.stopPropagation();
        }
        else
        {
            if(captcha)
                captcha.runChallenge();
            else
                await submitForm($form);
        }

        $form.addClass('was-validated');
    });

    // return back to the form and reload captcha
    $(document).on('click', '.js-form-back', function(e){
        e.preventDefault();

        let $form   = $(this).closest('form')
        let captcha = $form.data('captcha');

        $form.removeClass('form-success form-error');
        if(captcha)
            captcha.reset();
    });

    $(document).on('click', '.js-write-type', function () {
        let value = $(this).val();
        if (value) {
            $(this).closest('.form').attr('data-submit-type', value);
        }
    });

    $(document).on('click', '.js-form-modal', function(e){
        e.preventDefault();

        let $this = $(this);
        let formCode = $(this).data('form-code');
        let subject = $(this).data('subject') || '';
        let productId = $(this).data('product-id') || '';
        let settingId = getSettingId();

        startBtnLoad($this);

        rxRunComponentAction('form', 'getModal', {data: {
            post: {
                formCode,
                subject,
                productId
            },
            settingId: settingId,
        }}).then(function(res){
            const $formModal = $('#formModal');

            $formModal.find('.modal-title').html(res.data.title);
            $formModal.find('.modal-body').html(res.data.body);

            if (!$formModal.data('original-class')) {
                $formModal.data('original-class', $formModal.attr('class'));
            }
            $formModal.attr('class', $formModal.data('original-class'));
            $formModal.addClass(res.data.class);

            $formModal.modal();

            endBtnLoad($this);
            initMasks();
            initForms();
        }, function (res) {
            if (!res.errors.length) {
                return;
            }

            const $formModal = $('#formModal');
            $formModal.find('.modal-title').html('');
            $formModal.find('.modal-body').html('');

            $.each(res.errors, function (i, e) {
                $formModal.find('.modal-body').append(`<div class="alert alert-danger">${e.message}</div>`);
            });

            $formModal.modal();
            endBtnLoad($this);
        });
    });
    $(document).on('click', '.js-form-agreement', function(e){
        e.preventDefault();

        let $this = $(this);
        let formCode = $this.data('form-code');
        let settingId = getSettingId();

        rxRunComponentAction('form', 'getAgreement', {data: {
            post: {
                formCode: formCode
            },
            settingId: settingId,
        }}).then(function(res){
            $('#agreementModal .modal-title').html(res.data.title);
            $('#agreementModal .modal-body').html(res.data.body);
            $('#agreementModal').modal();
        });
    });
    $(document).on('click', '.js-form-politics', function(e){
        e.preventDefault();

        let settingId = getSettingId();

        rxRunComponentAction('form', 'getPolitics', {data: {settingId: settingId}}).then(function(res){
            $('#agreementModal .modal-title').html(res.data.title);
            $('#agreementModal .modal-body').html(res.data.body);
            $('#agreementModal').modal();
        });
    });
    $(document).on('change keyup paste', 'form input[type="text"].form-control, ' +
        'form input[type="email"].form-control, form input[type="tel"].form-control, form textarea.form-control',
        function(e){
        if ($(this).val()) {
            $(this).removeClass('empty');
        } else {
            $(this).addClass('empty');
        }
    });

    // form custom file input events and function
    $(document).on('change', '.form-custom-file-wrapper .form-custom-file-input', function (e) {
        const $fileWrapper = $(this).closest('.form-custom-file-wrapper');
        const fileName = $(this).val().split('\\').pop();

        hideInvalidFeedback($fileWrapper);
        if (!fileName) {
            resetCustomFile.call($fileWrapper);
            return;
        }

        $(this).siblings('.form-custom-file-name').text(fileName);
        $fileWrapper.addClass('file-selected');
    });
    $(document).on('click', '.form-custom-file-wrapper .form-custom-file-close', function (e) {
        const $fileWrapper = $(this).closest('.form-custom-file-wrapper').each(resetCustomFile);
    })
    $(document).on('reset', '.js-form', function() {
        $(this).find('.form-custom-file-wrapper').each(resetCustomFile);
    });
    $(document).on('click', 'form .checkbox-group.required input[type="checkbox"]', function (e) {
        const $checkboxes = $(this).parents('.checkbox-group').find('input[type="checkbox"]');
        
        $checkboxes.each(function () {
            $(this)[0].setCustomValidity('');
        });
    });

    function resetCustomFile() {
        const $fileWrapper = $(this);
        $fileWrapper.removeClass('file-selected');
        $fileWrapper.find('.form-control-file').val('');
        hideInvalidFeedback($fileWrapper);
    }
    function hideInvalidFeedback($fileWrapper) {
        $fileWrapper.siblings('.invalid-feedback').removeClass('active');
        $fileWrapper.removeClass('invalid');
    }

    function checkExtensions(file, accept) {
        const exts = accept.split(', ');
        const fileExt = '.' + getFileExt(file.name);
        return exts.includes(fileExt);
    }

    function checkCustomFiles($form) {
        let isValid = true;

        $form.find('.form-custom-file-input').each(function () {
            const $fileWrapper = $(this).closest('.form-custom-file-wrapper');
            const file = $(this).prop('files')[0];
            const isRequired = !!$(this).prop('required');
            const maxSize = parseInt($(this).attr('size'));
            const accept = $(this).prop('accept');

            if (!file) {
                if (!isRequired) {
                    return;
                }
                $fileWrapper.siblings('.invalid-feedback.invalid-required').addClass('active');
            }
            else if (maxSize && file.size > maxSize) {
                $fileWrapper.siblings('.invalid-feedback.invalid-maxsize').addClass('active');
            }
            else if (accept && !checkExtensions(file, accept)) {
                $fileWrapper.siblings('.invalid-feedback.invalid-ext').addClass('active');
            }
            else {
                return;
            }

            isValid = false;
            $fileWrapper.addClass('invalid');
        });

        return isValid;
    }

    function checkCustomCheckboxes($form) {
        let isValid = true;

        $form.find('.checkbox-group').each(function () {
            const isRequired = $(this).hasClass('required');
            const $checkboxes = $(this).find('input[type="checkbox"]');
            const $checkedCheckboxes = $(this).find('input[type="checkbox"]:checked');
            const minValues = parseInt($(this).data('min-values'));
            const maxValues = parseInt($(this).data('max-values'));

            if (isRequired && $checkedCheckboxes.length == 0) {
                $checkboxes.each(function () {
                    $(this)[0].setCustomValidity('Required field');
                });

                isValid = false;
            } else if (minValues > 0 && $checkedCheckboxes.length < minValues) {
                $checkboxes.each(function () {
                    $(this)[0].setCustomValidity('Required field');
                });

                $(this).find('.invalid-feedback.invalid-num-selected').addClass('active');

                isValid = false;
            } else if (maxValues > 0 && $checkedCheckboxes.length > maxValues) {
                $checkboxes.each(function () {
                    $(this)[0].setCustomValidity('Required field');
                });

                $(this).find('.invalid-feedback.invalid-num-selected').addClass('active');

                isValid = false;
            }
        });

        return isValid;
    }

    async function loadFilesFromForm($form)
    {
        let promises = $form.find('.form-control-file').map(async function () {
            const $input = $(this);
            const file = await loadFile($input);
            if (!file) {
                return;
            }

            const extPrefix = getFileExtPrefix(file.name);
            return {
                name: $input.attr('name'),
                value: {
                    fileName: file.name,
                    type: 'file',
                    data: extPrefix + file.data,
                }
            };
        });

        return (await Promise.allSettled(promises))
            .filter((p) => { return p.status === 'fulfilled' && p.value; })
            .map((p) => p.value);
    }

    initForms();
});


function checkFormInitialization()
{
    let $form   = $(this);
    let isReady = true;

    if($form.hasClass('has-captcha') && (typeof $form.data('captcha') === 'undefined'))
        isReady = false;

    if(isReady)
    {
        $form.find('[type="submit"]').removeClass('d-none').siblings('.spinner-grow').remove();
    }
}


function initForms()
{
    $('form input[type="text"].form-control, form input[type="email"].form-control, ' +
        'form input[type="tel"].form-control, form textarea.form-control').each(function(e){
        if ($(this).val()) {
            $(this).removeClass('empty');
        } else {
            $(this).addClass('empty');
        }
    });

    $('.js-form').each(checkFormInitialization);
}
