(function () {
  'use strict';

  // Older browsers keep the standard HTML POST rather than a broken AJAX form.
  if (!window.fetch || !window.FormData || !window.AbortController) return;

  var copy = {
    en: {
      sending: 'Sending…',
      success: 'Thank you. Your request has been received. We’ll reply to the email address you provided.',
      failure: 'We couldn’t confirm receipt. Your answers are still here. Please email team@theappsgarden.com before submitting again.',
      unavailable: 'The form is temporarily unavailable. Your answers are still here. Please email team@theappsgarden.com.',
      validation: 'Please check the highlighted fields and send your request again.',
      invalidField: 'Please check this value.', required: 'Please enter more than spaces.'
    },
    es: {
      sending: 'Enviando…',
      success: 'Gracias. Hemos recibido tu solicitud. Responderemos al email que has indicado.',
      failure: 'No hemos podido confirmar la recepción. Tus respuestas siguen aquí. Escribe a team@theappsgarden.com antes de volver a enviar.',
      unavailable: 'El formulario no está disponible temporalmente. Tus respuestas siguen aquí. Escribe a team@theappsgarden.com.',
      validation: 'Revisa los campos marcados y vuelve a enviar la solicitud.',
      invalidField: 'Revisa este dato.', required: 'Escribe algo más que espacios.'
    },
    ca: {
      sending: 'Enviant…',
      success: 'Gràcies. Hem rebut la teva sol·licitud. Respondrem al correu que has indicat.',
      failure: 'No hem pogut confirmar la recepció. Les teves respostes continuen aquí. Escriu a team@theappsgarden.com abans de tornar a enviar.',
      unavailable: 'El formulari no està disponible temporalment. Les teves respostes continuen aquí. Escriu a team@theappsgarden.com.',
      validation: 'Revisa els camps marcats i torna a enviar la sol·licitud.',
      invalidField: 'Revisa aquesta dada.', required: 'Escriu alguna cosa més que espais.'
    }
  }[document.documentElement.lang.split('-')[0]];
  if (!copy) return;

  document.querySelectorAll('.meeting-request').forEach(function (form) {
    var status = form.querySelector('[role="status"]');
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button.textContent;
    var fields = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    var submitting = false;

    function show(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        field.setCustomValidity('');
        field.removeAttribute('aria-invalid');
        if (!submitting) show('', '');
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (submitting) return;
      fields.forEach(function (field) {
        field.setCustomValidity(field.required && !field.value.trim() ? copy.required : '');
        field.removeAttribute('aria-invalid');
      });
      if (!form.reportValidity()) return;

      // Capture the values before disabling inputs. Hidden subject/language fields
      // also work with native POST when JavaScript is unavailable.
      var data = new FormData(form);
      fields.forEach(function (field) { data.set(field.name, field.value.trim()); });
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 30000);
      submitting = true;
      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.textContent = copy.sending;
      fields.forEach(function (field) { field.disabled = true; });
      show('sending', copy.sending);

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
          credentials: 'omit',
          redirect: 'error',
          signal: controller.signal
        });
        var result = await response.json();
        if (response.ok && result && result.ok !== false &&
            !(Array.isArray(result.errors) && result.errors.length)) {
          form.reset();
          show('success', copy.success);
        } else {
          var invalidFields = false;
          if (response.status >= 400 && response.status < 500 && Array.isArray(result && result.errors)) {
            result.errors.forEach(function (error) {
              var field = fields.find(function (item) { return error && item.name === error.field; });
              if (!field) return;
              field.setCustomValidity(copy.invalidField);
              field.setAttribute('aria-invalid', 'true');
              invalidFields = true;
            });
          }
          show('error', invalidFields ? copy.validation :
            (response.status === 429 ? copy.unavailable : copy.failure));
        }
      } catch (_) {
        // A timeout/network error can happen after acceptance: never auto-retry
        // or promise it failed to arrive, which could create duplicate enquiries.
        show('error', copy.failure);
      } finally {
        window.clearTimeout(timeout);
        submitting = false;
        form.removeAttribute('aria-busy');
        fields.forEach(function (field) { field.disabled = false; });
        button.disabled = false;
        button.textContent = buttonText;
        status.focus();
      }
    });
  });
})();
