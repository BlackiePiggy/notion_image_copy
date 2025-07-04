// Notion Clipboard Image Fixer
(function () {
  const REAL_IMG_SELECTOR = 'div[role="figure"] img';
  const FAKE_IMG_SELECTOR = 'img[src$=".png"], img[src$=".jpeg"], img[src$=".jpg"], img[src$=".webp"], img[src$=".gif"], img[src$=".svg"]';

  /**
   * 显示一个自定义的、自动消失的通知提示。
   * @param {string} message - 要显示的提示信息。
   * @param {string} type - 提示类型 ('success', 'error', 'info')，用于不同样式。
   * @param {number} duration - 提示显示的时长（毫秒）。
   */
  function showNotification(message, type = 'info', duration = 3000) {
    // 移除旧的通知，避免重复显示
    const existingNotification = document.getElementById('notion-clipboard-fixer-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notificationDiv = document.createElement('div');
    notificationDiv.id = 'notion-clipboard-fixer-notification';
    notificationDiv.textContent = message;

    // 基本样式
    Object.assign(notificationDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'sans-serif',
      zIndex: '99999',
      opacity: '0', // 初始透明度为0，用于淡入
      transition: 'opacity 0.3s ease-in-out', // 淡入淡出过渡效果
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    });

    // 根据类型设置背景色
    switch (type) {
      case 'success':
        notificationDiv.style.backgroundColor = '#4CAF50'; // 绿色
        break;
      case 'error':
        notificationDiv.style.backgroundColor = '#F44336'; // 红色
        break;
      case 'info':
      default:
        notificationDiv.style.backgroundColor = '#2196F3'; // 蓝色
        break;
    }

    document.body.appendChild(notificationDiv);

    // 强制浏览器重新计算样式，以便过渡效果能生效
    notificationDiv.offsetWidth; // trigger reflow

    // 淡入
    notificationDiv.style.opacity = '1';

    // 自动消失
    setTimeout(() => {
      notificationDiv.style.opacity = '0'; // 淡出
      setTimeout(() => {
        notificationDiv.remove(); // 移除元素
      }, 300); // 等待淡出动画完成再移除
    }, duration);
  }

  async function fixClipboard() {
    showNotification('正在处理图片链接...', 'info', 2000); // 不那么紧急，短时间提示

    try {
      const realUrlPromises = Array.from(document.querySelectorAll(REAL_IMG_SELECTOR))
        .map(async img => {
          const raw = img.getAttribute('src') || '';
          console.log('原始图片 URL:', raw);
          try {
            const response = await fetch(raw);
            console.log('处理后的图片 URL:', response.url);
            return response.url;
          } catch (error) {
            console.error('获取图片 URL 失败:', raw, error);
            return raw;
          }
        });

      const realUrls = await Promise.all(realUrlPromises);

      const clipitem = await navigator.clipboard.read();
      let htmlContent = null;

      for (const item of clipitem) {
        if (item.types.includes('text/html')) {
          const htmlBlob = await item.getType('text/html');
          htmlContent = await htmlBlob.text();
          break;
        }
      }

      console.log('剪贴板中的 HTML 内容:', htmlContent);

      if (!htmlContent) {
        showNotification('剪贴板中没有找到 HTML 内容，无需处理。', 'info', 3000);
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const images = doc.querySelectorAll(FAKE_IMG_SELECTOR);
      images.forEach((img, idx) => {
        if (idx < realUrls.length) {
          const oldSrc = img.getAttribute('src');
          img.setAttribute('src', realUrls[idx]);
          console.log(`替换图片 src: ${oldSrc} -> ${realUrls[idx]}`);
        } else {
          console.warn(`没有足够的 realUrls 替换第 ${idx} 张图片`);
        }
      });


      const updatedHtml = doc.documentElement.outerHTML;
      console.log('更新后的 HTML 内容:', updatedHtml);
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([updatedHtml], { type: 'text/html' })
        })
      ]);

      showNotification('图片链接已成功修复并更新到剪贴板！', 'success', 3000);
      console.info('[Clipboard Image Fixer] Clipboard updated with real image URLs.');

    } catch (e) {
      console.error('[Clipboard Image Fixer] Error:', e);
      showNotification('修复图片链接时发生错误，请检查控制台。', 'error', 5000);
    }
  }

  document.addEventListener('copy', () => setTimeout(fixClipboard, 100));
})();