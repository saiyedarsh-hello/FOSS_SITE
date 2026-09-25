import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ArrowLeft,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { placementsData } from '../data/mockData';
import './PlacementsDirectory.css';

export default function PlacementsDirectory({ onBackToHome }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Filter drives based on search and category tab
  const filteredDrives = useMemo(() => {
    return placementsData.drives.filter((item) => {
      // Academic pause items pass through unless specific filter is selected
      if (item.isAcademicPause) {
        return activeFilter === 'all';
      }

      // Category matching
      if (activeFilter === 'dream' && item.ctcNum < 10) return false;
      if (activeFilter === 'tier1' && (item.ctcNum < 6 || item.ctcNum > 9)) return false;
      if (activeFilter === 'online' && item.type !== 'online') return false;
      if (activeFilter === 'campus' && item.type !== 'campus') return false;

      // Search matching
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCompany = item.company?.toLowerCase().includes(query);
        const matchRole = item.role?.toLowerCase().includes(query);
        const matchBranch = item.branches?.toLowerCase().includes(query);
        const matchVenue = item.venueType?.toLowerCase().includes(query);
        return matchCompany || matchRole || matchBranch || matchVenue;
      }

      return true;
    });
  }, [searchTerm, activeFilter]);

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Company',
      'Role',
      'Annual CTC',
      'Date',
      'Assessment Venue',
      'Eligible Branches',
      'Applications',
      'Status',
    ];

    const rows = placementsData.drives
      .filter((d) => !d.isAcademicPause)
      .map((d) => [
        `"${d.company}"`,
        `"${d.role}"`,
        `"${d.ctc}"`,
        `"${d.date}"`,
        `"${d.venueType}"`,
        `"${d.branches}"`,
        `"${d.applications}"`,
        `"${d.status}"`,
      ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'placement_directory_batch_2027.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="placements-screen-layout">
      <div className="section-container">
        {/* Navigation & Header Bar */}
        <div className="placements-nav-bar">
          <button
            type="button"
            className="back-btn"
            onClick={onBackToHome}
          >
            <ArrowLeft size={16} />
            <span>Back to Hub</span>
          </button>

          <div className="header-actions">
            <span className="window-month-tag">
              <Calendar size={13} />
              <span>{placementsData.header.month}</span>
            </span>

            <button
              type="button"
              className="export-csv-btn"
              onClick={handleExportCSV}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Directory Hero Banner */}
        <div className="placements-hero-header">
          <h1 className="placements-page-title">
            {placementsData.header.title}
          </h1>

          <p className="placements-page-subtitle">
            {placementsData.header.subtitle}
          </p>
        </div>

        {/* 4 Metrics Stats Row */}
        <div className="placements-metrics-grid">
          {placementsData.stats.map((st) => (
            <div
              key={st.label}
              className={`metric-card ${st.highlight ? 'is-highlight' : ''}`}
            >
              <span className="metric-label">{st.label}</span>
              <div className="metric-value-row">
                <span className="metric-number">{st.value}</span>
                {st.highlight && <Sparkles size={16} className="text-cyan" />}
              </div>
              <span className="metric-sub">{st.sub}</span>
            </div>
          ))}
        </div>

        {/* Search & Filter Tabs Controls */}
        <div className="placements-controls-bar">
          {/* Search Input */}
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by company (IBM, Nvidia, BNP...), role, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="filter-tabs-row">
            {placementsData.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-pill-btn ${activeFilter === f.id ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Note Banner */}
        <div className="academic-note-banner">
          <div className="note-icon-col">
            <AlertCircle size={20} className="text-amber" />
          </div>
          <div className="note-content-col">
            <div className="note-title-line">
              <span className="note-badge">{placementsData.academicNote.badge}</span>
              <span className="note-title">{placementsData.academicNote.title}</span>
            </div>
            <p className="note-text">{placementsData.academicNote.description}</p>
          </div>
        </div>

        {/* Drives Timeline Directory */}
        <div className="drives-timeline-list">
          {filteredDrives.map((item) => {
            if (item.isAcademicPause) {
              return (
                <div key={item.id} className="academic-pause-card">
                  <div className="pause-date-col">
                    <span className="pause-date-badge">{item.date}</span>
                  </div>
                  <div className="pause-info-col">
                    <div className="pause-title-line">
                      <span className="pause-tag">{item.subtitle}</span>
                      <h4 className="pause-heading">{item.title}</h4>
                    </div>
                    <p className="pause-desc">{item.description}</p>
                  </div>
                </div>
              );
            }

            const isDream = item.ctcNum >= 10;

            return (
              <div
                key={item.id}
                className={`drive-row-card ${isDream ? 'dream-glow' : ''}`}
              >
                {/* Left: Company & Role */}
                <div className="drive-main-col">
                  <div className="drive-company-badge-row">
                    <span className="company-logo-pill">
                      {item.company.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="drive-name-label">{item.driveName}</span>
                    {isDream && <span className="dream-badge">10+ LPA DREAM</span>}
                  </div>

                  <h3 className="drive-role-title">{item.role}</h3>

                  <div className="drive-meta-inline">
                    <span className="meta-inline-item">
                      <Calendar size={13} />
                      {item.date}
                    </span>
                    <span className="meta-inline-item">
                      <MapPin size={13} />
                      {item.venueType}
                    </span>
                    <span className="meta-inline-item">
                      <GraduationCap size={13} />
                      {item.branches}
                    </span>
                  </div>
                </div>

                {/* Right: CTC & Action */}
                <div className="drive-action-col">
                  <div className="drive-ctc-block">
                    <span className="ctc-val">{item.ctc}</span>
                    <span className="ctc-label">Annual CTC</span>
                  </div>

                  <div className="drive-status-applications">
                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {item.status}
                    </span>
                    <span className="app-count-text">
                      <Users size={12} />
                      {item.applications}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="inspect-btn"
                    onClick={() => setSelectedDrive(item)}
                  >
                    <span>Inspect Details</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredDrives.length === 0 && (
            <div className="no-drives-card">
              <AlertCircle size={28} className="text-muted" />
              <p>No recruitment drives found matching your query &quot;{searchTerm}&quot;.</p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Detailed Drive Modal */}
        {selectedDrive && (
          <div
            className="drive-modal-backdrop"
            onClick={() => setSelectedDrive(null)}
          >
            <div
              className="drive-modal-window"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-header-left">
                  <span className="modal-company-tag">{selectedDrive.company}</span>
                  <h2 className="modal-title">{selectedDrive.role}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedDrive(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-stats-strip">
                  <div className="modal-stat">
                    <span className="st-lbl">PACKAGE (CTC)</span>
                    <span className="st-val highlight">{selectedDrive.ctc}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="st-lbl">DATE & TIME</span>
                    <span className="st-val">{selectedDrive.date}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="st-lbl">ASSESSMENT FORMAT</span>
                    <span className="st-val">{selectedDrive.venueType}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="st-lbl">CURRENT STATUS</span>
                    <span className={`status-pill ${selectedDrive.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {selectedDrive.status}
                    </span>
                  </div>
                </div>

                <div className="modal-section-block">
                  <h4>Eligible Degree & Engineering Branches</h4>
                  <div className="branches-tag-wrap">
                    {selectedDrive.branches.split('/').map((b) => (
                      <span key={b} className="branch-tag">
                        {b.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="modal-section-block">
                  <h4>Assessment Instructions & Protocol</h4>
                  <p className="modal-desc-p">
                    Verified recruitment window drive conducted in coordination with the Department of
                    Software Engineering and Placement Cell at FET Jain University. Ensure your official
                    college credentials and registered resume on Superset are synced before attendance.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-action-btn primary"
                  onClick={() => setSelectedDrive(null)}
                >
                  <span>Close Inspection</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
