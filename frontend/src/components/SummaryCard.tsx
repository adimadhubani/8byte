import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueClassName?: string;
  badgeText?: string;
  badgeClassName?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  valueClassName = "text-slate-900",
  badgeText,
  badgeClassName
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {badgeText && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border ${
              badgeClassName || "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold tracking-tight ${valueClassName}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export const SummaryCard = KpiCard;
