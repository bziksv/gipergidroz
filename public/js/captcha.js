(function () {
  document.querySelectorAll('form.js-form').forEach(function (form) {
    form.classList.add('has-captcha');
  });

  function boot() {
    if (!window.jQuery) {
      setTimeout(boot, 50);
      return;
    }

    window.jQuery(function () {
      document.querySelectorAll('form.js-form').forEach(mount);
      new MutationObserver(function (records) {
        records.forEach(function (record) {
          record.addedNodes.forEach(scan);
        });
      }).observe(document.body, { childList: true, subtree: true });
    });
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches && node.matches('form.js-form')) mount(node);
    if (node.querySelectorAll) node.querySelectorAll('form.js-form').forEach(mount);
  }

  function mount(form) {
    if (form.dataset.captchaMounted === '1') return;
    form.dataset.captchaMounted = '1';
    form.classList.add('has-captcha');

    const field = document.createElement('div');
    field.className = 'form-group captcha-field';
    field.innerHTML =
      '<label>Код с картинки <span>*</span></label>' +
      '<div class="captcha-row">' +
      '<div class="captcha-image" aria-hidden="true"></div>' +
      '<button type="button" class="captcha-refresh" aria-label="Обновить код">↻</button>' +
      '</div>' +
      '<input name="captcha_answer" class="form-control empty" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8" required placeholder="Символы с картинки" />' +
      '<input type="hidden" name="captcha_token" value="" />' +
      '<div class="invalid-feedback captcha-feedback">Введите символы с картинки</div>';

    const anchor = form.querySelector('.form-btn-wrap');
    if (anchor) anchor.parentNode.insertBefore(field, anchor);
    else form.appendChild(field);

    const image = field.querySelector('.captcha-image');
    const input = field.querySelector('[name="captcha_answer"]');
    const tokenInput = field.querySelector('[name="captcha_token"]');
    const feedback = field.querySelector('.captcha-feedback');
    const refresh = field.querySelector('.captcha-refresh');
    const button = form.querySelector('[type="submit"]');
    let loading = false;

    function showError(message) {
      feedback.textContent = message;
      field.classList.add('is-invalid');
      input.classList.add('is-invalid');
    }

    function clearError() {
      feedback.textContent = 'Введите символы с картинки';
      field.classList.remove('is-invalid');
      input.classList.remove('is-invalid');
    }

    function setButtonDisabled(disabled) {
      if (button) button.disabled = disabled;
    }

    async function reload(keepError) {
      if (loading) return;
      loading = true;
      setButtonDisabled(true);
      image.textContent = '…';
      tokenInput.value = '';
      try {
        const response = await fetch('/api/captcha.php', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok || !data.token || !data.svg) throw new Error('load');
        tokenInput.value = data.token;
        image.innerHTML = data.svg;
        if (!keepError) clearError();
        setButtonDisabled(false);
      } catch (err) {
        image.textContent = '';
        showError('Не удалось загрузить капчу');
      } finally {
        loading = false;
      }
    }

    const api = {
      async runChallenge() {
        const answer = input.value.trim();
        if (!tokenInput.value) {
          showError('Капча ещё загружается');
          return;
        }
        if (!answer) {
          showError('Введите символы с картинки');
          return;
        }
        setButtonDisabled(true);
        try {
          const response = await fetch('/api/captcha.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ token: tokenInput.value, answer: answer }),
          });
          const data = await response.json();
          if (!data.ok) {
            showError('Неверные символы, попробуйте ещё раз');
            input.value = '';
            input.classList.add('empty');
            await reload(true);
            return;
          }
          clearError();
          window.jQuery(form).trigger('challengesuccess.rx.captcha');
        } catch (err) {
          showError('Не удалось проверить капчу');
          setButtonDisabled(false);
        }
      },
      reportValidity(valid) {
        if (valid) clearError();
        else showError('Неверные символы, попробуйте ещё раз');
      },
      reset() {
        input.value = '';
        input.classList.add('empty');
        clearError();
        reload();
      },
    };

    refresh.addEventListener('click', function () {
      input.value = '';
      input.classList.add('empty');
      clearError();
      reload();
    });
    input.addEventListener('input', function () {
      if (field.classList.contains('is-invalid') && input.value.trim()) clearError();
    });

    setButtonDisabled(true);
    window.jQuery(form).trigger('initialize.rx.captcha', [api]);
    reload();
  }

  boot();
})();
