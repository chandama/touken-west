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

// Image Insert Modal Component
function ImageInsertModal({ isOpen, onClose, onInsert, imageUrl }) {
  const [size, setSize] = useState('medium');
  const [caption, setCaption] = useState('');

  if (!isOpen) return null;

  const handleInsert = () => {
    onInsert({ url: imageUrl, size, caption });
    setSize('medium');
    setCaption('');
    onClose();
  };

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal" onClick={e => e.stopPropagation()}>
        <h3>Insert Image</h3>

        <div className="image-preview">
          <img src={imageUrl} alt="Preview" />
        </div>

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
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleInsert} className="btn-primary">
            Insert Image
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

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  const addImage = async () => {
    let url;
    if (onImageUpload) {
      url = await onImageUpload();
    } else {
      url = prompt('Enter image URL:');
    }

    if (url) {
      setPendingImageUrl(url);
      setShowImageModal(true);
    }
  };

  const handleImageInsert = ({ url, size, caption }) => {
    // Use figure/figcaption for proper semantic structure and width matching
    // No whitespace between tags to avoid extra paragraph nodes
    const figureHtml = caption
      ? `<figure class="article-figure figure-${size}" data-size="${size}"><img src="${url}" alt="${caption}" class="article-image" data-size="${size}" data-caption="${caption}" /><figcaption>${caption}</figcaption></figure>`
      : `<figure class="article-figure figure-${size}" data-size="${size}"><img src="${url}" alt="" class="article-image" data-size="${size}" data-caption="" /></figure>`;

    editor.chain().focus().insertContent(figureHtml).run();
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
        }}
        onInsert={handleImageInsert}
        imageUrl={pendingImageUrl}
      />
    </div>
  );
});

export default WysiwygEditor;
