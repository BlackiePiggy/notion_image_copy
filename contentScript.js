
// Notion Clipboard Image Fixer
(function () {
  const REAL_IMG_SELECTOR = 'div[role="figure"] img';
  // FAKE_IMG_SELECTOR 示例链接：<p><img src="https://prod-files-secure.s3.us-west-2.amazonaws.com/3f8f4a63-3df1-478e-ac46-65fe7d00adc5/10254f54-8f72-4810-8118-54d17c710a42/Untitled.png" alt="Untitled"></p>
  const FAKE_IMG_SELECTOR = 'img[src$=".png"]';
  const MD_IMG_REGEX = /!\[(.*?)\]\(([^)]+\/([^\/?#]+\.(?:png|jpe?g|gif)))\)/g;

  async function fixClipboard() {
    try {
      const realUrlPromises = Array.from(document.querySelectorAll(REAL_IMG_SELECTOR))
        .map(async img => {
          const raw = img.getAttribute('src') || '';
          console.log('原始图片 URL:', raw);
          response = await fetch(raw, { method: 'HEAD' });
          console.log('处理后的图片 URL:', response.url);
          return response.url;
        });

      // 等待所有真实图片 URL 获取完毕
      const realUrls = await Promise.all(realUrlPromises);

      const clipitem = await navigator.clipboard.read();
      let htmlContent = null;

      for (const item of clipitem) {
        if (item.types.includes('text/html')) {
          const htmlBlob = await item.getType('text/html');
          htmlContent = await htmlBlob.text();
          break; // 找到 HTML 内容后即可退出循环
        }
      }
      console.log('原始剪贴板 HTML 内容:', htmlContent);

      // 2. 解析 HTML 字符串为 DOM 对象
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      console.log('解析后的 DOM 对象:', doc);

      // 3. 查找所有图片元素并替换 src
      const images = doc.querySelectorAll(FAKE_IMG_SELECTOR);
      console.log('找到的图片元素:', images);
      //把找到的图片元素的src依次替换为 realUrls 中的 URL
      images.forEach((img, idx) => {
        if (idx < realUrls.length) {
          const oldSrc = img.getAttribute('src');
          img.setAttribute('src', realUrls[idx]);
          console.log(`替换图片 src: ${oldSrc} -> ${realUrls[idx]}`);
        } else {
          console.warn(`没有足够的 realUrls 替换第 ${idx} 张图片`);
        }
      });
      //输出替换后的 HTML 内容
      console.log('更新后的 HTML 内容:', doc);

      // 4. 将更新后的 DOM 对象转换回 HTML 字符串
      const updatedHtml = doc.documentElement.outerHTML;
      console.log('转换后的 HTML 字符串:', updatedHtml);
      // 5. 将更新后的 HTML 写回剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([updatedHtml], { type: 'text/html' })
        })
      ]);
      console.info('[Clipboard Image Fixer] Clipboard updated with real image URLs.'); 
    } catch (e) {
      console.error('[Clipboard Image Fixer] Error:', e);
    }
  }

  document.addEventListener('copy', () => setTimeout(fixClipboard, 0));
})();
