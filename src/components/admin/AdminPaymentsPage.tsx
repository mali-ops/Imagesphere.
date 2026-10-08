import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRequest, PaymentRequestStatus } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Trash2,
  ShieldCheck,
  Building,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  UserCheck,
  FileText,
  Maximize2,
  RefreshCw,
  Edit3,
  Save,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const {
    paymentRequests,
    updatePaymentRequestStatus,
    deletePaymentRequest,
    confirm,
    addToast,
    systemSettings,
    updateSystemSettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentRequestStatus>('all');
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<PaymentRequest | null>(null);
  const [rejectingReq, setRejectingReq] = useState<PaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment transfer was not credited to our official bank/wallet account statement.');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Bank & Payment Configuration Edit Modal State
  const [isBankEditModalOpen, setIsBankEditModalOpen] = useState(false);
  const [editBankName, setEditBankName] = useState('');
  const [editAccountTitle, setEditAccountTitle] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editAccountIban, setEditAccountIban] = useState('');
  const [editPaymentInstructions, setEditPaymentInstructions] = useState('');
  const [editPaymentContactNote, setEditPaymentContactNote] = useState('');

  const handleOpenBankEditModal = () => {
    setEditBankName(systemSettings.bank_name || 'Meezan Bank Ltd / Standard Chartered');
    setEditAccountTitle(systemSettings.account_title || 'ImgSphere Cloud Media Global');
    setEditAccountNumber(systemSettings.account_number || '0102-0103492810');
    setEditAccountIban(systemSettings.account_iban || 'PK36MEZN0001020103492810');
    setEditPaymentInstructions(
      systemSettings.payment_instructions ||
        'Transfer the exact subscription amount to the official bank account listed above via Mobile Banking App, ATM, or Online Wire. Once completed, take a screenshot of your transaction receipt/voucher and upload it below along with your account email.'
    );
    const rawNote = systemSettings.payment_contact_note;
    setEditPaymentContactNote(
      !rawNote || rawNote.includes('Hamari team')
        ? 'Our team will contact you within 24 hours to verify payment and activate your premium plan.'
        : rawNote
    );
    setIsBankEditModalOpen(true);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      bank_name: editBankName.trim(),
      account_title: editAccountTitle.trim(),
      account_number: editAccountNumber.trim(),
      account_iban: editAccountIban.trim(),
      payment_instructions: editPaymentInstructions.trim(),
      payment_contact_note: editPaymentContactNote.trim(),
    });
    setIsBankEditModalOpen(false);
    addToast(
      'Bank Details Updated Live',
      'The new bank account details and instructions are now active in the plan upgrade modal.',
      'success'
    );
  };

  // Filtered requests
  const filteredRequests = paymentRequests.filter((req) => {
    const matchesFilter = statusFilter === 'all' || req.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      req.customer_email.toLowerCase().includes(query) ||
      (req.customer_name && req.customer_name.toLowerCase().includes(query)) ||
      req.plan_name.toLowerCase().includes(query) ||
      (req.transaction_id && req.transaction_id.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  // KPI Metrics
  const totalCount = paymentRequests.length;
  const pendingCount = paymentRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = paymentRequests.filter((r) => r.status === 'approved').length;
  const rejectedCount = paymentRequests.filter((r) => r.status === 'rejected').length;
  const totalRevenue = paymentRequests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleApprove = (req: PaymentRequest) => {
    updatePaymentRequestStatus(
      req.id,
      'approved',
      req.admin_notes || 'Verified against payment proof statement. Subscription activated.'
    );
    addToast(
      'Subscription Activated Successfully 🎉',
      `${req.customer_email} upgraded to ${req.plan_name}. Storage and subscription are now active!`,
      'success'
    );
  };

  const handleOpenRejectModal = (req: PaymentRequest) => {
    setRejectingReq(req);
    setRejectReason('Payment transfer was not credited to our official bank/wallet account statement.');
  };

  const handleConfirmReject = () => {
    if (!rejectingReq) return;
    updatePaymentRequestStatus(
      rejectingReq.id,
      'rejected',
      rejectReason.trim() || 'Payment rejected by Administrator'
    );
    addToast(
      'Payment Request Rejected',
      `Payment submission for ${rejectingReq.customer_email} marked as rejected.`,
      'warning'
    );
    setRejectingReq(null);
  };

  const handleDelete = (req: PaymentRequest) => {
    confirm({
      title: 'Delete Payment Record',
      message: `Permanently delete this payment record (${req.id}) for ${req.customer_email}?`,
      confirmLabel: 'Delete Record',
      isDestructive: true,
      onConfirm: () => {
        deletePaymentRequest(req.id);
      },
    });
  };

  const handleSaveNotes = (id: string) => {
    updatePaymentRequestStatus(
      id,
      paymentRequests.find((r) => r.id === id)?.status || 'pending',
      adminNoteInput.trim()
    );
    setEditingNotesId(null);
    setAdminNoteInput('');
    addToast('Admin Note Saved', 'Payment record notes updated.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Billing & Audits
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse">
                {pendingCount} Pending Verification
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manual Payments & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review customer bank deposit slips, verify payment vouchers, and activate subscription plans within 24 hours.
          </p>
        </div>

        {/* Bank Details Indicator Card with Quick Edit */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-xs min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Receiving Account</div>
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {systemSettings.bank_name || 'Meezan Bank'}
              </div>
              <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                {systemSettings.account_number || '0102-0103492810'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenBankEditModal}
            className="px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Bank Details</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Vouchers</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires 24h verification</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Approved Plans</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {approvedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Storage quota upgraded</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Inquiries</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All recorded submissions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Approved Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">USD confirmed received</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors shrink-0 flex items-center gap-1.5 ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{filter}</span>
              {filter === 'pending' && pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, transaction ID, plan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Payment Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Payment Requests Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No results matching "${searchQuery}". Try changing your search or filter.`
              : 'When users click paid plans and submit payment vouchers, they will appear right here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req, idx) => (
            <div
              key={`admin-pay-${req.id || 'p'}-${idx}`}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row gap-5 items-start justify-between"
            >
              {/* Left Column: Customer & Plan Details */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0 flex-1">
                {/* Voucher Thumbnail */}
                <div
                  onClick={() => setSelectedVoucherForModal(req)}
                  className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer shadow-xs"
                  title="Click to view full voucher screenshot"
                >
                  <img
                    src={req.voucher_url}
                    alt="Payment Voucher Slip"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                    Slip
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/40'
                      }`}
                    >
                      {req.status}
                    </span>

                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.plan_name}
                    </span>

                    <span className="text-xs text-slate-500 capitalize">
                      ({req.billing_cycle})
                    </span>

                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">
                      ${req.amount} USD
                    </span>
                  </div>

                  {/* Customer Email & Name */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.customer_email}</span>
                    </div>

                    {req.customer_name && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Name:</span>
                        <span>{req.customer_name}</span>
                      </div>
                    )}

                    {req.transaction_id && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <span className="text-slate-400">Ref:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {req.transaction_id}
                        </span>
                      </div>
                    )}

                    {req.transaction_date && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/50">
                        <Calendar className="w-3 h-3" />
                        <span>Trx Date: {req.transaction_date}</span>
                      </div>
                    )}
                  </div>

                  {/* Submitted Date & Voucher File Name */}
                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(req.created_at).toLocaleString()}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate max-w-xs">{req.voucher_file_name}</span>
                    {req.voucher_file_size && (
                      <>
                        <span>•</span>
                        <span>{formatBytes(req.voucher_file_size)}</span>
                      </>
                    )}
                  </div>

                  {/* Customer Notes */}
                  {req.notes && (
                    <div className="mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Customer Note:</span>{' '}
                      {req.notes}
                    </div>
                  )}

                  {/* Admin Notes */}
                  {req.admin_notes && (
                    <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                      <span className="font-bold">Admin Audit Note:</span> {req.admin_notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                {/* View Voucher Screenshot */}
                <button
                  onClick={() => setSelectedVoucherForModal(req)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Inspect Slip</span>
                </button>

                {/* Approve Button */}
                {req.status !== 'approved' ? (
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    title="Click to instantly approve payment and upgrade user account"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Activate (منظور کریں)</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Plan ✓</span>
                  </span>
                )}

                {/* Reject Button */}
                {req.status !== 'rejected' && (
                  <button
                    onClick={() => handleOpenRejectModal(req)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800"
                    title="Reject payment proof"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(req)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Full-Screen Voucher Screenshot */}
      {selectedVoucherForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Voucher Slip — {selectedVoucherForModal.customer_email}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedVoucherForModal.plan_name} (${selectedVoucherForModal.amount} USD) • {selectedVoucherForModal.voucher_file_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedVoucherForModal.voucher_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Open image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedVoucherForModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Image Container */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-950/20">
              <img
                src={selectedVoucherForModal.voucher_url}
                alt="Full Payment Voucher Screenshot"
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-lg border border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Transaction ID: <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedVoucherForModal.transaction_id || 'Not provided'}</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedVoucherForModal.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedVoucherForModal);
                      setSelectedVoucherForModal(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Upgrade User (منظور کریں)</span>
                  </button>
                )}

                {selectedVoucherForModal.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      const target = selectedVoucherForModal;
                      setSelectedVoucherForModal(null);
                      handleOpenRejectModal(target);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Slip</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedVoucherForModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Bank Account & Payment Instructions */}
      {isBankEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Edit Receiving Bank & Payment Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live updates the official account info and instructions shown to upgrading users.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBankEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBankDetails} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank / Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    placeholder="e.g. Meezan Bank Ltd / Standard Chartered"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Account Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Title (Beneficiary Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAccountTitle}
                    onChange={(e) => setEditAccountTitle(e.target.value)}
                    placeholder="e.g. ImgSphere Cloud Media Global"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAccountNumber}
                    onChange={(e) => setEditAccountNumber(e.target.value)}
                    placeholder="e.g. 0102-0103492810"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* IBAN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    International IBAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={editAccountIban}
                    onChange={(e) => setEditAccountIban(e.target.value)}
                    placeholder="e.g. PK36MEZN0001020103492810"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Transfer Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transfer Instructions for Customers <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editPaymentInstructions}
                  onChange={(e) => setEditPaymentInstructions(e.target.value)}
                  placeholder="e.g. Transfer the exact subscription amount to the official bank account listed above..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This text appears in Step 1 right above the bank account details box.
                </p>
              </div>

              {/* Contact & Turnaround Notice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Turnaround Notice & Guarantee
                </label>
                <input
                  type="text"
                  required
                  value={editPaymentContactNote}
                  onChange={(e) => setEditPaymentContactNote(e.target.value)}
                  placeholder="e.g. Our team will contact you within 24 hours to verify payment and activate your premium plan."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Displayed with the clock icon in the submission form and the confirmation popup.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBankEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Bank Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Rejecting Payment Request */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Reject Payment Proof (رسید مسترد کریں)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You are rejecting the payment verification for <strong>{rejectingReq.customer_email}</strong> ({rejectingReq.plan_name} - ${rejectingReq.amount} USD). Please select or enter the reason for rejection:
            </p>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400">Quick Reason Preset</label>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  'Payment transfer was not credited to our official bank/wallet account statement.',
                  'Transaction ID (Trx ID) does not match bank records.',
                  'Screenshot receipt is blurred, unreadable, or cropped.',
                  'Amount sent is less than the required plan subscription price.',
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      rejectReason === reason
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Custom Rejection Note / Reason
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
