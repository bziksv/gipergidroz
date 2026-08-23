$(document).ready(function(){
	initMasks();
	initSimplebar();
	initTooltip();
	
	// go to anchor animation
	$(document).on('click', 'a', function(e){
		if (window.location.pathname !== $(this).prop('pathname')) {
			return;
		}

		let href = $(this).attr('href');
		if (typeof href != 'undefined' && href.indexOf('#block_') !== -1) {
			e.preventDefault();

			href = href.substr(href.indexOf('#block_'));
			$('html, body').animate({ 
                scrollTop: $(href).offset().top - 100
            }, 500);
		}
	});
});

// wrapper for BX.ajax.runComponentAction
function rxRunComponentAction(component, action, config = { data: {} })
{
	if (!config.data) {
		config.data = {}
	}

	component = 'ranx:' + component + '.landing';
	config.mode = config.mode || 'class'

	// add extra fields
	if (BX.message.SITE_ID)
	{
		config.data.SITE_ID = BX.message.SITE_ID;
	}
	config.data.sessid = BX.bitrix_sessid();

	return BX.ajax.runComponentAction(component, action, config);
}

function initSimplebar()
{
	$('.js-simplebar').each(function(){new SimpleBar(this)});
}

function initTooltip()
{
	$('[data-toggle="tooltip"]').tooltip();
}

// convert serialized array to obj
function convertFormArrToObj(dataArr)
{
	let data = {};

	for (i = 0; i < dataArr.length; i++) {
		if (dataArr[i]['name'].indexOf('[]') !== -1) {
			let name = dataArr[i]['name'].slice(0, -2);
			if (!data[name]) {
				data[name] = [];
			}
			data[name].push(dataArr[i]['value']);
		} else if (dataArr[i]['name'].indexOf('[') !== -1) { // fucking awesome kostyl!
			let firstBracketPos = dataArr[i]['name'].indexOf('[');
			let name = dataArr[i]['name'].slice(0, firstBracketPos) + ']' + dataArr[i]['name'].slice(firstBracketPos, -1);
			data[name] = dataArr[i]['value'];
		} else if (data[dataArr[i]['name']]) {
			if (!Array.isArray(data[dataArr[i]['name']])) {
				data[dataArr[i]['name']] = [data[dataArr[i]['name']]];
			}
			data[dataArr[i]['name']].push(dataArr[i]['value']);
		} else {
			data[dataArr[i]['name']] = dataArr[i]['value'];
		}
	}

	return data;
}

function startBtnLoad($btn)
{
	let width = $btn.outerWidth();
	let height = $btn.outerHeight();

	$btn.data('original-html', $btn.html());
	$btn.data('original-style', $btn.attr('style'));
	$btn.html('<div class="spinner-grow"></div>');
	$btn.css('width', width);
	$btn.css('height', height);
	$btn.addClass('loading');

	$btn.prop('disabled', true);

	$btn.css('padding', 0);
	$btn.css('display', 'inline-flex');
	$btn.css('justify-content', 'center');
	$btn.css('align-items', 'center');
}

function endBtnLoad($btn)
{
	let originalText = $btn.data('original-html');
	let originalStyle = $btn.data('original-style') || '';

	$btn.html(originalText);
	$btn.removeClass('loading');

	$btn.prop('disabled', false);

	$btn.attr('style', originalStyle);
}

function getSettingId()
{
	return $('body').data('setting-id') || '';
}

async function loadFiles(files, params = {})
{
	let promises = [];

	$.each(files, function () {
		const file = this;
		const allowedExts = params.exts;
		const allowedMimeType = params.mime;
		const allowedSize = params.size;
		if (!file ||
			allowedExts && !allowedExts.includes('.' + getFileExt(file.name)) ||
			allowedMimeType && allowedMimeType !== file.type.split('/').shift() ||
			allowedSize && file.size > allowedSize){
			return;
		}

		promises.push(new Promise(resolve => {
			const reader = new FileReader();
			reader.onload = () => resolve({
				name: file.name,
				mime: file.type,
				size: file.size,
				data: reader.result
			});
			reader.onerror = (error) => reject(error);
			reader.readAsDataURL(file);
		}));
	});

	// if the browser doesn't support allSettled
	if(!Promise.allSettled) {
		Promise.allSettled = function(promises) {
			return Promise.all(promises.map(p => Promise.resolve(p).then(
				value => ({status: 'fulfilled', value: value}),
				error => ({status: 'rejected', reason: error})
			)));
		};
	}

	let results = await Promise.allSettled(promises);
	let loadedFiles = [];
	$.each(results, function () {
		if (this.status === 'fulfilled') {
			loadedFiles.push(this.value);
		}
	});

	return loadedFiles;
}

function getFileExt(name = '')
{
	// https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
	return name.toLowerCase().slice((name.lastIndexOf('.') - 1 >>> 0) + 2);
}
function getFileExtPrefix(name = '')
{
	const ext = getFileExt(name);
	if (ext) {
		return `extension:${ext.replace(/[^a-zA-Z0-9]+/g, '')};`;
	}

	return '';
}

async function loadFile($input, params = {})
{
	let files = await loadFiles($input.prop('files'), params);
	if (files.length < 1) {
		return;
	}

	return files.shift();
}

/* cookies */
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
	  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options = {}) {

	options = Object.assign({ path: '/' }, options);
  
	if (options.expires instanceof Date) {
	  	options.expires = options.expires.toUTCString();
	}
  
	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}
  
	document.cookie = updatedCookie;
}
function deleteCookie(name) {
	setCookie(name, "", {
		'max-age': -1
	})
}
