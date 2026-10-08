import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  id,
  size = 'md',
  variant = 'secondary',
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useApp();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      addToast('Copied to Clipboard', textToCopy.slice(0, 50) + (textToCopy.length > 50 ? '...' : ''), 'info');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      addToast('Copy Failed', 'Please copy manually.', 'error');
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    icon: 'p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg',
  };

  if (variant === 'icon') {
    return (
      <button
        id={id}
        onClick={handleCopy}
        title={label}
        className={`transition-all active:scale-95 inline-flex items-center justify-center ${variantClasses.icon} ${className}`}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      id={id}
      onClick={handleCopy}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 whitespace-nowrap ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-emerald-600 dark:text-emerald-400">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 shrink-0 opacity-70" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
