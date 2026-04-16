"use client";

import { PatientEvent } from "@/types/api";

interface EventFeedProps {
  events: PatientEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export function EventFeed({ events, loading, onRefresh }: EventFeedProps) {
  return (
    <section className="panel">
      <div className="panel-header-row">
        <div>
          <h2>Recent Async Events</h2>
          <p className="panel-subtitle">Async consumer events from service-patient</p>
        </div>
        <button disabled={loading} onClick={onRefresh} className="btn btn-ghost" type="button">
          Refresh
        </button>
      </div>

      <div className="event-list">
        {events.length === 0 && <p className="empty-cell">No events yet.</p>}
        {events.slice(0, 12).map((event, index) => (
          <article className="event-item" key={`${event.patientId}-${event.timestamp}-${index}`}>
            <div className="event-top">
              <strong>{event.eventType}</strong>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <p>{event.description}</p>
            <div className="event-meta">
              <span>Patient: {event.patientId}</span>
              <span className="pill pill-active">{event.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
