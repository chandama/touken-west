import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function SwordCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Add duplicate check before submission
  // Check if a sword with matching School, Smith, Type, Nagasa, and Authentication already exists

  const [formData, setFormData] = useState({
    School: '',
    Smith: '',
    Mei: '',
    Type: '',
    Nagasa: '',
    Sori: '',
    Moto: '',
    Saki: '',
    Nakago: '',
    Ana: '',
    Length: '',
    Hori: '',
    Authentication: '',
    Province: '',
    Period: '',
    References: '',
    Description: '',
    Attachments: '',
    Tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.Smith || !formData.Type) {
      setError('Smith and Type are required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/swords`, formData);

      // Navigate to the edit page for the new sword
      navigate(`/admin/sword/${response.data.sword.Index}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create sword');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Create New Sword</h2>
        <p className="subtitle">Add a new sword record to the database</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sword-edit-form">
        {/* Basic Information */}
        <section className="form-section">
          <h3>Basic Information</h3>

          <div className="form-field">
            <label htmlFor="School">School *</label>
            <input
              type="text"
              id="School"
              name="School"
              value={formData.School}
              onChange={handleChange}
              placeholder="e.g., Hasebe, Ayanokoji, Osafune"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Smith">Smith * (required)</label>
            <input
              type="text"
              id="Smith"
              name="Smith"
              value={formData.Smith}
              onChange={handleChange}
              required
              placeholder="e.g., Kunimitsu, Munenobu"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Mei">Mei/Signature</label>
            <input
              type="text"
              id="Mei"
              name="Mei"
              value={formData.Mei}
              onChange={handleChange}
              placeholder="e.g., Mumei, 長谷部宗信"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Type">Type * (required)</label>
            <select
              id="Type"
              name="Type"
              value={formData.Type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type...</option>
              <option value="Tanto">Tanto (短刀)</option>
              <option value="Wakizashi">Wakizashi (脇差)</option>
              <option value="Katana">Katana (刀)</option>
              <option value="Tachi">Tachi (太刀)</option>
              <option value="Naoshi">Naoshi (薙刀直し)</option>
              <option value="Naginata">Naginata (薙刀)</option>
              <option value="Yari">Yari (槍)</option>
              <option value="Ken">Ken (剣)</option>
              <option value="Chokuto">Chokuto (直刀)</option>
            </select>
          </div>
        </section>

        {/* Measurements */}
        <section className="form-section">
          <h3>Measurements</h3>

          <div className="form-field">
            <label htmlFor="Nagasa">Nagasa (Length in cm)</label>
            <input
              type="text"
              id="Nagasa"
              name="Nagasa"
              value={formData.Nagasa}
              onChange={handleChange}
              placeholder="e.g., 67.9"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Sori">Sori (Curvature in cm)</label>
            <input
              type="text"
              id="Sori"
              name="Sori"
              value={formData.Sori}
              onChange={handleChange}
              placeholder="e.g., 1.5"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Moto">Motohaba (Base width in cm)</label>
            <input
              type="text"
              id="Moto"
              name="Moto"
              value={formData.Moto}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="Saki">Sakihaba (Tip width in cm)</label>
            <input
              type="text"
              id="Saki"
              name="Saki"
              value={formData.Saki}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Tang Information */}
        <section className="form-section">
          <h3>Tang (Nakago) Information</h3>

          <div className="form-field">
            <label htmlFor="Nakago">Nakago Condition</label>
            <select
              id="Nakago"
              name="Nakago"
              value={formData.Nakago}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Ubu">Ubu (Original)</option>
              <option value="Suriage">Suriage (Shortened)</option>
              <option value="Orikaeshi">Orikaeshi (Folded)</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="Ana">Mekugi-ana (Number of holes)</label>
            <input
              type="text"
              id="Ana"
              name="Ana"
              value={formData.Ana}
              onChange={handleChange}
              placeholder="e.g., 1, 2"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Length">Tang Length (cm)</label>
            <input
              type="text"
              id="Length"
              name="Length"
              value={formData.Length}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="Hori">Hori (Engravings/Grooves)</label>
            <input
              type="text"
              id="Hori"
              name="Hori"
              value={formData.Hori}
              onChange={handleChange}
              placeholder="e.g., Hi, NA"
            />
          </div>
        </section>

        {/* Historical Information */}
        <section className="form-section">
          <h3>Historical Information</h3>

          <div className="form-field">
            <label htmlFor="Authentication">Authentication/Certification</label>
            <input
              type="text"
              id="Authentication"
              name="Authentication"
              value={formData.Authentication}
              onChange={handleChange}
              placeholder="e.g., Juyo 25, Tokubetsu Juyo 7, Kokuho"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Province">Province</label>
            <input
              type="text"
              id="Province"
              name="Province"
              value={formData.Province}
              onChange={handleChange}
              placeholder="e.g., Yamashiro, Bizen, Yamato"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Period">Period</label>
            <input
              type="text"
              id="Period"
              name="Period"
              value={formData.Period}
              onChange={handleChange}
              placeholder="e.g., Kamakura, Nanbokucho, Muromachi"
            />
          </div>

          <div className="form-field">
            <label htmlFor="References">References</label>
            <textarea
              id="References"
              name="References"
              value={formData.References}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., TB 123, JNZ 456"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Description">Description</label>
            <textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              rows="4"
              placeholder="Historical notes, provenance, famous names, etc."
            />
          </div>

          <div className="form-field">
            <label htmlFor="Attachments">Attachments</label>
            <textarea
              id="Attachments"
              name="Attachments"
              value={formData.Attachments}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., Koshirae, Sayagaki, Origami"
            />
          </div>

          <div className="form-field">
            <label htmlFor="Tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="Tags"
              name="Tags"
              value={formData.Tags}
              onChange={handleChange}
              placeholder="e.g., Juyo, Hasebe, Yamashiro"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Sword'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SwordCreate;
