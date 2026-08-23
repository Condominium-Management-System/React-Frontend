# Common Components & Placeholders

This document catalogs shared presentational components and notes placeholder files in `src/components/common/`.

---

## 1. `StatCard.jsx`

Located at [`src/components/common/StatCard.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/StatCard.jsx):

```jsx
const StatCard = ({ title, value, icon: Icon, color = '#D3AD32', subtext }) => {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon" style={{ background: `${color}20`, color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
};
```

- **Props**:
  - `title`: Metric label (e.g. "Total Users").
  - `value`: Numerical or formatted string value (e.g. "48" or "ETB 125,000").
  - `icon`: Lucide or Material icon component.
  - `color`: Accent color hex (defaults to `#D3AD32`).
  - `subtext`: Optional trend or status caption.

---

## 2. Placeholder Files Notice

During code analysis, the following three files in `src/components/common/` were found to be empty (0 bytes):

1. [`src/components/common/DataTable.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/DataTable.jsx)
2. [`src/components/common/Header.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/Header.jsx)
3. [`src/components/common/StatusBadge.jsx`](file:///c:/Users/hp/OneDrive/Desktop/insa_projects/CMS/react/src/components/common/StatusBadge.jsx)

*Note: Pages implement their own inline Material UI `Table`, `Header`, and `Chip` styling rather than importing these empty placeholder files.*
