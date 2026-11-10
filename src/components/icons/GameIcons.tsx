'use client';

import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Custom Thick-Stroke Vector Game Icons (Zero Emoji)
 * Stroke: #3B2F2F (2.5px), Palette: #FFC83D, #6BBF59, #E5604D, #7CC4F0, #FFF6E5
 */

export function CoinIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="9.5" fill="#FFE07D" stroke="#D99B16" strokeWidth="1.5" />
      <path
        d="M18.5 12.5C17.8 11.8 16.9 11.5 15.8 11.5C13.6 11.5 12 13.3 12 16C12 18.7 13.6 20.5 15.8 20.5C16.9 20.5 17.8 20.1 18.5 19.4"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EggIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 4C10.5 4 6.5 12.5 6.5 19.5C6.5 25 10.6 28 16 28C21.4 28 25.5 25 25.5 19.5C25.5 12.5 21.5 4 16 4Z"
        fill="#FFFDF9"
        stroke="#3B2F2F"
        strokeWidth="2.5"
      />
      <path
        d="M12 10C10.5 12.5 9.8 15.5 9.8 18"
        stroke="#F3DFC1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19" cy="14" r="1.3" fill="#E6C27A" />
      <circle cx="15" cy="21" r="1.1" fill="#E6C27A" />
      <circle cx="20" cy="19" r="1" fill="#E6C27A" />
    </svg>
  );
}

export function BasketIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {/* Eggs peeking out */}
      <ellipse cx="12" cy="13" rx="4.5" ry="5.5" fill="#FFFDF9" stroke="#3B2F2F" strokeWidth="2.2" />
      <ellipse cx="20" cy="13" rx="4.5" ry="5.5" fill="#FFF6E5" stroke="#3B2F2F" strokeWidth="2.2" />
      <ellipse cx="16" cy="11.5" rx="4.8" ry="6" fill="#FFFFFF" stroke="#3B2F2F" strokeWidth="2.2" />
      {/* Woven basket body */}
      <path
        d="M4 15H28L25 26C24.6 27.2 23.5 28 22.2 28H9.8C8.5 28 7.4 27.2 7 26L4 15Z"
        fill="#E6A948"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M3 15H29" stroke="#3B2F2F" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 19H23M10 23H22" stroke="#3B2F2F" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BarnIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 15L16 4L29 15"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13.5L16 5.5L26 13.5V27H6V13.5Z"
        fill="#E5604D"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="11.5"
        y="17"
        width="9"
        height="10"
        rx="1"
        fill="#FFF6E5"
        stroke="#3B2F2F"
        strokeWidth="2.2"
      />
      <path d="M11.5 17L20.5 27M20.5 17L11.5 27" stroke="#3B2F2F" strokeWidth="1.8" />
      <circle cx="16" cy="12" r="2" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="1.8" />
    </svg>
  );
}

export function BroomIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M25 4L15 16" stroke="#8A5A36" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M11 15L19 21L13 28L4 21L11 15Z"
        fill="#FFC83D"
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M10 16.5L17.5 22.5" stroke="#E5604D" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function MedicineIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect
        x="11"
        y="4"
        width="10"
        height="5"
        rx="1.5"
        fill="#7CC4F0"
        stroke="#3B2F2F"
        strokeWidth="2.2"
      />
      <rect
        x="7"
        y="9"
        width="18"
        height="19"
        rx="4"
        fill="#FFFFFF"
        stroke="#3B2F2F"
        strokeWidth="2.5"
      />
      <path d="M16 14V23M11.5 18.5H20.5" stroke="#E5604D" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function JarIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect
        x="9"
        y="4"
        width="14"
        height="4"
        rx="1.5"
        fill="#D99B16"
        stroke="#3B2F2F"
        strokeWidth="2.2"
      />
      <rect
        x="6.5"
        y="8"
        width="19"
        height="20"
        rx="5"
        fill="#E5F4FD"
        stroke="#3B2F2F"
        strokeWidth="2.5"
      />
      <circle cx="13" cy="22" r="3.5" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="1.8" />
      <circle cx="19" cy="22.5" r="3.5" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="1.8" />
      <circle cx="16" cy="18.5" r="3.5" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="1.8" />
    </svg>
  );
}

export function TrophyIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 7H4V12C4 14.8 6.2 17 9 17M24 7H28V12C28 14.8 25.8 17 23 17"
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M8 5H24V13C24 17.4 20.4 21 16 21C11.6 21 8 17.4 8 13V5Z"
        fill="#FFC83D"
        stroke="#3B2F2F"
        strokeWidth="2.5"
      />
      <path d="M16 21V26" stroke="#3B2F2F" strokeWidth="2.5" />
      <rect
        x="10"
        y="25.5"
        width="12"
        height="3.5"
        rx="1.5"
        fill="#8A5A36"
        stroke="#3B2F2F"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function StarIcon({
  className = 'w-5 h-5',
  filled = true,
}: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 3.5L19.7 11L28 12.2L22 18L23.4 26.2L16 22.3L8.6 26.2L10 18L4 12.2L12.3 11L16 3.5Z"
        fill={filled ? '#FFC83D' : '#E5DEC9'}
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 3.5L26.5 7.5V15.5C26.5 22 22 26.8 16 29C10 26.8 5.5 22 5.5 15.5V7.5L16 3.5Z"
        fill="#7CC4F0"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 16L14.5 19L20.5 13"
        stroke="#3B2F2F"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OwlAvatar({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#7CC4F0" stroke="#3B2F2F" strokeWidth="2.8" />
      {/* Owl body/head */}
      <path
        d="M13 36C13 24 15 14 24 14C33 14 35 24 35 36"
        fill="#A66E4E"
        stroke="#3B2F2F"
        strokeWidth="2.6"
      />
      {/* Ear tufts */}
      <path
        d="M14 17L11 11L18 14M34 17L37 11L30 14"
        fill="#A66E4E"
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Belly */}
      <ellipse cx="24" cy="33" rx="7" ry="6" fill="#F5E1C8" />
      {/* Glasses / Eyes */}
      <circle cx="19" cy="22" r="5" fill="#FFFFFF" stroke="#3B2F2F" strokeWidth="2.4" />
      <circle cx="29" cy="22" r="5" fill="#FFFFFF" stroke="#3B2F2F" strokeWidth="2.4" />
      <circle cx="19" cy="22" r="2" fill="#3B2F2F" />
      <circle cx="29" cy="22" r="2" fill="#3B2F2F" />
      <path d="M24 22H24.1" stroke="#3B2F2F" strokeWidth="2.4" />
      {/* Beak */}
      <polygon
        points="22,25 26,25 24,29"
        fill="#FFC83D"
        stroke="#3B2F2F"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SunIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="7" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2.5" />
      <path
        d="M16 3V6M16 26V29M3 16H6M26 16H29M6.8 6.8L9 9M23 23L25.2 25.2M25.2 6.8L23 9M9 23L6.8 25.2"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M21.5 4.5C15.5 5.5 11 10.7 11 17C11 23.8 16.5 28.5 23 27.5C17.5 29.5 10.5 27 7.5 21.5C4.5 16 6.5 9 12 6C15 4.3 18.5 4 21.5 4.5Z"
        fill="#FFC83D"
        stroke="#3B2F2F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SoundIcon({
  className = 'w-5 h-5',
  enabled = false,
}: IconProps & { enabled?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 12H11L18 6V26L11 20H6V12Z"
        fill={enabled ? '#6BBF59' : '#E5DEC9'}
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {enabled ? (
        <path
          d="M22 11C24 13.5 24 18.5 22 21M25.5 8C29 12.5 29 19.5 25.5 24"
          stroke="#3B2F2F"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M22 13L28 19M28 13L22 19"
          stroke="#E5604D"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function ReceiptIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 4H25V28L22 25.5L19 28L16 25.5L13 28L10 25.5L7 28V4Z"
        fill="#FFFFFF"
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M11 10H21M11 15H21M11 20H17"
        stroke="#3B2F2F"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BoltIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 3L6 18H15L13 29L26 14H17L18 3Z"
        fill="#E5604D"
        stroke="#3B2F2F"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GrainIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 28V6" stroke="#3B2F2F" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="12" cy="11" rx="3" ry="4.5" transform="rotate(-30 12 11)" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2" />
      <ellipse cx="20" cy="11" rx="3" ry="4.5" transform="rotate(30 20 11)" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2" />
      <ellipse cx="12" cy="19" rx="3" ry="4.5" transform="rotate(-30 12 19)" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2" />
      <ellipse cx="20" cy="19" rx="3" ry="4.5" transform="rotate(30 20 19)" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2" />
    </svg>
  );
}

export function BadgeRibbonIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 19L8 29L16 25L24 29L21 19"
        fill="#E5604D"
        stroke="#3B2F2F"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="13" r="9" fill="#FFC83D" stroke="#3B2F2F" strokeWidth="2.4" />
      <circle cx="16" cy="13" r="5" fill="#FFE07D" stroke="#3B2F2F" strokeWidth="1.6" />
    </svg>
  );
}

export function CheckBoxIcon({
  checked,
  className = 'w-4 h-4',
}: IconProps & { checked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        fill={checked ? '#6BBF59' : '#FFF6E5'}
        stroke="#3B2F2F"
        strokeWidth="2.2"
      />
      {checked && (
        <path
          d="M7 12.5L10.5 16L17.5 8.5"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
