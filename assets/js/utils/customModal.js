(function() {
  // Styles inline for additional type icons, layouts, etc.
  const style = document.createElement('style');
  style.innerHTML = `
    .custom-dialog-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
      animation: customFadeIn 0.2s ease-out;
    }
    .custom-dialog-box {
      background-color: var(--bg-surface, #ffffff);
      border-radius: var(--radius-md, 8px);
      box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
      width: 440px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: customSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes customFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes customSlideIn {
      from { transform: translateY(15px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .custom-dialog-header {
      padding: 1.25rem 1.5rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .custom-dialog-icon {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-dialog-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      margin: 0;
      flex: 1;
    }
    .custom-dialog-body {
      padding: 0.5rem 1.5rem 1.25rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #475569);
      line-height: 1.5;
      white-space: pre-wrap;
      max-height: 50vh;
      overflow-y: auto;
    }
    .custom-dialog-input-container {
      margin-top: 0.75rem;
    }
    .custom-dialog-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 4px;
      font-size: 0.875rem;
      outline: none;
      background: var(--bg-surface, #fff);
      color: var(--text-primary, #000);
      box-sizing: border-box;
    }
    .custom-dialog-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .custom-dialog-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background-color: var(--bg-surface-elevated, #f8fafc);
    }
    .custom-dialog-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 4px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      outline: none;
    }
    .custom-dialog-btn-primary {
      background-color: #2563eb;
      color: #ffffff;
    }
    .custom-dialog-btn-primary:hover {
      background-color: #1d4ed8;
    }
    .custom-dialog-btn-primary:focus {
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.4);
    }
    .custom-dialog-btn-secondary {
      background-color: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }
    .custom-dialog-btn-secondary:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
    .custom-dialog-btn-secondary:focus {
      box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.3);
    }
    .custom-dialog-btn-danger {
      background-color: #ef4444;
      color: #ffffff;
    }
    .custom-dialog-btn-danger:hover {
      background-color: #dc2626;
    }
    .custom-dialog-btn-danger:focus {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
    }
  `;
  document.head.appendChild(style);

  // Helper for dialog icons and titles based on message content
  function getDialogMeta(type, message) {
    let icon = 'ℹ️';
    let title = 'Information';
    let btnClass = 'custom-dialog-btn-primary';
    
    const msgLower = (message || '').toLowerCase();
    
    if (type === 'confirm' || type === 'prompt') {
      icon = '❓';
      title = 'Confirm Action';
      if (msgLower.includes('warning') || msgLower.includes('danger') || msgLower.includes('delete') || msgLower.includes('remove') || msgLower.includes('cancel') || msgLower.includes('abort') || msgLower.includes('void')) {
        icon = '⚠️';
        title = 'Warning';
        btnClass = 'custom-dialog-btn-danger';
      }
    } else { // alert
      if (msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('blocked') || msgLower.includes('invalid') || msgLower.includes('mandatory') || msgLower.includes('required') || msgLower.includes('permanent deferral')) {
        icon = '❌';
        title = 'Error';
        btnClass = 'custom-dialog-btn-danger';
      } else if (msgLower.includes('warning') || msgLower.includes('attention') || msgLower.includes('caution')) {
        icon = '⚠️';
        title = 'Warning';
        btnClass = 'custom-dialog-btn-primary';
      } else if (msgLower.includes('success') || msgLower.includes('done') || msgLower.includes('complete') || msgLower.includes('verified') || msgLower.includes('saved')) {
        icon = '✅';
        title = 'Success';
        btnClass = 'custom-dialog-btn-primary';
      }
    }
    return { icon, title, btnClass };
  }

  function showDialog(type, message, defaultValue = '') {
    return new Promise((resolve) => {
      const meta = getDialogMeta(type, message);
      
      const overlay = document.createElement('div');
      overlay.className = 'custom-dialog-overlay';
      
      let inputHTML = '';
      if (type === 'prompt') {
        inputHTML = `
          <div class="custom-dialog-input-container">
            <input type="text" class="custom-dialog-input" id="custom-dialog-input-field" value="${defaultValue}" autocomplete="off" />
          </div>
        `;
      }
      
      let footerHTML = '';
      if (type === 'alert') {
        footerHTML = `<button class="custom-dialog-btn ${meta.btnClass}" id="custom-dialog-btn-ok">OK</button>`;
      } else if (type === 'confirm') {
        footerHTML = `
          <button class="custom-dialog-btn custom-dialog-btn-secondary" id="custom-dialog-btn-cancel">Cancel</button>
          <button class="custom-dialog-btn ${meta.btnClass}" id="custom-dialog-btn-ok">Confirm</button>
        `;
      } else if (type === 'prompt') {
        footerHTML = `
          <button class="custom-dialog-btn custom-dialog-btn-secondary" id="custom-dialog-btn-cancel">Cancel</button>
          <button class="custom-dialog-btn ${meta.btnClass}" id="custom-dialog-btn-ok">Submit</button>
        `;
      }
      
      overlay.innerHTML = `
        <div class="custom-dialog-box" role="dialog" aria-modal="true" aria-labelledby="custom-dialog-title">
          <div class="custom-dialog-header">
            <span class="custom-dialog-icon">${meta.icon}</span>
            <h4 class="custom-dialog-title" id="custom-dialog-title">${meta.title}</h4>
          </div>
          <div class="custom-dialog-body">
            <div class="custom-dialog-message-text">${message}</div>
            ${inputHTML}
          </div>
          <div class="custom-dialog-footer">
            ${footerHTML}
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const inputField = overlay.querySelector('#custom-dialog-input-field');
      const okBtn = overlay.querySelector('#custom-dialog-btn-ok');
      const cancelBtn = overlay.querySelector('#custom-dialog-btn-cancel');
      
      // Auto-focus logic
      if (inputField) {
        inputField.focus();
        inputField.select();
      } else if (okBtn) {
        okBtn.focus();
      }
      
      // Focus trapping
      const focusableElements = Array.from(overlay.querySelectorAll('button, input'));
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      function handleKeyDown(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
              e.preventDefault();
            }
          }
        } else if (e.key === 'Escape') {
          close(type === 'alert' ? undefined : (type === 'confirm' ? false : null));
        } else if (e.key === 'Enter') {
          if (type === 'prompt') {
            close(inputField.value);
          } else if (type === 'confirm') {
            close(true);
          } else {
            close(undefined);
          }
          e.preventDefault();
        }
      }
      
      overlay.addEventListener('keydown', handleKeyDown);
      
      function close(value) {
        overlay.removeEventListener('keydown', handleKeyDown);
        overlay.remove();
        resolve(value);
      }
      
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          if (type === 'prompt') {
            close(inputField.value);
          } else if (type === 'confirm') {
            close(true);
          } else {
            close(undefined);
          }
        });
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          close(type === 'confirm' ? false : null);
        });
      }
    });
  }

  // Set global helpers
  window.customAlert = (msg) => showDialog('alert', msg);
  window.customConfirm = (msg) => showDialog('confirm', msg);
  window.customPrompt = (msg, def) => showDialog('prompt', msg, def);
  
  // Overrides
  window.alert = window.customAlert;
  // Overriding confirm and prompt globally in case of unrefactored calls or dynamic scripts.
  // Warning: synchronous execution calling window.confirm/window.prompt will not block
  // but we override them to return safe values, and we explicitly refactor the key callers to use customConfirm/customPrompt with await.
  window.confirm = function(msg) {
    console.warn("Synchronous confirm() overridden with custom modal popup.", msg);
    window.customConfirm(msg);
    return true; 
  };
  window.prompt = function(msg, def) {
    console.warn("Synchronous prompt() overridden with custom modal popup.", msg);
    window.customPrompt(msg, def);
    return def || '';
  };
})();
