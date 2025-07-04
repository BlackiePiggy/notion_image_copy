# Notion Clipboard Image Copy Fixer

<div align="center">

[English](#english) | [中文](#中文)

</div>

---

<a name="english"></a>

## English

A browser extension for Chrome/Edge to fix the issue where images are not included when copying content from Notion pages.

This tool is perfect for anyone who needs to copy entire documents, including rich text formatting and images, from Notion to other editors or note-taking apps. It's especially useful for migrating a large number of documents from Notion to platforms like Lark (Feishu), Microsoft Word, Google Docs, etc.

### Features

-   **Seamless Image Copying**: Automatically handles images during the copy process, ensuring they are not left behind.
-   **Preserves Rich Text Formatting**: Your text styles, lists, headers, and other formatting are kept intact.
-   **Ideal for Migration**: Makes it easy to move your content from Notion to other platforms without losing your embedded images.
-   **Lightweight & Simple**: No complex setup required. Install it and it works automatically in the background.

### How It Works

When you copy content from a Notion page, the images (`<img>` tags) in the clipboard's HTML have `src` attributes pointing to temporary, authenticated URLs on Notion's servers (e.g., `https://www.notion.so/image/...`). These URLs are not directly accessible by other applications when you paste the content, causing the images to appear broken.

This extension intercepts the `copy` event on Notion pages. It finds all such image URLs, fetches the actual image data, converts them into Base64 `data:URL`s, and replaces the original URLs in the clipboard. This embeds the image data directly into the copied content, allowing it to be pasted correctly into any other application.

### Installation

1.  Download this repository as a `.zip` file and unzip it, or clone the repository to your local machine.
2.  Open your Chrome/Edge browser and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** using the toggle switch in the top-right corner.
4.  Click on the **Load unpacked** button.
5.  Select the unzipped folder containing the extension's files.
6.  The extension is now installed and active! You can disable it anytime from the extensions page.

### Usage

1.  Make sure the extension is enabled in `chrome://extensions/`.
2.  Go to any Notion page and copy the content you need (using `Ctrl+C` or `Cmd+C`).
3.  Paste the content into your target application (e.g., Lark, Word, Google Docs). The images will now appear correctly.

### Demos

#### Notion -> Lark (Feishu)

-   **Before using the extension:** Images are missing upon pasting.
    <video src="assets/notion2feishu_before.mp4" controls width="640" height="360">
      Your browser does not support the video tag.
    </video>

-   **After using the extension:** Images and text are pasted correctly.
    <video src="assets/notion2feishu_after.mp4" controls width="640" height="360">
      Your browser does not support the video tag.
    </video>

#### Notion -> Microsoft Word

-   **Before using the extension:** Image placeholders are shown, but the images fail to load.
    ![Notion2word_demo](assets/notion2word_before.mp4)

-   **After using the extension:** Images are embedded perfectly in the document.
    <video src="assets/notion2word_after.mp4" controls width="640" height="360">
      Your browser does not support the video tag.
    </video>

---

<a name="中文"></a>

## 中文

一个 Chrome/Edge 浏览器扩展，用于解决从 Notion 页面复制内容时无法包含图片的问题。

本工具适用于需要将包含富文本格式和图片的完整文档，从 Notion 复制到其他编辑器或笔记软件的场景。它尤其适合用于将大量文档从 Notion 迁移到飞书、Microsoft Word、Google Docs 等平台。

### 功能特性

-   **无缝复制图片**：在复制操作时自动处理图片，确保它们不会丢失。
-   **保留富文本格式**：你的文本样式、列表、标题和其他格式都将保持原样。
-   **为笔记迁移设计**：让您轻松地将内容从 Notion 搬家到其他平台，而不会丢失嵌入的图片。
-   **轻量易用**：无需复杂配置，安装后即可在后台自动运行。

### 工作原理

当您从 Notion 页面复制内容时，剪贴板中 HTML 内容里的图片（`<img>` 标签）其 `src` 属性指向的是 Notion 服务器上的临时授权链接（例如 `https://www.notion.so/image/...`）。当您粘贴到其他应用程序时，这些链接无法被直接访问，从而导致图片显示为破损状态。

本插件通过拦截 Notion 页面的 `copy`（复制）事件来解决这个问题。它会找到所有 Notion 图片链接，异步获取真实的图片数据，然后将其转换为 Base64 `data:URL` 格式，并替换剪贴板中原有的链接。这样，图片数据就被直接嵌入到了复制的内容中，从而确保它可以被正确地粘贴到任何其他应用程序里。

### 安装步骤

1.  下载本仓库的 `.zip` 压缩包并解压，或者使用 git 将本仓库克隆到本地。
2.  打开 Chrome/Edge 浏览器，在地址栏输入并访问 `chrome://extensions/`。
3.  在页面右上角，打开 **“开发者模式”** 的开关。
4.  点击 **“加载已解压的扩展程序”** 按钮。
5.  在弹出的窗口中，选择刚刚解压好的扩展程序文件夹。
6.  安装完成！插件现在已经启用，您可以随时在扩展管理页面禁用它。

### 使用方法

1.  确保插件已在 `chrome://extensions/` 页面中启用。
2.  打开任意 Notion 页面，像平常一样复制您需要的内容（使用 `Ctrl+C` 或 `Cmd+C`）。
3.  将内容粘贴到您的目标应用程序（如飞书、Word、Google Docs）中，图片即可正常显示。

### 效果演示

#### Notion -> 飞书 (Lark)

-   **使用插件前**：粘贴后图片丢失。
    <video src="assets/notion2feishu_before.mp4" controls width="640" height="360">
      您的浏览器不支持视频播放。
    </video>

-   **使用插件后**：图片和文本被正确粘贴。
    <video src="assets/notion2feishu_after.mp4" controls width="640" height="360">
      您的浏览器不支持视频播放。
    </video>

#### Notion -> Microsoft Word

-   **使用插件前**：显示图片占位符，但图片加载失败。
    <video src="assets/notion2word_before.mp4" controls width="640" height="360">
      您的浏览器不支持视频播放。
    </video>

-   **使用插件后**：图片被完美嵌入文档中。
    <video src="assets/notion2word_after.mp4" controls width="640" height="360">
      您的浏览器不支持视频播放。
    </video>