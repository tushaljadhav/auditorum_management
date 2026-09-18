import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Clock, ChevronRight } from 'lucide-react';

/**
 * TimePicker — Real Circular Analog Clock Picker (Material/Apple style)
 * Features:
 *   - Circular dial with 12 hour positions & minute positions (00, 05, 10... 55)
 *   - Real rotating clock hand with center pivot and circular target bubble
 *   - Touch / click anywhere on dial or numbers with angle snapping
 *   - AM / PM toggle
 *   - Enforces 05:00 AM to 12:00 AM operating window
 *   - Enforces minTime constraint (disabled hours/minutes greyed out)
 *   - Quick minute chips (:00, :15, :30, :45)
 *
 * Props:
 *   value       : "HH:MM" string (24h e.g. "10:30" or "00:00")
 *   onChange    : (newVal: "HH:MM") => void
 *   onClose     : () => void
 *   minTime?    : "HH:MM" — times before this are disabled
 *   label?      : string
 */
export default function TimePicker({ value, onChange, onClose, minTime, label = 'Select Time' }) {
  const overlayRef = useRef(null);
  const clockRef = useRef(null);

  // Convert 24h string to { h12: 1..12, m: 0..59, ap: 'AM'|'PM' }
  const parse24To12 = (val) => {
    if (!val) return { h12: 10, m: 0, ap: 'AM' };
    const [hStr, mStr] = val.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    
    // Treat 00:00 as 12:00 AM (midnight)
    let ap = (h >= 12 && h < 24) ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return { h12, m, ap };
  };

  const initial = parse24To12(value);
  const [h12, setH12] = useState(initial.h12);
  const [minute, setMinute] = useState(initial.m);
  const [ampm, setAmpm] = useState(initial.ap);
  const [phase, setPhase] = useState('hour'); // 'hour' | 'minute'

  // Convert current 12h + AM/PM to 24h string
  const to24 = (h12Val, mVal, apVal) => {
    let h24 = h12Val % 12;
    if (apVal === 'PM') h24 += 12;
    // 12:00 AM is 00:00
    if (apVal === 'AM' && h12Val === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(mVal).padStart(2, '0');
    return `${hStr}:${mStr}`;
  };

  // Convert 24h "HH:MM" to absolute minutes (with 00:00 midnight as 1440)
  const toAbsoluteMins = (h24Str) => {
    const [h, m] = h24Str.split(':').map(Number);
    return (h === 0 ? 24 : h) * 60 + m;
  };

  const minAbsoluteMins = minTime ? toAbsoluteMins(minTime) : 0;

  // Operating limits: 05:00 AM to 12:00 AM (midnight)
  // Check if a given hour is disabled
  const isHourDisabled = (testH12, testAp) => {
    // Check operating hours: 5:00 AM to 12:00 AM midnight
    if (testAp === 'AM' && testH12 >= 1 && testH12 <= 4) {
      // 1 AM, 2 AM, 3 AM, 4 AM are outside college operating hours
      return true;
    }
    if (!minTime) return false;

    // Check if entire hour is before minTime
    // Latest minute in this hour:
    const latest24 = to24(testH12, 59, testAp);
    return toAbsoluteMins(latest24) <= minAbsoluteMins;
  };

  // Check if a given minute is disabled
  const isMinuteDisabled = (testM, curH12, curAp) => {
    const test24 = to24(curH12, testM, curAp);
    // Before 5:00 AM check
    if (toAbsoluteMins(test24) < 5 * 60) return true;
    if (!minTime) return false;
    return toAbsoluteMins(test24) <= minAbsoluteMins;
  };

  // Switch AM/PM safely
  const handleAmpmChange = (newAp) => {
    if (newAp === ampm) return;
    
    // Check if current hour would be valid in new AM/PM
    if (isHourDisabled(h12, newAp)) {
      // Find first valid hour in that period
      const candidates = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
      const valid = candidates.find(ch => !isHourDisabled(ch, newAp));
      if (valid) {
        setH12(valid);
      }
    }
    setAmpm(newAp);
  };

  // Handle Hour selection
  const selectHour = (num) => {
    if (isHourDisabled(num, ampm)) return;
    setH12(num);
    // Check if current minute is still valid
    if (isMinuteDisabled(minute, num, ampm)) {
      // Find nearest valid minute (:00, :15, :30, :45)
      const validMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].filter(m => !isMinuteDisabled(m, num, ampm));
      if (validMinutes.length > 0) {
        setMinute(validMinutes[0]);
      }
    }
    // Auto transition to minute phase after a brief, pleasing delay
    setTimeout(() => {
      setPhase('minute');
    }, 220);
  };

  // Handle Minute selection
  const selectMinute = (m) => {
    if (isMinuteDisabled(m, h12, ampm)) return;
    setMinute(m);
  };

  // Handle confirm
  const handleConfirm = () => {
    const final24 = to24(h12, minute, ampm);
    onChange(final24);
    onClose();
  };

  // Radial Dial Math
  const DIAL_RADIUS = 100; // Radius for number markers
  const CENTER = 130;      // Center of 260px circle

  // Clock numbers setup
  const HOURS_POSITIONS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const MINUTES_POSITIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Calculate coordinates for a clock index (0 to 11, where 0 is at 12 o'clock)
  const getCoords = (index, totalSteps = 12, r = DIAL_RADIUS) => {
    // Angle in degrees: 0 step is -90 deg (12 o'clock)
    const angleDeg = (index / totalSteps) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CENTER + r * Math.cos(angleRad),
      y: CENTER + r * Math.sin(angleRad),
      angleDeg,
    };
  };

  // Selected pointer angle
  const getSelectedAngle = () => {
    if (phase === 'hour') {
      const step = h12 % 12; // 12 -> 0, 1 -> 1, etc.
      return (step / 12) * 360 - 90;
    } else {
      return (minute / 60) * 360 - 90;
    }
  };

  const selectedAngleDeg = getSelectedAngle();
  const selectedAngleRad = (selectedAngleDeg * Math.PI) / 180;
  const pointerX = CENTER + DIAL_RADIUS * Math.cos(selectedAngleRad);
  const pointerY = CENTER + DIAL_RADIUS * Math.sin(selectedAngleRad);

  // Click or drag on clock face directly to calculate angle
  const handleClockDialClick = (e) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - CENTER;
    const clickY = e.clientY - rect.top - CENTER;

    // Angle in degrees: -180 to 180 (where 0 is 3 o'clock)
    let deg = (Math.atan2(clickY, clickX) * 180) / Math.PI;
    // Normalize to 0 at 12 o'clock:
    deg = (deg + 90 + 360) % 360;

    if (phase === 'hour') {
      // 12 hours -> each 30 degrees
      const hourIndex = Math.round(deg / 30) % 12;
      const chosenHour = hourIndex === 0 ? 12 : hourIndex;
      selectHour(chosenHour);
    } else {
      // 60 minutes -> round to nearest 5
      const rawMin = Math.round(deg / 6);
      const roundedMin = Math.round(rawMin / 5) * 5 % 60;
      selectMinute(roundedMin);
    }
  };

  // Formatted display values
  const displayHour = String(h12).padStart(2, '0');
  const displayMin = String(minute).padStart(2, '0');
  const displayCurrent24 = to24(h12, minute, ampm);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: '#FFFFFF',
        borderRadius: 28,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ── HEADER: Digital Display + AM/PM ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          padding: '20px 20px 18px',
          color: '#FFFFFF',
          position: 'relative',
        }}>
          {/* Close Icon */}
          <button
            onClick={onClose}
            aria-label="Close clock"
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          <div style={{
            fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 1.2,
            color: '#A5B4FC', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Clock size={13} /> {label}
          </div>

          {/* Time Digits & AM/PM Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Hour Box */}
              <button
                type="button"
                onClick={() => setPhase('hour')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: phase === 'hour' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  border: phase === 'hour' ? '2px solid rgba(255, 255, 255, 0.6)' : '2px solid transparent',
                  color: '#FFFFFF',
                  fontSize: 42,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -1,
                  cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'all 0.15s ease',
                }}
              >
                {displayHour}
              </button>

              <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(255, 255, 255, 0.5)', margin: '0 2px' }}>
                :
              </span>

              {/* Minute Box */}
              <button
                type="button"
                onClick={() => setPhase('minute')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: phase === 'minute' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  border: phase === 'minute' ? '2px solid rgba(255, 255, 255, 0.6)' : '2px solid transparent',
                  color: '#FFFFFF',
                  fontSize: 42,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -1,
                  cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'all 0.15s ease',
                }}
              >
                {displayMin}
              </button>
            </div>

            {/* AM / PM Segmented Control */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 12,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
              <button
                type="button"
                onClick={() => handleAmpmChange('AM')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: ampm === 'AM' ? '#FFFFFF' : 'transparent',
                  color: ampm === 'AM' ? '#1E1B4B' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleAmpmChange('PM')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: ampm === 'PM' ? '#FFFFFF' : 'transparent',
                  color: ampm === 'PM' ? '#1E1B4B' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                PM
              </button>
            </div>
          </div>

          <div style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>Tap dial or number to adjust</span>
            <span>Mode: <strong>{phase === 'hour' ? 'Hour Dial' : 'Minute Dial'}</strong></span>
          </div>
        </div>

        {/* ── BODY: REAL CIRCULAR ANALOG CLOCK FACE ── */}
        <div style={{
          padding: '24px 20px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#F8FAFC',
        }}>
          {/* Circular Clock Dial */}
          <div
            ref={clockRef}
            onClick={handleClockDialClick}
            style={{
              position: 'relative',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {/* SVG Layer for Hand & Center Pivot */}
            <svg
              width="260"
              height="260"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              {/* Hand line */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={pointerX}
                y2={pointerY}
                stroke="var(--primary, #4338CA)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Center Dot */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r="5"
                fill="var(--primary, #4338CA)"
              />
              {/* Selection Circle Knob over chosen item */}
              <circle
                cx={pointerX}
                cy={pointerY}
                r="18"
                fill="var(--primary, #4338CA)"
                opacity="0.95"
              />
            </svg>

            {/* Render Numbers around clock circle */}
            {phase === 'hour' ? (
              // ── 12-Hour Numbers ──
              HOURS_POSITIONS.map((num, idx) => {
                const step = num % 12;
                const { x, y } = getCoords(step, 12, DIAL_RADIUS);
                const isSelected = h12 === num;
                const disabled = isHourDisabled(num, ampm);

                return (
                  <div
                    key={num}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectHour(num);
                    }}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      transform: 'translate(-50%, -50%)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: isSelected ? 900 : 700,
                      color: isSelected ? '#FFFFFF' : disabled ? '#CBD5E1' : '#1E293B',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      zIndex: 2,
                      transition: 'color 0.15s ease',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {num}
                  </div>
                );
              })
            ) : (
              // ── Minute Numbers (00, 05, 10, ... 55) ──
              MINUTES_POSITIONS.map((mVal, idx) => {
                const { x, y } = getCoords(idx, 12, DIAL_RADIUS);
                const isSelected = minute === mVal;
                const disabled = isMinuteDisabled(mVal, h12, ampm);

                return (
                  <div
                    key={mVal}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectMinute(mVal);
                    }}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      transform: 'translate(-50%, -50%)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: isSelected ? 900 : 700,
                      color: isSelected ? '#FFFFFF' : disabled ? '#CBD5E1' : '#1E293B',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      zIndex: 2,
                      transition: 'color 0.15s ease',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {String(mVal).padStart(2, '0')}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Minute Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
            width: '100%',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Quick:</span>
            {[0, 15, 30, 45].map((qm) => {
              const disabled = isMinuteDisabled(qm, h12, ampm);
              const active = minute === qm;
              return (
                <button
                  key={qm}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    selectMinute(qm);
                    setPhase('minute');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: active ? '1.5px solid var(--primary, #4338CA)' : '1px solid #CBD5E1',
                    background: active ? 'var(--primary-light, #EEF2FF)' : '#FFFFFF',
                    color: active ? 'var(--primary, #4338CA)' : disabled ? '#94A3B8' : '#334155',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  :{String(qm).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER: Cancel & Confirm ── */}
        <div style={{
          padding: '14px 20px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#64748B',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)',
            }}
          >
            <Check size={15} /> Set {displayHour}:{displayMin} {ampm}
          </button>
        </div>

      </div>
    </div>
  );
}
