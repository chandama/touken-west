import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import './WysiwygEditor.css';

// Extend Image to support data-size and data-caption attributes
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-size': {
        default: 'medium',
        parseHTML: element => element.getAttribute('data-size'),
        renderHTML: attributes => {
          if (!attributes['data-size']) return {};
          return { 'data-size': attributes['data-size'] };
        },
      },
      'data-caption': {
        default: '',
        parseHTML: element => element.getAttribute('data-caption'),
        renderHTML: attributes => {
          if (!attributes['data-caption']) return {};
          return { 'data-caption': attributes['data-caption'] };
        },
      },
      class: {
        default: 'article-image',
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

// Image Insert/Edit Modal Component
function ImageInsertModal({ isOpen, onClose, onInsert, onUpdate, imageUrl: initialUrl, initialSize, initialCaption, isEditMode }) {
  // Only allow http, https, or data:image/ urls for image src
  function isSafeImageUrl(url) {
    return /^(https?:\/\/|data:image\/)/i.test(url.trim());
  }
  const [url, setUrl] = useState(initialUrl || '');
  const [size, setSize] = useState(initialSize || 'medium');
  const [caption, setCaption] = useState(initialCaption || '');
  const [urlError, setUrlError] = useState(false);

  // Update fields when props change (e.g., opening modal for edit)
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '');
      setSize(initialSize || 'medium');
      setCaption(initialCaption || '');
      setUrlError(false);
    }
  }, [isOpen, initialUrl, initialSize, initialCaption]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!url.trim()) {
      setUrlError(true);
      return;
    }
    if (isEditMode) {
      onUpdate({ url: url.trim(), size, caption });
    } else {
      onInsert({ url: url.trim(), size, caption });
    }
    setUrl('');
    setSize('medium');
    setCaption('');
    setUrlError(false);
    onClose();
  };

  const handleClose = () => {
    setUrl('');
    setSize('medium');
    setCaption('');
    setUrlError(false);
    onClose();
  };

  return (
    <div className="image-modal-overlay" onClick={handleClose}>
      <div className="image-modal" onClick={e => e.stopPropagation()}>
        <h3>{isEditMode ? 'Edit Image' : 'Insert Image'}</h3>

        <div className="image-modal-field">
          <label>Image URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError(false);
            }}
            placeholder="https://... or paste existing image URL"
            style={urlError ? { borderColor: '#dc2626' } : {}}
          />
          {urlError && (
            <small style={{ color: '#dc2626' }}>Please enter an image URL</small>
          )}
          <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
            Paste a URL to reuse an existing image, or upload a new one from the toolbar
          </small>
        </div>

        {url && isSafeImageUrl(url) && (
          <div className="image-preview">
            <img
              src={url}
              alt="Preview"
              onError={(e) => e.target.style.display = 'none'}
              onLoad={(e) => e.target.style.display = 'block'}
            />
          </div>
        )}
        {url && !isSafeImageUrl(url) && (
          <div className="image-preview">
            <small style={{ color: '#dc2626' }}>
              Please enter a valid image URL (http, https, or data:image/).
            </small>
          </div>
        )}

        <div className="image-modal-field">
          <label>Size</label>
          <div className="size-options">
            <label className={`size-option ${size === 'small' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="size"
                value="small"
                checked={size === 'small'}
                onChange={(e) => setSize(e.target.value)}
              />
              <span>Small</span>
              <small>25% width</small>
            </label>
            <label className={`size-option ${size === 'medium' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="size"
                value="medium"
                checked={size === 'medium'}
                onChange={(e) => setSize(e.target.value)}
              />
              <span>Medium</span>
              <small>50% width</small>
            </label>
            <label className={`size-option ${size === 'large' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="size"
                value="large"
                checked={size === 'large'}
                onChange={(e) => setSize(e.target.value)}
              />
              <span>Large</span>
              <small>75% width</small>
            </label>
            <label className={`size-option ${size === 'full' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="size"
                value="full"
                checked={size === 'full'}
                onChange={(e) => setSize(e.target.value)}
              />
              <span>Full</span>
              <small>100% width</small>
            </label>
          </div>
        </div>

        <div className="image-modal-field">
          <label>Caption (optional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter image caption..."
          />
        </div>

        <div className="image-modal-actions">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary" disabled={!url.trim()}>
            {isEditMode ? 'Update Image' : 'Insert Image'}
          </button>
        </div>
      </div>
    </div>
  );
}

const WysiwygEditor = forwardRef(function WysiwygEditor({ content, onChange, onImageUpload }, ref) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState(null);
  const [currentFont, setCurrentFont] = useState('');
  const [, setSelectionUpdate] = useState(0); // Forces re-render on selection change
  const [editorStats, setEditorStats] = useState({
    line: 1,
    column: 1,
    selectedChars: 0,
    totalChars: 0,
    selectedWords: 0,
    totalWords: 0,
  });
  // Image editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingImageData, setEditingImageData] = useState({ url: '', size: 'medium', caption: '' });
  const [editingImageElement, setEditingImageElement] = useState(null);

  // Calculate editor statistics
  const updateEditorStats = (editor) => {
    if (!editor) return;

    const { state } = editor;
    const { from, to } = state.selection;

    // Get total text content
    const totalText = editor.getText();
    const totalChars = totalText.length;
    const totalWords = totalText.trim() ? totalText.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Get selected text
    const selectedText = state.doc.textBetween(from, to, ' ');
    const selectedChars = selectedText.length;
    const selectedWords = selectedText.trim() ? selectedText.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Calculate line and column from cursor position
    let line = 1;
    let column = 1;
    let pos = 0;
    const docText = editor.getText();

    // Count newlines before cursor position to get line number
    for (let i = 0; i < Math.min(from, docText.length); i++) {
      if (docText[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    setEditorStats({
      line,
      column,
      selectedChars,
      totalChars,
      selectedWords,
      totalWords,
    });
  };

  // Expose method to open image modal with a specific URL (for gallery insert)
  useImperativeHandle(ref, () => ({
    openImageModal: (url) => {
      setPendingImageUrl(url);
      setShowImageModal(true);
    }
  }));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4]
        }
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle']
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Update current font when selection changes
      const fontFamily = editor.getAttributes('textStyle').fontFamily || '';
      setCurrentFont(fontFamily);
      // Force re-render to update all formatting button states
      setSelectionUpdate(n => n + 1);
      // Update editor statistics
      updateEditorStats(editor);
    },
    onTransaction: ({ editor }) => {
      // Also update on transactions (typing, formatting changes)
      const fontFamily = editor.getAttributes('textStyle').fontFamily || '';
      setCurrentFont(fontFamily);
      setSelectionUpdate(n => n + 1);
      updateEditorStats(editor);
    },
  });

  // Update editor content when prop changes (e.g., initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Add click handler for images to enable editing
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;

    const handleImageClick = (e) => {
      // Check if clicked on an image or figure
      const img = e.target.closest('img.article-image');
      const figure = e.target.closest('figure.article-figure');

      if (img || figure) {
        e.preventDefault();
        e.stopPropagation();

        const targetImg = img || figure?.querySelector('img');
        const targetFigure = figure || img?.closest('figure');

        if (targetImg) {
          // Extract current image data
          const url = targetImg.getAttribute('src') || '';
          const size = targetImg.getAttribute('data-size') || targetFigure?.getAttribute('data-size') || 'medium';

          // Try to find caption from multiple sources:
          // 1. data-caption attribute on image
          // 2. figcaption inside figure (old format)
          // 3. Following paragraph with image-caption class
          // 4. Following paragraph (might be caption)
          let caption = targetImg.getAttribute('data-caption') || '';

          if (!caption && targetFigure) {
            const figcaption = targetFigure.querySelector('figcaption');
            if (figcaption) {
              caption = figcaption.textContent || '';
            }
          }

          // Check for caption paragraph after image/figure
          if (!caption) {
            const elementToCheck = targetFigure || targetImg;
            const nextSibling = elementToCheck.nextElementSibling;
            if (nextSibling && nextSibling.tagName === 'P') {
              if (nextSibling.classList.contains('image-caption')) {
                caption = nextSibling.textContent || '';
              }
            }
          }

          setEditingImageData({ url, size, caption });
          setEditingImageElement(targetFigure || targetImg);
          setIsEditMode(true);
          setShowImageModal(true);
        }
      }
    };

    editorElement.addEventListener('click', handleImageClick);

    return () => {
      editorElement.removeEventListener('click', handleImageClick);
    };
  }, [editor]);

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  // Handle updating an existing image
  const handleImageUpdate = ({ url, size, caption }) => {
    if (!editingImageElement) return;

    // Utility to escape HTML special characters to prevent XSS
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "&#96;");
    }

    const escapedUrl = escapeHtml(url);
    const escapedSize = escapeHtml(size);
    const escapedCaption = escapeHtml(caption);

    // Create new image HTML (simple structure TipTap handles well)
    const newImageHtml = `<img src="${escapedUrl}" alt="${escapedCaption}" class="article-image" data-size="${escapedSize}" data-caption="${escapedCaption}" />`;
    const newCaptionHtml = caption ? `<p class="image-caption">${escapedCaption}</p>` : '';

    // Find and replace the old figure/image in the editor
    const currentHtml = editor.getHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentHtml;

    const originalUrl = editingImageData.url;
    const originalCaption = editingImageData.caption;
    let replaced = false;

    // Helper function to remove caption-like paragraphs after an element
    const removeFollowingCaptions = (element) => {
      let nextSibling = element.nextElementSibling;
      // Remove any paragraphs that look like captions (matching old caption, has image-caption class, or follows figure)
      while (nextSibling && nextSibling.tagName === 'P') {
        const paragraphText = nextSibling.textContent.trim();
        const hasImageCaptionClass = nextSibling.classList.contains('image-caption');
        const matchesOldCaption = paragraphText === originalCaption;

        if (hasImageCaptionClass || matchesOldCaption) {
          const toRemove = nextSibling;
          nextSibling = nextSibling.nextElementSibling;
          toRemove.remove();
        } else {
          break;
        }
      }
    };

    // First, handle old figure-based images (convert to new format)
    const figures = tempDiv.querySelectorAll('figure.article-figure');
    figures.forEach(fig => {
      const img = fig.querySelector('img');
      if (img && img.getAttribute('src') === originalUrl && !replaced) {
        // Remove any duplicate caption paragraphs after the figure
        removeFollowingCaptions(fig);

        // Create replacement content
        const wrapper = document.createElement('div');
        wrapper.innerHTML = newImageHtml + newCaptionHtml;

        // Replace figure with new image (and caption if present)
        const newImg = wrapper.querySelector('img');
        const newCaption = wrapper.querySelector('p');

        fig.replaceWith(newImg);
        if (newCaption) {
          newImg.insertAdjacentElement('afterend', newCaption);
        }
        replaced = true;
      }
    });

    // Then handle standalone images
    if (!replaced) {
      const standaloneImages = tempDiv.querySelectorAll('img.article-image');
      standaloneImages.forEach(img => {
        if (img.getAttribute('src') === originalUrl && !replaced) {
          // Remove any caption paragraphs after the image
          removeFollowingCaptions(img);

          // Update image attributes
          img.setAttribute('src', escapedUrl);
          img.setAttribute('alt', escapedCaption);
          img.setAttribute('data-size', escapedSize);
          img.setAttribute('data-caption', escapedCaption);

          // Add new caption if needed
          if (caption) {
            const captionP = document.createElement('p');
            captionP.className = 'image-caption';
            captionP.textContent = caption;
            img.insertAdjacentElement('afterend', captionP);
          }
          replaced = true;
        }
      });
    }

    if (replaced) {
      editor.commands.setContent(tempDiv.innerHTML);
    }

    // Reset edit state
    setEditingImageElement(null);
    setEditingImageData({ url: '', size: 'medium', caption: '' });
    setIsEditMode(false);
  };

  const addImage = async () => {
    // Reset edit mode when adding a new image
    setIsEditMode(false);
    setEditingImageData({ url: '', size: 'medium', caption: '' });
    setEditingImageElement(null);

    let url = null;
    if (onImageUpload) {
      url = await onImageUpload();
    }
    // Always open modal - user can paste URL if they cancelled upload or want to reuse existing
    setPendingImageUrl(url || '');
    setShowImageModal(true);
  };

  const handleImageInsert = ({ url, size, caption }) => {
    // Use image with data attributes, followed by a caption paragraph if needed
    // TipTap doesn't support figure/figcaption natively, so we use a simpler structure
    const imageHtml = `<img src="${url}" alt="${caption || ''}" class="article-image" data-size="${size}" data-caption="${caption || ''}" />`;
    const captionHtml = caption ? `<p class="image-caption">${caption}</p>` : '';

    editor.chain().focus().insertContent(imageHtml + captionHtml).run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="wysiwyg-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <select
            className="font-select"
            value={currentFont}
            onChange={(e) => {
              const newFont = e.target.value;
              setCurrentFont(newFont);
              if (newFont) {
                editor.chain().focus().setFontFamily(newFont).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
            title="Font Family"
          >
            <option value="">Default (Sans)</option>
            <option value="Georgia, serif">Serif</option>
            <option value="Times New Roman, serif">Times</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive('heading', { level: 4 }) ? 'active' : ''}
            title="Heading 4"
          >
            H4
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Bullet List"
          >
            &#8226; List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'active' : ''}
            title="Quote"
          >
            &ldquo; Quote
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
            title="Align Left"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
            title="Align Center"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
            title="Align Right"
          >
            Right
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={addImage}
            title="Insert Image"
          >
            Image
          </button>
          <button
            type="button"
            onClick={addLink}
            className={editor.isActive('link') ? 'active' : ''}
            title="Add/Edit Link"
          >
            Link
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            &mdash;
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            Redo
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-statusbar">
        <span className="status-item">
          Ln {editorStats.line}, Col {editorStats.column}
        </span>
        <span className="status-item">
          {editorStats.selectedChars > 0
            ? `${editorStats.selectedChars.toLocaleString()}/${editorStats.totalChars.toLocaleString()} chars`
            : `${editorStats.totalChars.toLocaleString()} chars`}
        </span>
        <span className="status-item">
          {editorStats.selectedWords > 0
            ? `${editorStats.selectedWords.toLocaleString()}/${editorStats.totalWords.toLocaleString()} words`
            : `${editorStats.totalWords.toLocaleString()} words`}
        </span>
      </div>

      <ImageInsertModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setPendingImageUrl(null);
          setIsEditMode(false);
          setEditingImageData({ url: '', size: 'medium', caption: '' });
          setEditingImageElement(null);
        }}
        onInsert={handleImageInsert}
        onUpdate={handleImageUpdate}
        imageUrl={isEditMode ? editingImageData.url : pendingImageUrl}
        initialSize={isEditMode ? editingImageData.size : 'medium'}
        initialCaption={isEditMode ? editingImageData.caption : ''}
        isEditMode={isEditMode}
      />
    </div>
  );
});

export default WysiwygEditor;
