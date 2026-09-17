import React, { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value?: number | string;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'teal' | 'amber' | 'yellow' | 'red' | 'rose' | 'slate' | 'gray' | string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'teal',
}) => {
  const getColorClasses = (c: string) => {
    switch (c) {
      case 'amber':
      case 'yellow':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-100',
          ring: 'ring-amber-500/10',
        };
      case 'red':
      case 'rose':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-600',
          border: 'border-rose-100',
          ring: 'ring-rose-500/10',
        };
      case 'slate':
      case 'gray':
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          border: 'border-slate-200',
          ring: 'ring-slate-500/10',
        };
      default:
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-600',
          border: 'border-teal-100',
          ring: 'ring-teal-500/10',
        };
    }
  };

  const theme = getColorClasses(color);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between transition-all hover:shadow-md ${theme.ring}`}
    >
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-2xl font-extrabold text-slate-900 leading-tight">
          {value !== undefined && value !== null ? value : 0}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>

      {icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.bg} ${theme.text} ${theme.border} shrink-0`}
        >
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
