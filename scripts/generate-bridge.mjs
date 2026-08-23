import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'public/js/bridge.js');
const legal = JSON.parse(fs.readFileSync(path.join(root, 'src/data/legal.json'), 'utf8'));

const legalUrls = legal.urls;

const reviews = {
  300: {
    title: 'Жанна Егорова',
    body:
      'Гипергидроз у меня проявился еще в подростковом возрасте. Наиболее проблемной зоной всегда были подмышки. Я перепробовала все: специальные антиперспиранты, таблетки, даже ботокс, но ничего не давало долговременного эффекта. SwiSto3 стал для меня реальным решением — после курса процедур потливость существенно снизилась, и я снова могу носить светлую одежду без страха.',
  },
  301: {
    title: 'Александр Смирнов',
    body:
      'Я профессиональный спортсмен, и потливость стоп всегда была для меня настоящей проблемой. Во время тренировок ноги постоянно мокрые, что приводит к дискомфорту и даже грибковым инфекциям. После использования аппарата SwiSto3 ситуация улучшилась: ноги меньше потеют, тренировки проходят комфортнее, а проблемы с кожей стоп практически исчезли.',
  },
  302: {
    title: 'Марина Чернышова',
    body:
      'Гипергидроз ладоней всегда мешал мне в профессиональной деятельности. Я работаю бухгалтером, и мои руки всегда были влажными, что создавало проблемы при работе с бумагами и документами. После использования SwiSto3 моя ситуация изменилась — ладони стали сухими, работа с документами перестала доставлять дискомфорт.',
  },
  303: {
    title: 'Иван Ковалев',
    body:
      'Мне всегда было сложно справляться с потливостью стоп, особенно в летнее время. В общественных местах я всегда чувствовал себя неловко, так как запах был заметен окружающим. SwiSto3 помог мне решить эту проблему — потливость уменьшилась, и я чувствую себя увереннее в повседневной жизни.',
  },
  305: {
    title: 'Марина Бугаевская',
    body:
      'После долгих лет борьбы с гипергидрозом подмышек я наконец-то нашла аппарат SwiSto3. Его эффективность превзошла все мои ожидания! Раньше я даже не могла выйти на улицу в теплую погоду без мокрых пятен на одежде, но после регулярного использования устройства это больше не проблема.',
  },
};

const politicsHtml =
  `<p>Мы используем cookies для оптимизации работы сайта, персонализации рекламы и аналитики. Продолжая использование сайта, вы даёте <a href="${legalUrls.consent}" target="_blank">согласие на обработку персональных данных</a> и подтверждаете, что ознакомлены с <a href="${legalUrls.personal_data}" target="_blank">политикой обработки персональных данных</a> и <a href="${legalUrls.recommendation}" target="_blank">правилами рекомендательных технологий</a>.</p><p>Отключить cookies можно в настройках браузера.</p>`;

function agreementCheckbox(id) {
  return `<div class="form-group checkbox-group"><div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input" name="AGREEMENT" id="${id}" required /><label class="custom-control-label" for="${id}">Даю <a target="_blank" href="${legalUrls.consent}">согласие на обработку персональных данных</a> и ознакомлен с <a target="_blank" href="${legalUrls.personal_data}">политикой обработки персональных данных</a></label><div class="invalid-feedback">Согласитесь с условиями</div></div></div>`;
}

function formShell(formCode, fields) {
  return `<form class="form js-form" method="POST" novalidate><input type="hidden" name="FORM_CODE" value="${formCode}"><div class="form-block">${fields}<input type="hidden" name="SOURCE" data-code="SOURCE" value="">${agreementCheckbox('agreement_' + formCode)}<div class="form-btn-wrap"><div class="spinner-grow theme-color"></div><button type="submit" class="d-none btn btn-lg btn-primary">Отправить</button></div></div><div class="form-block form-block-success"><div><div class="theme-stroke"><svg class="svg"><use xlink:href="/bitrix/templates/ranx-landing/assets/img/form/success.svg#main"></use></svg></div><div class="form-block-title">Спасибо</div><div class="form-block-text">Ваше сообщение отправлено</div><div><button class="btn btn-transparent js-form-back">Новое сообщение</button></div></div></div><div class="form-block form-block-error"><div><div class="theme-stroke"><svg class="svg"><use xlink:href="/bitrix/templates/ranx-landing/assets/img/form/error.svg#main"></use></svg></div><div class="form-block-title">Ошибка</div><div class="form-block-text">Что-то пошло не так. Попробуйте еще раз.</div><div><button class="btn btn-transparent js-form-back">Еще раз</button></div></div></div></form>`;
}

const nameField =
  '<div class="form-group"><label>Ваше имя <span>*</span></label><input name="NAME" class="form-control empty" type="text" required /><div class="invalid-feedback">Обязательное поле</div></div>';
const phoneField =
  '<div class="form-group"><label>Контактный телефон <span>*</span></label><input name="PHONE" class="form-control empty phone" type="tel" required /><div class="invalid-feedback">Обязательное поле</div></div>';
const emailField =
  '<div class="form-group"><label>E-mail (для отправки счета и уведомлений о заказе) <span>*</span></label><input name="EMAIL" class="form-control empty" type="email" required /><div class="invalid-feedback">Обязательное поле</div></div>';
const questionField =
  '<div class="form-group"><label>ИНН и реквизиты (если Вы юридическое лицо)</label><textarea name="QUESTION" class="form-control empty"></textarea><div class="invalid-feedback">Обязательное поле</div></div>';
const subjectField =
  '<div class="form-group"><label>Тема</label><input name="SUBJECT" class="form-control empty" type="text" /></div>';

const formModals = {
  ranx_landing_form_callback: {
    title: 'Заказать звонок',
    body: formShell('ranx_landing_form_callback', nameField + phoneField + subjectField),
    class: 'modal-form-callback',
  },
  ranx_landing_form_order: {
    title: 'Оставить заявку',
    body: formShell(
      'ranx_landing_form_order',
      nameField + phoneField + emailField + questionField + subjectField,
    ),
    class: 'modal-form-order',
  },
};

const js = `/* generated */
(function () {
  const REVIEWS = ${JSON.stringify(reviews)};
  const FORM_MODALS = ${JSON.stringify(formModals)};
  const POLITICS_HTML = ${JSON.stringify(politicsHtml)};

  function patchApi() {
    if (typeof window.rxRunComponentAction !== 'function') {
      setTimeout(patchApi, 50);
      return;
    }

    window.rxRunComponentAction = function (component, action, config) {
      config = config || { data: {} };
      const post = (config.data && config.data.post) || {};

      return new Promise(function (resolve, reject) {
        if (component === 'form' && action === 'getModal') {
          const formCode = String(post.formCode || '');
          const subject = String(post.subject || '');
          const modal = FORM_MODALS[formCode];
          if (!modal) {
            reject({ errors: [{ message: 'Form not found' }] });
            return;
          }
          let body = modal.body;
          if (subject) {
            body = body.replace(
              'name="SUBJECT"',
              'name="SUBJECT" value="' + subject.replace(/"/g, '&quot;') + '"',
            );
          }
          resolve({ data: { title: modal.title, body, class: modal.class || '' } });
          return;
        }

        if (component === 'form' && action === 'submit') {
          console.log('[form submit]', post);
          resolve({ data: { html: '' } });
          return;
        }

        if (component === 'form' && (action === 'getPolitics' || action === 'getAgreement')) {
          resolve({
            data: { title: 'Cookies и персональные данные', body: POLITICS_HTML },
          });
          return;
        }

        if (component === 'block' && action === 'cardModal') {
          const id = Number(post.id);
          const review = REVIEWS[id];
          if (!review) {
            reject({ errors: [{ message: 'Review not found' }] });
            return;
          }
          resolve({
            data: {
              title: review.title,
              body: '<div class="block12-4-modal-text">' + review.body + '</div>',
            },
          });
          return;
        }

        if (component === 'block' && action === 'videoModal') {
          resolve({
            data: {
              body:
                '<iframe width="100%" height="360" src="https://drive.google.com/file/d/1vV2P4lNMVPm4UzseWy6tBbWzUIQQJUD4/preview"></iframe>',
            },
          });
          return;
        }

        reject({ errors: [{ message: 'Unknown: ' + component + '.' + action }] });
      });
    };
  }

  patchApi();
})();
`;

fs.writeFileSync(out, js);
console.log('Generated', out);
