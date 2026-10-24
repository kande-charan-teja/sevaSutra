import React, { useState } from 'react';
import {
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
    speakText,
  } = useSevaSutra();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const filteredNotifications =
    categoryFilter === 'All'
      ? notifications
      : notifications.filter((n) => n.category === categoryFilter);

  const filteredAudit =
    riskFilter === 'All'
      ? auditEvents
      : auditEvents.filter((a) => a.riskClassification === riskFilter);

  return (
    <div className="space-y-8">
      {/* Page Header & Lock-Screen Privacy Toggle */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
              Notifications and Activity Timeline
            </h1>
            <p className="text-sm text-slate-600">
              Every critical action—verification countdowns, payment diagnostics, caregiver permission updates, high-risk bank blocks, and offline recovery—is recorded here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                updateAccessibility({
                  lockScreenSafeMode: !accessibility.lockScreenSafeMode,
                })
              }
              className={`px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                accessibility.lockScreenSafeMode
                  ? 'bg-[#102137] text-white border-[#102137]'
                  : 'bg-slate-50 text-[#102137] border-slate-300 hover:bg-slate-100'
              }`}
              aria-pressed={accessibility.lockScreenSafeMode}
            >
              <Lock className="w-4 h-4 text-[#087F78]" />
              <span>
                {accessibility.lockScreenSafeMode
                  ? 'Showing Lock-Screen Safe Previews (Zero Sensitive Details)'
                  : 'Preview Lock-Screen Safe Mode'}
              </span>
            </button>

            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2 rounded-lg bg-[#087F78] hover:bg-[#066963] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notification Centre */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#087F78]" />
            <span>Notification Centre ({filteredNotifications.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Verification', 'Document', 'Payment', 'Security', 'Offline', 'Visit'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#102137] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.severity === 'high-risk'
                  ? 'bg-red-50/60 border-[#C44848]'
                  : !n.read
                    ? 'bg-[#E0F4EF]/40 border-[#087F78]/40'
                    : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono tabular-nums">{n.timestamp}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#102137]">{n.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold">
                    {n.read ? 'Read' : 'Unread'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#102137]">{n.title}</h3>

                {accessibility.lockScreenSafeMode ? (
                  <p className="text-xs sm:text-sm font-mono text-[#087F78] bg-white p-2 rounded border border-slate-200">
                    [Lock-Screen Safe Preview]: {n.lockScreenPreviewSafe}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700">{n.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      accessibility.lockScreenSafeMode
                        ? n.lockScreenPreviewSafe
                        : `${n.title}. ${n.message}`
                    )
                  }
                  className="px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-[#102137] hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#087F78]" />
                  <span>Read</span>
                </button>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-3 py-1.5 rounded bg-[#087F78] text-white text-xs font-semibold hover:bg-[#066963]"
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
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#087F78]" />
              <span>Immutable-Style Demonstration Audit History ({filteredAudit.length})</span>
            </h2>
            <p className="text-xs text-slate-600">
              Displays Timestamp, Actor, Action, Outcome, Source, and Risk Classification for every event.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            {(['All', 'Standard', 'Elevated', 'High Risk', 'Critical Safeguard'] as const).map(
              (rf) => (
                <button
                  key={rf}
                  type="button"
                  onClick={() => setRiskFilter(rf)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    riskFilter === rf
                      ? 'bg-[#102137] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rf}
                </button>
              )
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Timestamp</th>
                <th className="py-2.5 pr-4 font-semibold">Actor</th>
                <th className="py-2.5 pr-4 font-semibold">Action</th>
                <th className="py-2.5 pr-4 font-semibold">Outcome</th>
                <th className="py-2.5 pr-4 font-semibold">Source</th>
                <th className="py-2.5 font-semibold">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAudit.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#102137] whitespace-nowrap">
                    {ev.actor}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{ev.action}</td>
                  <td className="py-3 pr-4 font-semibold text-[#102137] whitespace-nowrap">
                    {ev.outcome}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 whitespace-nowrap">
                    {ev.source}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-mono font-bold ${
                        ev.riskClassification === 'Critical Safeguard' ||
                        ev.riskClassification === 'High Risk'
                          ? 'text-[#C44848]'
                          : ev.riskClassification === 'Elevated'
                            ? 'text-amber-700'
                            : 'text-[#087F78]'
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
