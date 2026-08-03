import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder, className = '', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 210; // maxHeight + some margin
      const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setDropdownPos({
        top: showAbove ? rect.top + window.scrollY - dropdownHeight + 10 : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalculate position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`position-relative w-100 ${className}`} ref={containerRef}>
      <div 
        className="form-control d-flex justify-content-between align-items-center select-trigger"
        onClick={handleToggle}
        style={{ 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          backgroundColor: disabled ? '#f1f5f9' : '#f8fafc',
          borderColor: isOpen ? '#2563EB' : '#cbd5e1',
          opacity: disabled ? 0.65 : 1,
          height: '42px',
          padding: '8px 14px',
          borderRadius: '10px',
          border: `1px solid ${isOpen ? '#2563EB' : '#cbd5e1'}`,
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{ 
          color: selectedOption ? '#0F172A' : '#94a3b8', 
          fontWeight: selectedOption ? '600' : '400', 
          fontSize: '0.875rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none',
            color: isOpen ? '#2563EB' : '#64748b',
            transition: 'transform 0.2s ease, color 0.15s ease',
            flexShrink: 0,
          }} 
        />
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            position: 'absolute',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999, 
            maxHeight: '200px', 
            overflowY: 'auto',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
            backgroundColor: '#ffffff',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {options.map((opt) => (
            <div 
              key={opt.value}
              style={{ 
                cursor: 'pointer', 
                fontSize: '0.85rem',
                color: '#0F172A',
                backgroundColor: value === opt.value ? '#EFF6FF' : 'transparent',
                fontWeight: value === opt.value ? '700' : '500',
                padding: '10px 14px',
                borderBottom: '1px solid #F8FAFC',
                transition: 'background-color 0.1s ease',
              }}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.backgroundColor = '#F1F5F9';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
