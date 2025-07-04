// ==UserScript==
// @name         Notion Clipboard Image Fixer (Optimized for Feishu/Lark)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Copies images from Notion and converts them to Data URLs in the clipboard to ensure stable pasting into applications like Feishu/Lark.
// @author       Your Name
// @match        https://www.notion.so/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=notion.so
// ==/UserScript==

(function () {
  'use strict';

  // --- 选择器常量 ---
  // 选择 Notion 页面上实际显示的图片元素
  const REAL_IMG_SELECTOR = 'div[role="figure"] img';
  // 选择剪贴板 HTML 中可能出现的各种格式的图片标签
  const FAKE_IMG_SELECTOR = 'img[src$=".png"], img[src$=".jpeg"], img[src$=".jpg"], img[src$=".webp"], img[src$=".gif"], img[src$=".svg"]';


  // --- 核心辅助函数 ---

  /**
   * 将 Blob 对象转换为 Base64 编码的 Data URL。
   * 这是解决飞书粘贴不问题的关键，它将图片数据直接嵌入HTML。
   * @param {Blob} blob - 图片的 Blob 对象。
   * @returns {Promise<string>} - 返回 Data URL 字符串。
   */
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

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
        if (notificationDiv.parentElement) {
            notificationDiv.remove(); // 移除元素
        }
      }, 300); // 等待淡出动画完成再移除
    }, duration);
  }


  // --- 主要处理函数 ---

  /**
   * 核心函数：修复剪贴板中的图片链接。
   */
  async function fixClipboard() {
    console.log
    showNotification('正在处理图片...', 'info', 2000);

    //先把clipboard内容读取出来
    const clipboardItems = await navigator.clipboard.read(); 
    let htmlContent = null;
      for (const item of clipboardItems) {
        if (item.types.includes('text/html')) {
          const htmlBlob = await item.getType('text/html');
          htmlContent = await htmlBlob.text();
          break;
        }
      }
      console.log('原始剪贴板 HTML 内容:', htmlContent);

    if (!htmlContent) {
      showNotification('剪贴板中未找到 HTML 内容。', 'info', 3000);
      return;
    }

    // 使用 DOMParser 解析 HTML 内容
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    try {
      // 1. 从页面获取所有选定图片的 src，并将其转换为 Data URL
      const dataUrlPromises = Array.from(document.querySelectorAll(REAL_IMG_SELECTOR))
        .map(async (img) => {
          const rawSrc = img.getAttribute('src');
          if (!rawSrc) return null; // 忽略没有 src 的图片

          console.log('原始图片 URL:', rawSrc);
          try {
            const response = await fetch(rawSrc);
            const imageBlob = await response.blob();
            const dataUrl = await blobToDataURL(imageBlob);
            console.log('成功转换为 Data URL');
            return dataUrl;
          } catch (error) {
            console.error('图片获取或转换失败:', rawSrc, error);
            return null; // 失败时返回 null，后续会过滤掉
          }
        });

      const processedUrls = (await Promise.all(dataUrlPromises)).filter(url => url !== null);

      if (processedUrls.length === 0) {
        showNotification('未能成功处理任何图片。', 'info', 3000);
        return;
      }      
      
      // 2. 解析 HTML 并替换图片 src
      const imagesInClipboard = doc.querySelectorAll(FAKE_IMG_SELECTOR);
      
      let replacedCount = 0;
      imagesInClipboard.forEach((img, idx) => {
        if (idx < processedUrls.length) {
          const oldSrc = img.getAttribute('src');
          img.setAttribute('src', processedUrls[idx]);
          console.log(`替换图片 src: ${oldSrc} -> [Data URL]`);
          replacedCount++;
        }
      });

      if (replacedCount === 0) {
        showNotification('未能在剪贴板中匹配到可替换的图片。', 'error', 4000);
        return;
      }
      

      // 3. 将修改后的 HTML 写回剪贴板
      const updatedHtml = doc.documentElement.outerHTML;
      console.log('更新后的剪贴板 HTML 内容:', updatedHtml);
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([updatedHtml], { type: 'text/html' }),
        }),
      ]);

      showNotification(`成功将 ${replacedCount} 个图片嵌入剪贴板！`, 'success', 3000);
      console.info('[Clipboard Image Fixer] Clipboard updated with Base64 Data URLs.');

    } catch (e) {
      console.error('[Clipboard Image Fixer] Error:', e);
      if (e.name === 'NotAllowedError') {
        showNotification('错误：需要剪贴板读写权限！', 'error', 5000);
      } else {
        showNotification('处理时发生未知错误，请检查控制台。', 'error', 5000);
      }
    }
  }


  // --- 事件监听器 ---

  // 监听 'copy' 事件，并使用一个小的延迟来确保浏览器原生复制操作已完成。
  document.addEventListener('copy', () => {
    // 检查是否有选中的内容，避免在无意义的复制操作时触发
        setTimeout(fixClipboard, 100); // 100ms 延迟，比 0 更稳健
  });

  console.log('Notion Clipboard Image Fixer (Optimized) is active.');

})();