import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, ShieldCheck, MapPin, Calendar, User, Download, ArrowLeft } from 'lucide-react';

export default function PassTicket({ record, onClose }) {
  if (!record) return null;

  const qrData = JSON.stringify({
    id: record.id,
    roll: record.rollNumber,
    name: record.studentName,
    event: record.eventName,
    time: record.checkInTime || new Date().toISOString(),
    dist: record.distanceFromVenue
  });

  return (
    <div style={{ animation: 'fadeIn 0.25s ease', padding: '4px' }}>
      {/* Back Button */}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#4F46E5',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: '4px 0'
        }}
      >
        <ArrowLeft size={16} /> Back to Check-In
      </button>

      {/* Ticket Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        position: 'relative'
      }}>
        {/* Top Header Strip */}
        <div style={{
          background: 'var(--secondary-gradient)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#FFFFFF" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.4px' }}>
                DIGITAL ATTENDANCE PASS
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                Kirti M. Doongursee College
              </div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            VERIFIED
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 20px' }}>
          {/* Status Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#ECFDF5',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
            }}>
              <CheckCircle2 size={30} color="#059669" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
              Check-In Successful
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Geofence verified within 100m perimeter
            </div>
          </div>

          {/* Student Info Card */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>ROLL NUMBER</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#4F46E5' }}>
                  {record.rollNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>CLASS / STREAM</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  {record.classStream || 'General'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>STUDENT NAME</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                  {record.studentName}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>EVENT / LECTURE</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#B45309' }}>
                  {record.eventName || 'Campus Lecture'}
                </div>
              </div>
            </div>

            {/* Micro Details Divider */}
            <div style={{
              height: '1px',
              background: '#E2E8F0',
              margin: '14px 0 12px'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#059669" /> Proximity: {record.distanceFromVenue || 0}m
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} color="#4F46E5" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* QR Code Center */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <QRCodeSVG value={qrData} size={125} level="M" />
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', marginTop: '8px', letterSpacing: '0.4px' }}>
              PASS TOKEN: {record.id || 'SECURE_PASS'}
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
