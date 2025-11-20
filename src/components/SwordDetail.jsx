import React from 'react';

/**
 * SwordDetail component for displaying detailed information about a selected sword
 */
const SwordDetail = ({ sword, onClose }) => {
  if (!sword) return null;

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
    </div>
  );
};

export default SwordDetail;
