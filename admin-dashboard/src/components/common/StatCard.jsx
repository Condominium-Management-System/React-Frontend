import React from 'react';

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

export default StatCard;