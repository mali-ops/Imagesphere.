import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Webhook,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Code2,
  Copy,
  Check,
  Trash2,
  Edit3,
  Power,
  ExternalLink,
  Shield,
  Zap,
  MessageSquare,
  Sparkles,
  Key,
  Globe,
  Radio,
  FileJson,
  RotateCw,
  Eye,
  Info,
} from 'lucide-react';
import { WebhookConfig, WebhookEvent, WebhookFormat, WebhookDeliveryLog } from '../../types';

export const WebhookSettings: React.FC = () => {
  const {
    currentUser,
    webhooks,
    webhookLogs,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    clearWebhookLogs,
    confirm,
    addToast,
  } = useApp();

  const userWebhooks = webhooks.filter((w) => w.user_id === currentUser?.id);
  const userLogs = webhookLogs.filter((log) =>
    userWebhooks.some((w) => w.id === log.webhook_id)
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [format, setFormat] = useState<WebhookFormat>('json_standard');
  const [events, setEvents] = useState<WebhookEvent[]>(['image.created']);
  const [isActive, setIsActive] = useState(true);

  // Testing State
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    webhookId: string;
    success: boolean;
    statusCode: number;
    durationMs: number;
    message: string;
    responseBody?: string;
  } | null>(null);

  // Log Payload Modal
  const [selectedLog, setSelectedLog] = useState<WebhookDeliveryLog | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to Clipboard', 'Text copied successfully.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = (preset?: 'discord' | 'slack' | 'zapier') => {
    setEditingWebhook(null);
    if (preset === 'discord') {
      setName('Discord Media Alerts');
      setUrl('https://discord.com/api/webhooks/...');
      setFormat('discord');
      setEvents(['image.created']);
      setSecret('');
      setIsActive(true);
    } else if (preset === 'slack') {
      setName('Slack #uploads Channel');
      setUrl('https://hooks.slack.com/services/...');
      setFormat('slack');
      setEvents(['image.created']);
      setSecret('');
      setIsActive(true);
    } else if (preset === 'zapier') {
      setName('Zapier Cloud Media Pipeline');
      setUrl('https://hooks.zapier.com/hooks/catch/...');
      setFormat('json_standard');
      setEvents(['image.created']);
      setSecret(`whsec_${Math.random().toString(36).substring(2, 14)}`);
      setIsActive(true);
    } else {
      setName('');
      setUrl('');
      setFormat('json_standard');
      setEvents(['image.created']);
      setSecret('');
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleOpenEditModal = (wh: WebhookConfig) => {
    setEditingWebhook(wh);
    setName(wh.name);
    setUrl(wh.url);
    setSecret(wh.secret || '');
    setFormat(wh.format);
    setEvents(wh.events);
    setIsActive(wh.is_active);
    setModalOpen(true);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      addToast('Invalid URL', 'Webhook endpoint URL must start with http:// or https://', 'error');
      return;
    }

    if (events.length === 0) {
      addToast('Event Required', 'Please select at least one event (e.g. image.created).', 'error');
      return;
    }

    if (editingWebhook) {
      updateWebhook(editingWebhook.id, {
        name: name.trim() || 'Webhook Endpoint',
        url: url.trim(),
        secret: secret.trim() || undefined,
        format,
        events,
        is_active: isActive,
      });
    } else {
      addWebhook({
        name: name.trim() || 'Webhook Endpoint',
        url: url.trim(),
        secret: secret.trim() || undefined,
        format,
        events,
        is_active: isActive,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteWebhook = (wh: WebhookConfig) => {
    confirm({
      title: `Delete Webhook "${wh.name}"?`,
      message: 'This will stop all outbound event dispatches to this endpoint URL. This action cannot be undone.',
      confirmLabel: 'Delete Webhook',
      isDestructive: true,
      onConfirm: () => {
        deleteWebhook(wh.id);
      },
    });
  };

  const handleTestTrigger = async (wh: WebhookConfig) => {
    setTestingId(wh.id);
    setTestResult(null);
    try {
      const res = await testWebhook(wh.id);
      setTestResult({
        webhookId: wh.id,
        success: res.success,
        statusCode: res.statusCode,
        durationMs: res.durationMs,
        message: res.message,
        responseBody: res.responseBody,
      });
      if (res.success) {
        addToast('Test Succeeded', `Endpoint returned HTTP ${res.statusCode} in ${res.durationMs}ms`, 'success');
      } else {
        addToast('Test Failed', `Endpoint returned HTTP ${res.statusCode || 'Error'}: ${res.message}`, 'error');
      }
    } catch (err: any) {
      setTestResult({
        webhookId: wh.id,
        success: false,
        statusCode: 0,
        durationMs: 0,
        message: err.message || 'Dispatch failed',
      });
      addToast('Dispatch Error', err.message || 'Could not reach target endpoint', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const generateSecret = () => {
    const random = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setSecret(`whsec_${random}`);
  };

  const sampleJsonPayload = {
    event: 'image.created',
    timestamp: '2026-09-22T02:04:35.000Z',
    image: {
      id: 'img_1727008123_a9b1',
      title: 'Neon Cyberpunk Metropolis',
      description: 'Rendered in 4K resolution',
      file_name: 'neon_metropolis.png',
      original_name: 'neon_metropolis.png',
      storage_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
      thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
      direct_url: 'https://your-domain.com/i/neon_metropolis.png',
      page_url: 'https://your-domain.com/view/neon-cyberpunk-metropolis',
      file_size: 2450320,
      mime_type: 'image/png',
      width: 1920,
      height: 1080,
      visibility: 'public',
      tags: ['cyberpunk', 'neon', 'city'],
      created_at: '2026-09-22T02:04:35.000Z',
    },
    user: {
      id: currentUser?.id || 'usr_client_002',
      name: currentUser?.full_name || 'Alex Rivera',
      username: currentUser?.username || 'alex_designer',
      email: currentUser?.email || 'alex@developer.io',
    },
  };

  return (
    <div className="space-y-8" id="webhook-settings-container">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Webhooks & Integrations</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
                  {userWebhooks.length} Endpoints
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically notify Discord, Slack, Zapier, or your external backend whenever an image is uploaded.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDocs(!showDocs)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{showDocs ? 'Hide Docs' : 'Payload Spec'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Webhook</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Integration Templates */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-slate-900 border border-blue-100 dark:border-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quick Connect Presets
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click to preconfigure an endpoint format with standard visual embeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleOpenAddModal('discord')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Discord Channel</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">Embed</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Posts rich cards with image thumbnail & direct download links.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('slack')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Slack Incoming Webhook</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">Blocks</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Pushes structured alert notifications into your team's Slack feed.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('zapier')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all text-left flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Zapier / Make / Custom API</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">JSON + HMAC</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Sends signed standard JSON for automated workflows & backend services.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Webhook Documentation & Payload Spec (Collapsible) */}
      {showDocs && (
        <div className="p-6 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Webhook Event Payload Specification
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(sampleJsonPayload, null, 2), 'spec-copy')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5"
            >
              {copiedId === 'spec-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'spec-copy' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            When an image is uploaded to ImgSphere, an HTTP <code className="text-blue-300 font-mono">POST</code> request is dispatched to your endpoint with the header <code className="text-amber-300 font-mono">X-ImgSphere-Event: image.created</code> and an HMAC-SHA256 signature in <code className="text-amber-300 font-mono">X-ImgSphere-Signature: sha256=...</code> if a secret is provided.
          </p>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-200 overflow-x-auto max-h-64 scrollbar-thin">
            {JSON.stringify(sampleJsonPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Webhook Endpoints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Configured Endpoints ({userWebhooks.length})</span>
          </h3>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time HTTP push on image upload
          </span>
        </div>

        {userWebhooks.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No webhooks configured yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Configure your first webhook endpoint to receive immediate notifications when images are uploaded, viewed, or managed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Configure First Webhook</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userWebhooks.map((wh, idx) => {
              const isTesting = testingId === wh.id;
              const hasRecentTest = testResult?.webhookId === wh.id;

              return (
                <div
                  key={`wh-${wh.id || 'wh'}-${idx}`}
                  className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                    wh.is_active
                      ? 'border-slate-200/90 dark:border-slate-800 shadow-sm'
                      : 'border-slate-200/50 dark:border-slate-800/50 opacity-75 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            wh.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {wh.name}
                        </h4>

                        {/* Format Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {wh.format === 'discord'
                            ? 'Discord'
                            : wh.format === 'slack'
                            ? 'Slack'
                            : 'JSON REST'}
                        </span>

                        {/* Secret Indicator */}
                        {wh.secret && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>HMAC Signed</span>
                          </span>
                        )}

                        {/* Status tag */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            wh.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {wh.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      {/* URL bar with copy */}
                      <div className="flex items-center gap-2 max-w-xl">
                        <div className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                          {wh.url}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(wh.url, wh.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          {copiedId === wh.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Events Subscribed */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Subscribed:</span>
                        {wh.events.map((ev) => (
                          <span
                            key={ev}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/30"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      {/* Test Trigger Button */}
                      <button
                        type="button"
                        onClick={() => handleTestTrigger(wh)}
                        disabled={isTesting}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                        title="Dispatch test image.created event to this webhook"
                      >
                        {isTesting ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                        <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                      </button>

                      {/* Toggle Active Button */}
                      <button
                        type="button"
                        onClick={() => toggleWebhook(wh.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          wh.is_active
                            ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={wh.is_active ? 'Pause webhook' : 'Activate webhook'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(wh)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="Edit webhook settings"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteWebhook(wh)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/40"
                        title="Delete webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery Stats & Last Result Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Last triggered:{' '}
                          {wh.last_triggered_at
                            ? new Date(wh.last_triggered_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Never'}
                        </span>
                      </div>

                      {wh.last_status && (
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              wh.last_status >= 200 && wh.last_status < 300
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            HTTP {wh.last_status} {wh.last_status_text ? `(${wh.last_status_text})` : ''}
                          </span>
                        </div>
                      )}

                      <div>
                        Deliveries:{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {wh.successful_deliveries || 0} / {wh.total_deliveries || 0}
                        </span>
                      </div>
                    </div>

                    {/* Instant Test Output Notice */}
                    {hasRecentTest && (
                      <div
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                          testResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          Test Result: {testResult.statusCode || 'Error'} ({testResult.durationMs}ms) - {testResult.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Webhook Delivery Logs History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Recent Delivery Logs ({userLogs.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              History of outbound webhook pings triggered by image uploads or manual tests.
            </p>
          </div>

          {userLogs.length > 0 && (
            <button
              type="button"
              onClick={() => clearWebhookLogs()}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {userLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No deliveries logged yet. Upload an image or click "Test Ping" above to record a dispatch.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Endpoint Name</th>
                  <th className="pb-3 font-semibold">Latency</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {userLogs.slice(0, 10).map((log, idx) => (
                  <tr key={`wh-log-${log.id || 'log'}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50'
                        }`}
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{log.status_code || 'ERR'}</span>
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                      {log.event}
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {log.webhook_name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">
                      {log.duration_ms} ms
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Webhook Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Webhook className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingWebhook ? 'Edit Webhook Endpoint' : 'Configure New Webhook'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Webhook Friendly Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Discord Media Channel, Zapier Media Ingest"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payload Destination URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/... or https://api.yourdomain.com/webhook"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Must be an accessible HTTP POST endpoint.
                </p>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payload Format & Envelope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('json_standard')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      format === 'json_standard'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Standard JSON</div>
                    <div className="text-[10px] opacity-75">APIs & Zapier</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('discord')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      format === 'discord'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Discord</div>
                    <div className="text-[10px] opacity-75">Card Embeds</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('slack')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      format === 'slack'
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Slack</div>
                    <div className="text-[10px] opacity-75">Block Kit</div>
                  </button>
                </div>
              </div>

              {/* Signing Secret */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Signing Secret (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSecret}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Generate Random Secret
                  </button>
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_... (used for X-ImgSphere-Signature HMAC verification)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ImgSphere will hash the body with this secret and send an <code className="font-mono text-slate-500">X-ImgSphere-Signature: sha256=...</code> header.
                </p>
              </div>

              {/* Event Subscriptions */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trigger Events
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events.includes('image.created')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEvents([...events, 'image.created']);
                        } else {
                          setEvents(events.filter((ev) => ev !== 'image.created'));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        image.created <span className="text-[10px] text-blue-600 font-bold uppercase">(Primary)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Dispatches immediately whenever a new image is uploaded to ImgSphere
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events.includes('image.deleted')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEvents([...events, 'image.deleted']);
                        } else {
                          setEvents(events.filter((ev) => ev !== 'image.deleted'));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        image.deleted
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Dispatches when an image is permanently removed from storage
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status active */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Enable and activate this webhook immediately
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {editingWebhook ? 'Save Changes' : 'Create Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Log Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Webhook Dispatch Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">Destination URL</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {selectedLog.url}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">Response Code & Latency</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  HTTP {selectedLog.status_code} ({selectedLog.duration_ms} ms)
                </span>
              </div>
            </div>

            {/* Dispatched Payload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dispatched Request Payload
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(JSON.stringify(selectedLog.request_payload, null, 2), 'log-payload')
                  }
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId === 'log-payload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 scrollbar-thin">
                {JSON.stringify(selectedLog.request_payload, null, 2)}
              </pre>
            </div>

            {/* Response Body */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Response Received from Server
              </label>
              <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 scrollbar-thin">
                {selectedLog.response_body || '(No response body returned)'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
