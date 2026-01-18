'use client';

import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animate?: boolean;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

export function StatCard({ title, value, subtitle, icon: Icon, color, animate = true }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(animate && typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (animate && typeof value === 'number') {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [value, animate]);

  return (
    <div className="stat-card bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-white text-3xl font-bold mt-1">
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </p>
            {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface RiskBadgeProps {
  risk: string;
  size?: 'sm' | 'md';
}

export function RiskBadge({ risk, size = 'md' }: RiskBadgeProps) {
  const colors = {
    'Stable': 'bg-green-100 text-green-800 border-green-200',
    'Watchlist': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High Risk': 'bg-red-100 text-red-800 border-red-200',
    'Low Risk': 'bg-green-100 text-green-800 border-green-200',
    'Medium Risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-red-100 text-red-800 border-red-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colors[risk] || 'bg-gray-100 text-gray-800'} ${sizeClasses}`}>
      {risk}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = {
    'CRITICAL': 'bg-red-600 text-white',
    'HIGH': 'bg-orange-500 text-white',
    'MEDIUM': 'bg-yellow-500 text-white',
    'LOW': 'bg-green-500 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${colors[priority] || 'bg-gray-500 text-white'}`}>
      {priority}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p className="font-medium">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
