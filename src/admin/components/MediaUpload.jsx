import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const CATEGORIES = [
  'Full Blade',
  'Hamon Detail',
  'Tang (Nakago)',
  'Signature (Mei)',
  'Hada (Grain Pattern)',
  'Boshi (Tip Temper Line)',
  'Kissaki (Tip)',
  'Certificate / Papers',
  'Sayagaki',
  'Articles',
  'Mounting (Koshirae)',
  'Habaki',
  'Tsuba (Guard)',
  'Menuki (Ornaments)',
  'Fuchi-Kashira (Fittings)',
  'Other',
];

function MediaUpload({ swordIndex, onUploadComplete }) {
  const [category, setCategory] = useState('Full Blade');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('caption', caption);
    formData.append('tags', tags);

    try {
      const response = await axios.post(`${API_BASE}/swords/${swordIndex}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setUploadProgress('Upload successful!');
        setTimeout(() => setUploadProgress(''), 2000);

        // Clear form
        setCaption('');
        setTags('');

        // Notify parent
        if (onUploadComplete) {
          onUploadComplete(response.data.sword);
        }
      } else {
        setUploadProgress('Upload failed: ' + response.data.error);
      }
    } catch (error) {
      setUploadProgress('Upload error: ' + (error.response?.data?.error || error.message));
    } finally {
      setTimeout(() => setUploading(false), 2000);
    }
  }, [swordIndex, category, caption, tags, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="media-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${uploading ? 'dropzone-disabled' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="dropzone-uploading">
            <div className="spinner"></div>
            <p>{uploadProgress}</p>
          </div>
        ) : isDragActive ? (
          <p className="dropzone-text">Drop file here...</p>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">📁</div>
            <p className="dropzone-text">Drag & drop a file here, or click to browse</p>
            <p className="dropzone-hint">JPG or PDF files only • Max 15MB</p>
          </div>
        )}
      </div>

      <div className="upload-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="caption">Caption:</label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Brief description (optional)"
              disabled={uploading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tags">Tags:</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated: hamon, detail, close-up"
              disabled={uploading}
            />
          </div>
        </div>

        <div className="form-hint">
          Fill out category, caption, and tags before uploading a file
        </div>
      </div>
    </div>
  );
}

export default MediaUpload;
