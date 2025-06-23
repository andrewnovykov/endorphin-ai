import React from 'react';

function FilterTabs({
  tags,
  priorities,
  selectedTag,
  selectedPriority,
  onTagChange,
  onPriorityChange
}) {
  return (
    <div className="filter-tabs">
      <div className="filter-group">
        <label className="filter-label">Tags:</label>
        <div className="filter-options">
          <button
            className={`filter-tab ${selectedTag === 'all' ? 'active' : ''}`}
            onClick={() => onTagChange('all')}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              className={`filter-tab ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => onTagChange(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Priority:</label>
        <div className="filter-options">
          <button
            className={`filter-tab ${selectedPriority === 'all' ? 'active' : ''}`}
            onClick={() => onPriorityChange('all')}
          >
            All
          </button>
          {priorities.map(priority => (
            <button
              key={priority}
              className={`filter-tab ${selectedPriority === priority ? 'active' : ''}`}
              onClick={() => onPriorityChange(priority)}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterTabs;
