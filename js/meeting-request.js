(function () {
  'use strict';

  document.querySelectorAll('.meeting-request').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var lines = [];
      form.querySelectorAll('[name]').forEach(function (field) {
        var label = form.querySelector('label[for="' + field.id + '"]');
        lines.push(label.textContent + ': ' + field.value.trim());
      });

      window.location.href = 'mailto:team@theappsgarden.com?subject=' +
        encodeURIComponent(form.dataset.subject) + '&body=' +
        encodeURIComponent(lines.join('\n\n'));
      var status = form.querySelector('[role="status"]');
      status.textContent = status.dataset.message;
    });
  });
})();
