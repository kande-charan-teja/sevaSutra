import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Filter,
  Lock,
  ShieldAlert,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';

export const NotificationsActivityPage: React.FC = () => {
  const {
    notifications,
    auditEvents,
    accessibility,
    updateAccessibility,
    markNotificationRead,
    markAllNotificationsRead,
    openNotificationRecord,
    speakText,
  } = useSevaSutra();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [actorFilter, setActorFilter] = useState<string>('All');

  const filteredNotifications =
    categoryFilter === 'All'
      ? notifications
      : notifications.filter((n) => n.category === categoryFilter);

  const filteredAudit = auditEvents.filter((a) => {
    const matchesRisk = riskFilter === 'All' || a.riskClassification === riskFilter;
    const matchesActor = actorFilter === 'All' || a.actor === actorFilter;
    return matchesRisk && matchesActor;
  });

  return (
    <div className="space-y-8">
      {/* Page Header & Lock-Screen Privacy Toggle */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-sm font-mono uppercase tracking-wider text-[#087F68] font-bold">
              Immutable-Style Demonstration Log · Privacy-Safe Notifications
            </div>
            <h1 className="text-[32px] sm:text-[38px] font-bold text-[#101B2D] leading-tight">
              Notifications and Activity Timeline
            </h1>
            <p className="text-[16px] sm:text-[17px] text-[#334155]">
              Every critical action—verification countdowns, payment diagnostics, caregiver permission updates, high-risk bank blocks, and offline recovery—is recorded here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                updateAccessibility({
                  lockScreenSafeMode: !accessibility.lockScreenSafeMode,
                })
              }
              className={`px-4 py-2.5 rounded-lg border text-sm sm:text-base font-semibold inline-flex items-center gap-2 transition-colors ${
                accessibility.lockScreenSafeMode
                  ? 'bg-[#101B2D] text-white border-[#101B2D]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50 hover:bg-[#EAE3D5]'
              }`}
              aria-pressed={accessibility.lockScreenSafeMode}
            >
              <Lock className="w-4 h-4 text-[#C5A267]" />
              <span>
                {accessibility.lockScreenSafeMode
                  ? 'Showing Lock-Screen Safe Previews (Zero Sensitive Details)'
                  : 'Preview Lock-Screen Safe Mode'}
              </span>
            </button>

            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm sm:text-base font-semibold inline-flex items-center gap-2 shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notification Centre */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#087F68]" />
            <span>Notification Centre ({filteredNotifications.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Verification', 'Document', 'Payment', 'Security', 'Offline', 'Visit'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#101B2D] text-white'
                      : 'bg-[#F5F0E6] text-[#101B2D] border border-[#C5A267]/35 hover:bg-[#EAE3D5]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-3.5">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.severity === 'high-risk'
                  ? 'bg-[#B42332]/5 border-[#B42332]'
                  : !n.read
                    ? 'bg-[#087F68]/10 border-[#087F68]/40'
                    : 'bg-[#F5F0E6]/65 border-[#C5A267]/35'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#334155]">
                  <span className="font-mono tabular-nums font-medium">{n.timestamp}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-[#101B2D]">{n.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#087F68]">
                    {n.read ? 'Read' : 'Unread'}
                  </span>
                </div>

                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#101B2D]">{n.title}</h3>

                {accessibility.lockScreenSafeMode ? (
                  <p className="text-[15px] sm:text-[16px] font-mono text-[#087F68] bg-white p-3 rounded-lg border border-[#C5A267]/40">
                    [Lock-Screen Safe Preview]: {n.lockScreenPreviewSafe}
                  </p>
                ) : (
                  <p className="text-[16px] text-[#334155] leading-relaxed">{n.message}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openNotificationRecord(n.id)}
                  className="px-3.5 py-2 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Open Record</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A267]" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      accessibility.lockScreenSafeMode
                        ? n.lockScreenPreviewSafe
                        : `${n.title}. ${n.message}`
                    )
                  }
                  className="px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-sm font-semibold text-[#101B2D] hover:bg-[#F5F0E6] inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-[#087F68]" />
                  <span>Read</span>
                </button>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-3.5 py-2 rounded-lg bg-[#087F68] text-white text-sm font-semibold hover:bg-[#066552]"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Audit History Table */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#087F68]" />
              <span>Immutable-Style Demonstration Audit History ({filteredAudit.length})</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Displays Timestamp, Actor, Action, Outcome, Source, and Risk Classification for every event.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-[#334155] mr-1" />
            {(['All', 'Standard', 'Elevated', 'High Risk', 'Critical Safeguard'] as const).map(
              (rf) => (
                <button
                  key={rf}
                  type="button"
                  onClick={() => setRiskFilter(rf)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    riskFilter === rf
                      ? 'bg-[#101B2D] text-white'
                      : 'bg-[#F5F0E6] text-[#101B2D] border border-[#C5A267]/35 hover:bg-[#EAE3D5]'
                  }`}
                >
                  {rf}
                </button>
              )
            )}
          </div>
        </div>

        {/* Actor Filter Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm pt-1 border-t border-[#C5A267]/25">
          <span className="font-bold text-[#101B2D] mr-1">Filter by Actor:</span>
          {(
            [
              'All',
              'Lakshmi Devi (Beneficiary)',
              'Arjun (Caregiver)',
              'Service Officer (Demo)',
              'SEVA SUTRA Safeguard Engine',
            ] as const
          ).map((actor) => (
            <button
              key={actor}
              type="button"
              onClick={() => setActorFilter(actor)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                actorFilter === actor
                  ? 'bg-[#087F68] text-white'
                  : 'bg-[#F5F0E6] text-[#101B2D] border border-[#C5A267]/35 hover:bg-[#EAE3D5]'
              }`}
            >
              {actor}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b border-[#C5A267]/40 text-[#334155]">
                <th className="py-3 pr-4 font-bold">Timestamp</th>
                <th className="py-3 pr-4 font-bold">Actor</th>
                <th className="py-3 pr-4 font-bold">Action</th>
                <th className="py-3 pr-4 font-bold">Outcome</th>
                <th className="py-3 pr-4 font-bold">Source</th>
                <th className="py-3 font-bold">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A267]/25">
              {filteredAudit.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#F5F0E6]/60">
                  <td className="py-3.5 pr-4 font-mono text-sm text-[#334155] tabular-nums whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-[#101B2D] whitespace-nowrap">
                    {ev.actor}
                  </td>
                  <td className="py-3.5 pr-4 text-[#334155]">{ev.action}</td>
                  <td className="py-3.5 pr-4 font-semibold text-[#101B2D] whitespace-nowrap">
                    {ev.outcome}
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-[#334155] whitespace-nowrap">
                    {ev.source}
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`text-sm font-mono font-bold ${
                        ev.riskClassification === 'Critical Safeguard' ||
                        ev.riskClassification === 'High Risk'
                          ? 'text-[#B42332]'
                          : ev.riskClassification === 'Elevated'
                            ? 'text-[#8B6914]'
                            : 'text-[#087F68]'
                      }`}
                    >
                      {ev.riskClassification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
