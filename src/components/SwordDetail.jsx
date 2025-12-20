import React from 'react';

/**
 * SwordDetail component for displaying detailed information about a selected sword
 */
const SwordDetail = ({ sword, onClose, user }) => {
  const [lightboxImage, setLightboxImage] = React.useState(null);

  if (!sword) return null;

  // Helper function to check if media should be restricted
  const isRestrictedMedia = (tags) => {
    if (!tags || !Array.isArray(tags)) return false;

    const restrictedTags = ['juyo', 'juyo bijutsuhin', 'tokubetsu juyo'];
    return tags.some(tag =>
      restrictedTags.includes(tag.toLowerCase().trim())
    );
  };

  // Check if user is logged in
  const isLoggedIn = !!user;

  // Check if user can access media (subscriber, editor, or admin)
  const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];
  const canAccessMedia = user && ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf('subscriber');

  const DetailRow = ({ label, value }) => {
    if (!value || value === 'NA' || value === '') return null;

    return (
      <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{value}</span>
      </div>
    );
  };

  return (
    <div className="sword-detail-overlay" onClick={onClose}>
      <div className="sword-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>Sword Details</h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="detail-content">
          {sword.isMeito && (
            <div className="detail-section meito-section">
              <div className="meito-header">
                <span className="meito-badge">★ Meito</span>
                <span className="meito-label">Famous Named Sword</span>
              </div>
              <div className="meito-name">{sword.meitoName}</div>
            </div>
          )}

          <div className="detail-section">
            <h3>Basic Information</h3>
            <DetailRow label="Index" value={sword.Index} />
            <DetailRow label="Type" value={sword.Type} />
            <DetailRow label="School" value={sword.School} />
            <DetailRow label="Smith" value={sword.Smith} />
            <DetailRow label="Mei (Signature)" value={sword.Mei} />
          </div>

          <div className="detail-section">
            <h3>Dimensions</h3>
            <DetailRow label="Nagasa (Length)" value={sword.Nagasa ? `${sword.Nagasa} cm` : null} />
            <DetailRow label="Sori (Curvature)" value={sword.Sori ? `${sword.Sori} cm` : null} />
            <DetailRow label="Moto (Width at base)" value={sword.Moto ? `${sword.Moto} cm` : null} />
            <DetailRow label="Saki (Width at tip)" value={sword.Saki ? `${sword.Saki} cm` : null} />
          </div>

          <div className="detail-section">
            <h3>Tang (Nakago)</h3>
            <DetailRow label="Condition" value={sword.Nakago} />
            <DetailRow label="Mekugi-ana (Holes)" value={sword.Ana} />
            <DetailRow label="Length" value={sword.Length ? `${sword.Length} cm` : null} />
            <DetailRow label="Engravings" value={sword.Hori} />
          </div>

          <div className="detail-section">
            <h3>Historical Context</h3>
            <DetailRow label="Province" value={sword.Province} />
            <DetailRow label="Period" value={sword.Period} />
            <DetailRow label="Authentication" value={sword.Authentication} />
          </div>

          {sword.Description && sword.Description !== 'NA' && (
            <div className="detail-section">
              <h3>Description</h3>
              <p className="description-text">{sword.Description}</p>
            </div>
          )}

          {sword.MediaAttachments && sword.MediaAttachments !== '' && sword.MediaAttachments !== 'NA' && (
            <div className="detail-section">
              <h3>Media Attachments</h3>
              {!canAccessMedia ? (
                <div className="media-restricted-notice">
                  <p>Media attachments are available to subscribers only.</p>
                  {isLoggedIn ? (
                    <a href="/account/subscription" className="upgrade-link">
                      Upgrade to Subscriber
                    </a>
                  ) : (
                    <button onClick={() => {}} className="login-prompt-link">
                      Log in or subscribe to view media
                    </button>
                  )}
                </div>
              ) : (
                <div className="media-attachments">
                  {(() => {
                    try {
                      const parsed = JSON.parse(sword.MediaAttachments);

                      if (parsed.length === 0) {
                        return null;
                      }

                      return parsed.map((item, index) => {
                        // Handle both old format (string) and new format (object)
                        const filePath = typeof item === 'string' ? item : item.url;
                        const thumbnailPath = typeof item === 'object' ? item.thumbnailUrl : null;
                        const caption = typeof item === 'object' ? item.caption : null;
                        const category = typeof item === 'object' ? item.category : null;
                        const tags = typeof item === 'object' ? item.tags : null;

                        const lowerPath = filePath.toLowerCase();
                        const isImage = lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.png');
                        const isPdf = lowerPath.endsWith('.pdf');
                        const fileName = filePath.split('/').pop();

                        return (
                          <div key={index} className="media-item">
                            {category && <div className="media-category">{category}</div>}
                            <div className="media-label">{caption || fileName}</div>
                            {isImage && (
                              <img
                                src={thumbnailPath || filePath}
                                alt={caption || fileName}
                                className="media-image"
                                loading="lazy"
                                onClick={() => setLightboxImage(filePath)}
                                style={{ cursor: 'pointer' }}
                                title="Click to view full size"
                              />
                            )}
                            {isPdf && (
                              <div className="media-pdf-container">
                                <iframe
                                  src={`${filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                                  type="application/pdf"
                                  className="media-pdf"
                                  title={caption || fileName}
                                />
                                <div
                                  className="pdf-click-overlay"
                                  onClick={() => window.open(filePath, '_blank')}
                                  title="Click to open PDF in new tab"
                                >
                                  <span>Click to open PDF in new tab</span>
                                </div>
                              </div>
                            )}
                            {tags && tags.length > 0 && (
                              <div className="media-tags">
                                {tags.map((tag, i) => (
                                  <span key={i} className="media-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    } catch (error) {
                      console.error('Error parsing MediaAttachments:', error, sword.MediaAttachments);
                      return <div className="error-text">Error loading media attachments</div>;
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          {sword.Attachments && sword.Attachments !== 'NA' && (
            <div className="detail-section">
              <h3>Attachments</h3>
              <p className="attachments-text">{sword.Attachments}</p>
            </div>
          )}

          {sword.References && sword.References !== 'NA' && (
            <div className="detail-section">
              <h3>References</h3>
              <p className="references-text">{sword.References}</p>
            </div>
          )}
        </div>
      </div>

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img src={lightboxImage} alt="Full size view" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SwordDetail;
