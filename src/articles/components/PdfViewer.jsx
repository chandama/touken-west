import React, { useState } from 'react';

function PdfViewer({ url, filename }) {
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  // Google Docs viewer as fallback for browsers with poor PDF support
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  const handleIframeError = () => {
    setUseGoogleViewer(true);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <button
          onClick={() => window.open(url, '_blank')}
          className="btn-secondary"
        >
          Open in New Tab
        </button>
        <a
          href={url}
          download={filename}
          className="btn-primary"
        >
          Download PDF
        </a>
        <button
          onClick={() => setUseGoogleViewer(!useGoogleViewer)}
          className="btn-secondary"
        >
          {useGoogleViewer ? 'Use Browser Viewer' : 'Use Google Viewer'}
        </button>
      </div>

      <div className="pdf-embed">
        {useGoogleViewer ? (
          <iframe
            src={googleViewerUrl}
            title="PDF Viewer (Google)"
            className="pdf-iframe"
          />
        ) : (
          <iframe
            src={url}
            title="PDF Viewer"
            className="pdf-iframe"
            onError={handleIframeError}
          />
        )}
      </div>

      <div className="pdf-fallback">
        <p>Having trouble viewing? <a href={url} download={filename}>Download the PDF</a> to view offline.</p>
      </div>
    </div>
  );
}

export default PdfViewer;
