import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRequest } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import {
  CreditCard,
  Building,
  Smartphone,
  Copy,
  Check,
  UploadCloud,
  Calendar,
  Hash,
  User,
  Mail,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  X,
  ArrowRight,
  HardDrive,
  DollarSign,
  ChevronRight,
  HelpCircle,
  Zap,
} from 'lucide-react';

export interface PlanOption {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  storageGb: number;
  maxFileMb: number;
  description: string;
  isPopular?: boolean;
}

export const AVAILABLE_PLANS: PlanOption[] = [
  {
    id: 'plan_prime',
    name: 'Prime Creator',
    monthlyPrice: 4.99,
    annualPrice: 3.99,
    storageGb: 15,
    maxFileMb: 35,
    description: '15 GB High-Speed Cloud Storage for photographers & creators.',
  },
  {
    id: 'plan_pro',
    name: 'Pro Studio',
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    storageGb: 50,
    maxFileMb: 100,
    description: '50 GB Ultra Cloud Media Storage for design studios & heavy workloads.',
    isPopular: true,
  },
  {
    id: 'plan_business',
    name: 'Business Team',
    monthlyPrice: 29.0,
    annualPrice: 24.0,
    storageGb: 150,
    maxFileMb: 250,
    description: '150 GB Enterprise Media Vault with priority bandwidth & dedicated support.',
  },
];

export interface PaymentVerificationFormProps {
  initialPlanId?: string;
  initialBillingCycle?: 'monthly' | 'annual';
  onSuccess?: (request: PaymentRequest) => void;
  onCancel?: () => void;
  embedded?: boolean;
  title?: string;
  subtitle?: string;
}

export const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({
  initialPlanId = 'plan_pro',
  initialBillingCycle = 'monthly',
  onSuccess,
  onCancel,
  embedded = false,
  title = 'Payment Verification & Account Activation',
  subtitle = 'Submit your transaction details and payment proof screenshot to activate your high-capacity cloud storage plan.',
}) => {
  const { systemSettings, currentUser, submitPaymentRequest, addToast, navigateTo } = useApp();

  // Plan Selection State
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle);

  // Selected Plan Object
  const selectedPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId) || AVAILABLE_PLANS[1];

  // Channel tab: EasyPaisa, JazzCash, Bank
  const [activeChannel, setActiveChannel] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');

  // Today's date in YYYY-MM-DD
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Transaction Details Form State
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState(todayDateStr);
  const [paymentMethod, setPaymentMethod] = useState<'EasyPaisa' | 'JazzCash' | 'Bank Transfer (Meezan)' | 'Other'>('EasyPaisa');
  const [senderName, setSenderName] = useState(currentUser?.full_name || '');
  const [senderAccountOrPhone, setSenderAccountOrPhone] = useState('');
  const [accountEmail, setAccountEmail] = useState(currentUser?.email || '');
  const [customerName, setCustomerName] = useState(currentUser?.full_name || '');
  const [notes, setNotes] = useState('');

  // Screenshot Upload State
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PaymentRequest | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize email/name when currentUser updates
  useEffect(() => {
    if (currentUser) {
      if (!accountEmail) setAccountEmail(currentUser.email);
      if (!customerName) setCustomerName(currentUser.full_name);
      if (!senderName) setSenderName(currentUser.full_name);
    }
  }, [currentUser]);

  // Synchronize paymentMethod when activeChannel changes
  useEffect(() => {
    if (activeChannel === 'easypaisa') setPaymentMethod('EasyPaisa');
    else if (activeChannel === 'jazzcash') setPaymentMethod('JazzCash');
    else if (activeChannel === 'bank') setPaymentMethod('Bank Transfer (Meezan)');
  }, [activeChannel]);

  // Price calculations
  const unitPrice = billingCycle === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;
  const cyclesCount = billingCycle === 'annual' ? 12 : 1;
  const totalAmountUsd = Number((unitPrice * cyclesCount).toFixed(2));
  const pkrRate = 280;
  const estimatedPkr = Math.round(totalAmountUsd * pkrRate);

  // 1-Click Copy Helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast('Copied to Clipboard', `${fieldName} copied successfully!`, 'info');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Process File Upload
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Invalid Format', 'Please upload an image screenshot of your payment receipt (PNG, JPG, JPEG, WebP).', 'error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      addToast('File Too Large', 'Screenshot file size must be less than 20 MB.', 'error');
      return;
    }

    setVoucherFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setVoucherPreview(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveFile = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = accountEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addToast('Account Email Required', 'Please enter a valid email address associated with your account.', 'error');
      return;
    }

    const cleanTrx = transactionId.trim();
    if (!cleanTrx) {
      addToast('Transaction ID Required', 'Please enter your Transaction Reference ID / Trx ID from your payment SMS/receipt.', 'warning');
      return;
    }

    if (!transactionDate) {
      addToast('Transaction Date Required', 'Please specify the date when payment was sent.', 'warning');
      return;
    }

    if (!voucherPreview) {
      addToast('Payment Screenshot Required', 'Please upload a screenshot or photo of your payment receipt to complete verification.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await submitPaymentRequest({
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        billing_cycle: billingCycle,
        amount: totalAmountUsd,
        currency: 'USD',
        customer_email: cleanEmail,
        customer_name: customerName.trim() || undefined,
        payment_method: paymentMethod,
        sender_account_or_phone: senderAccountOrPhone.trim() || undefined,
        sender_name: senderName.trim() || undefined,
        transaction_id: cleanTrx,
        transaction_date: transactionDate,
        voucher_url: voucherPreview,
        voucher_file_name: voucherFile?.name || 'payment_proof.jpg',
        voucher_file_size: voucherFile?.size || 0,
        notes: notes.trim() || undefined,
      });

      setSubmittedRequest(created);
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: any) {
      addToast('Submission Failed', err.message || 'Unable to submit payment verification request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRequest(null);
    setTransactionId('');
    setTransactionDate(todayDateStr);
    setSenderAccountOrPhone('');
    setNotes('');
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Official Channel Accounts
  const easypaisaTitle = systemSettings.easypaisa_account_title || 'ImgSphere Official / Ali Raza';
  const easypaisaNumber = systemSettings.easypaisa_account_number || '0300-1234567';

  const jazzcashTitle = systemSettings.jazzcash_account_title || 'ImgSphere Official / Ali Raza';
  const jazzcashNumber = systemSettings.jazzcash_account_number || '0300-7654321';

  const bankName = systemSettings.bank_name || 'Meezan Bank Ltd';
  const bankTitle = systemSettings.account_title || 'ImgSphere Cloud Media Global';
  const bankNumber = systemSettings.account_number || '0102-0103492810';
  const bankIban = systemSettings.account_iban || 'PK36MEZN0001020103492810';

  // -------------------------------------------------------------
  // SUCCESS VIEW
  // -------------------------------------------------------------
  if (submittedRequest) {
    return (
      <div className={`w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-10 text-center animate-in fade-in duration-300 ${embedded ? '' : 'my-6'}`}>
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Admin/Owner Verification (تصدیق کے لیے روانہ)</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Payment Proof Submitted!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Your payment screenshot and transaction details have been dispatched to the Admin and Super Owner Headquarters for verification.
        </p>

        {/* Request Receipt Card */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Verification Request ID</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{submittedRequest.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Selected Plan</span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{submittedRequest.plan_name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Transaction ID (Trx ID)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{submittedRequest.transaction_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Payment Channel</span>
              <span className="font-semibold text-slate-900 dark:text-white">{submittedRequest.payment_method || 'Bank Transfer'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Amount</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">${submittedRequest.amount} USD</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Account Email</span>
              <span className="font-mono text-slate-900 dark:text-white truncate block">{submittedRequest.customer_email}</span>
            </div>
          </div>

          {/* Screenshot Preview in Success Card */}
          {submittedRequest.voucher_url && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={submittedRequest.voucher_url}
                  alt="Receipt"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                    {submittedRequest.voucher_file_name}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Screenshot Attached</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full</span>
              </button>
            </div>
          )}
        </div>

        {/* Verification Guarantee Notice */}
        <div className="mt-5 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white block">Next Steps:</span>
            Our team confirms transactions in real-time. Once the transfer appears on our account statement, your cloud storage quota is upgraded instantly with an official invoice.
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('dashboard-billing')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View Subscription Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Submit Another Payment
          </button>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={submittedRequest.voucher_url}
                alt="Payment Receipt Lightbox"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN FORM VIEW
  // -------------------------------------------------------------
  return (
    <div
      className={`w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden ${
        embedded ? '' : 'my-6'
      }`}
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Direct Bank & Mobile Wallet Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start md:self-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Form"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* ========================================================= */}
        {/* STEP 1: PLAN SELECTOR */}
        {/* ========================================================= */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                1. Select Target Storage Plan
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Choose the capacity you wish to activate with this payment.
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  billingCycle === 'annual'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {AVAILABLE_PLANS.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const price = billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md shadow-blue-600/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {p.isPopular && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                      Popular Choice
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        / mo {billingCycle === 'annual' ? '(billed yearly)' : ''}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 mb-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Storage Quota</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {p.storageGb} GB
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 2: OFFICIAL ACCOUNTS & PAYMENT INSTRUCTIONS */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                2. Official Payment Accounts
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Send <span className="font-bold text-slate-900 dark:text-white">${totalAmountUsd} USD</span> (approx. <span className="font-bold text-emerald-600">Rs. {estimatedPkr.toLocaleString()} PKR</span>) using any option below:
              </p>
            </div>

            {/* Channels Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveChannel('easypaisa')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChannel === 'easypaisa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>EasyPaisa</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('jazzcash')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChannel === 'jazzcash'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>JazzCash</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('bank')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChannel === 'bank'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Channel Detail Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            {activeChannel === 'easypaisa' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>EasyPaisa Mobile Account Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Title</span>
                      <span className="font-bold text-slate-900 dark:text-white">{easypaisaTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(easypaisaTitle, 'Account Title')}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy Title"
                    >
                      {copiedField === 'Account Title' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile / Account Number</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{easypaisaNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(easypaisaNumber, 'EasyPaisa Number')}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy Number"
                    >
                      {copiedField === 'EasyPaisa Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'jazzcash' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>JazzCash Mobile Account Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Title</span>
                      <span className="font-bold text-slate-900 dark:text-white">{jazzcashTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(jazzcashTitle, 'Account Title')}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account Title' ? <Check className="w-4 h-4 text-rose-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile / Account Number</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{jazzcashNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(jazzcashNumber, 'JazzCash Number')}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedField === 'JazzCash Number' ? <Check className="w-4 h-4 text-rose-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'bank' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <Building className="w-4 h-4" />
                  <span>{bankName} Official Wire Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Title</span>
                      <span className="font-bold text-slate-900 dark:text-white">{bankTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankTitle, 'Account Title')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account Title' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{bankNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankNumber, 'Account Number')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">IBAN Number</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{bankIban}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankIban, 'IBAN Number')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedField === 'IBAN Number' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 3: TRANSACTION DETAILS INPUTS */}
        {/* ========================================================= */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            3. Enter Transaction & Sender Details
          </label>
          <p className="text-xs text-slate-400 mb-4">
            Provide the details from your payment receipt or transfer confirmation SMS.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Transaction ID / Reference */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Transaction ID / Reference Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-9824710294 or EasyPaisa TID"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Trx ID shown on your mobile app or SMS</span>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Transaction Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  max={todayDateStr}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Date when money was transferred</span>
            </div>

            {/* Payment Method / Channel */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Channel Used
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-900 dark:text-white"
              >
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Transfer (Meezan)">Bank Transfer (Meezan)</option>
                <option value="Other">Other Bank / Wire</option>
              </select>
            </div>

            {/* Account Email (User to be upgraded) */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Account Email (Target Account) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Account that will be upgraded to {selectedPlan.name}</span>
            </div>

            {/* Sender Name */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sender Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Name on your bank/wallet account"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sender Phone or Account # */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sender Mobile / Account Number
              </label>
              <input
                type="text"
                value={senderAccountOrPhone}
                onChange={(e) => setSenderAccountOrPhone(e.target.value)}
                placeholder="e.g. 0300-XXXXXXX"
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div className="mt-4 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Additional Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid from brother's account or urgently needed for team project"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 4: PAYMENT PROOF SCREENSHOT UPLOAD */}
        {/* ========================================================= */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            4. Upload Payment Proof Screenshot <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Attach a clear screenshot of your transaction receipt, ATM slip, or confirmation SMS.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!voucherPreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Click to browse or drag & drop payment screenshot
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PNG, JPG, JPEG, WebP (Max 20 MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div
                  className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer shrink-0"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Click to view full screenshot"
                >
                  <img
                    src={voucherPreview}
                    alt="Receipt Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>

                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-xs">
                    {voucherFile?.name || 'payment_proof_receipt.jpg'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {voucherFile ? formatBytes(voucherFile.size) : 'Ready for verification'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Screenshot attached successfully</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SUBMISSION & SECURITY SUMMARY */}
        {/* ========================================================= */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Direct verification by Admin & Owner Headquarters within hours.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Total to activate:</span>{' '}
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                ${totalAmountUsd} USD
              </span>{' '}
              <span className="text-[11px] font-bold text-emerald-600">(Rs. {estimatedPkr.toLocaleString()})</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Submitting Verification Request...</span>
              </>
            ) : (
              <>
                <span>Submit Payment Proof & Initiate Activation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Lightbox Modal */}
      {isLightboxOpen && voucherPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-white text-xs">
              <span className="font-bold">Screenshot Inspection Preview</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={voucherPreview}
              alt="Payment Proof Full Lightbox"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
