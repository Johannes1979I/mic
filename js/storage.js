/* storage.js — Persistent Settings (localStorage) */

function handleHeaderUpload(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) { applyHeaderPreview(ev.target.result); };
  reader.readAsDataURL(file);
}

function applyHeaderPreview(src) {
  const img = document.getElementById('header-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const removeBtn = document.getElementById('btn-remove-header');
  img.src = src; img.classList.remove('hidden');
  placeholder.style.display = 'none';
  removeBtn.style.display = 'inline-flex';
  if (document.getElementById('toggle-save-settings')?.checked) saveSettingsToStorage();
}

function removeHeader() {
  const img = document.getElementById('header-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const removeBtn = document.getElementById('btn-remove-header');
  img.src = ''; img.classList.add('hidden');
  placeholder.style.display = '';
  removeBtn.style.display = 'none';
  document.getElementById('header-file').value = '';
  if (document.getElementById('toggle-save-settings')?.checked) saveSettingsToStorage();
}

function saveSettingsToStorage() {
  try {
    const settings = {
      headerImg: document.getElementById('header-preview').src || '',
      headerVisible: !document.getElementById('header-preview').classList.contains('hidden'),
      pdfTitle: document.getElementById('pdf-title').value,
      methodology: document.getElementById('methodology').value,
      saveEnabled: true,
    };
    localStorage.setItem('abg_settings', JSON.stringify(settings));
    showSaveConfirmation();
  } catch(e) { console.warn('Save error:', e); }
}

function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem('abg_settings');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.saveEnabled) document.getElementById('toggle-save-settings').checked = true;
    if (s.pdfTitle) document.getElementById('pdf-title').value = s.pdfTitle;
    if (s.methodology) document.getElementById('methodology').value = s.methodology;
    if (s.headerImg && s.headerVisible) applyHeaderPreview(s.headerImg);
  } catch(e) { /* ignore */ }
}

function clearSettingsFromStorage() {
  localStorage.removeItem('abg_settings');
}

function onSaveToggleChange() {
  if (document.getElementById('toggle-save-settings').checked) {
    saveSettingsToStorage();
  } else {
    clearSettingsFromStorage();
  }
}

function showSaveConfirmation() {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = '✅ Salvato';
  el.style.color = 'var(--success)';
  setTimeout(() => { el.textContent = ''; }, 2000);
}
