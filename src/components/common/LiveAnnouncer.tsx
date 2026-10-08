import React from 'react';

interface LiveAnnouncerProps {
  assertiveMessage?: string;
  politeMessage?: string;
}

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({
  assertiveMessage = '',
  politeMessage = '',
}) => {
  return (
    <div className="sr-only" aria-hidden="false">
      {/* Urgent announcements: turn maneuvers, emergency alerts, arrival notices */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>

      {/* Routine announcements: GPS state changes, place selection, distance updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
    </div>
  );
};
