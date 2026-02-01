import { useState, useEffect } from 'react'
import { getAIConfig, updateAIConfig } from '../services/adminService'
import './AIConfig.css'

function AIConfig() {
  const [config, setConfig] = useState({
    enabled: true,
    min_rating: 0,
    max_restaurants: 10,
    sort_by: 'rating',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await getAIConfig()
      setConfig(res?.data ?? config)
    } catch (error) {
      console.error('Error loading AI config:', error)
      setMessage({ type: 'error', text: 'Không tải được cấu hình.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage(null)
      await updateAIConfig(config)
      setMessage({ type: 'success', text: 'Đã lưu cấu hình AI gợi ý nhà hàng.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Lưu thất bại.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="admin-page loading">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="admin-page aiconfig-page">
      <div className="admin-header">
        <h1>Cấu hình AI gợi ý nhà hàng</h1>
      </div>

      {message && (
        <div className={`config-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="aiconfig-form" onSubmit={handleSave}>
        <div className="config-card">
          <h3>Thiết lập đề xuất</h3>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={!!config.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
              Bật gợi ý nhà hàng (AI)
            </label>
          </div>

          <div className="form-row">
            <label>
              Điểm đánh giá tối thiểu (0–5)
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={config.min_rating ?? 0}
                onChange={(e) => handleChange('min_rating', parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Số nhà hàng tối đa hiển thị (1–100)
              <input
                type="number"
                min={1}
                max={100}
                value={config.max_restaurants ?? 10}
                onChange={(e) => handleChange('max_restaurants', parseInt(e.target.value, 10) || 10)}
                className="form-input"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Sắp xếp theo
              <select
                value={config.sort_by ?? 'rating'}
                onChange={(e) => handleChange('sort_by', e.target.value)}
                className="form-select"
              >
                <option value="rating">Điểm đánh giá</option>
                <option value="reviews">Số lượt đánh giá</option>
                <option value="recent">Mới nhất</option>
              </select>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AIConfig