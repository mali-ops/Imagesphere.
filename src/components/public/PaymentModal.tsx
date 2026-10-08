import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingPlan } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import {
  X,
  CreditCard,
  Building,
  User,
  Copy,
  Check,
  UploadCloud,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Info,
  Layers,
  HardDrive,
  FileText,
} from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan | { id: string; name: string; monthly_price: number; annual_price?: number; storage_gb?: number; max_file_mb?: number; description?: string } | string | null;
  billingCycle?: 'monthly' | 'annual';
  discountPercent?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle = 'monthly',
  discountPercent = 0,
}) => {
  const { systemSettings, currentUser, submitPaymentRequest, addToast } = useApp();

  // Normalize plan object
  const normalizedPlan = React.useMemo(() => {
    if (!plan) return null;
    if (typeof plan === 'string') {
      const isPrime = plan.toLowerCase().includes('prime');
      return {
        id: isPrime ? 'plan_prime' : 'plan_pro',
        name: isPrime ? 'Prime Creator' : 'Pro Studio',
        monthly_price: isPrime ? 4.99 : 9.99,
        annual_price: isPrime ? 3.99 : 7.99,
        storage_gb: isPrime ? 15 : 50,
        max_file_mb: isPrime ? 35 : 100,
        description: isPrime
          ? '15 GB High-Speed Cloud Storage for Creators'
          : '50 GB Ultra Cloud Media Storage for Professionals',
      };
    }
    return plan;
  }, [plan]);

  const [activePaymentChannel, setActivePaymentChannel] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');

  // Customer & Payment Details State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderAccountOrPhone, setSenderAccountOrPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Voucher screenshot file & preview
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    email: string;
    planName: string;
    amount: number;
    transactionId?: string;
    method?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentUser?.email || '');
      setFullName(currentUser?.full_name || '');
      setSenderName(currentUser?.full_name || '');
      setSenderAccountOrPhone('');
      setTransactionId('');
      setNotes('');
      setVoucherFile(null);
      setVoucherPreview(null);
      setIsSubmitted(false);
      setSubmittedData(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !normalizedPlan) return null;

  // Calculate final amount
  const basePrice = billingCycle === 'annual' ? (normalizedPlan.annual_price || normalizedPlan.monthly_price) : normalizedPlan.monthly_price;
  const billedCycles = billingCycle === 'annual' ? 12 : 1;
  const rawTotal = basePrice * billedCycles;
  const finalAmount =
    discountPercent > 0
      ? Number((rawTotal * (1 - discountPercent / 100)).toFixed(2))
      : rawTotal;

  // PKR Conversion approximation
  const pkrRate = 280;
  const estimatedPkr = Math.round(finalAmount * pkrRate);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast('Copied to Clipboard', `${fieldName} copied successfully!`, 'info');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Invalid File Format', 'Please upload an image screenshot of your payment receipt (PNG, JPG, WebP).', 'error');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addToast('Email Required', 'Please provide a valid account email address.', 'error');
      return;
    }

    if (!transactionId.trim()) {
      addToast('Transaction ID Required', 'Please enter your Transaction Reference ID / Trx ID from your payment SMS/receipt.', 'warning');
      return;
    }

    if (!voucherPreview) {
      addToast('Payment Screenshot Required', 'Please upload a screenshot or photo of your payment receipt/transfer.', 'error');
      return;
    }

    setIsSubmitting(true);

    const paymentMethodLabel =
      activePaymentChannel === 'easypaisa'
        ? 'EasyPaisa'
        : activePaymentChannel === 'jazzcash'
        ? 'JazzCash'
        : 'Bank Transfer (Meezan)';

    try {
      const created = await submitPaymentRequest({
        plan_id: normalizedPlan.id,
        plan_name: normalizedPlan.name,
        billing_cycle: billingCycle,
        amount: finalAmount,
        currency: 'USD',
        customer_email: cleanEmail,
        customer_name: fullName.trim() || undefined,
        payment_method: paymentMethodLabel,
        sender_account_or_phone: senderAccountOrPhone.trim() || undefined,
        sender_name: senderName.trim() || undefined,
        transaction_id: transactionId.trim() || undefined,
        voucher_url: voucherPreview,
        voucher_file_name: voucherFile?.name || 'payment_proof.jpg',
        voucher_file_size: voucherFile?.size || 0,
        notes: notes.trim() || undefined,
      });

      setSubmittedData({
        id: created.id,
        email: created.customer_email,
        planName: created.plan_name,
        amount: created.amount,
        transactionId: created.transaction_id,
        method: paymentMethodLabel,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      addToast('Submission Failed', err.message || 'Unable to submit payment request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment channel accounts
  const bankName = systemSettings.bank_name || 'Meezan Bank Ltd';
  const bankAccountTitle = systemSettings.account_title || 'ImgSphere Cloud Media Global';
  const bankAccountNumber = systemSettings.account_number || '0102-0103492810';
  const bankAccountIban = systemSettings.account_iban || 'PK36MEZN0001020103492810';

  const easypaisaTitle = systemSettings.easypaisa_account_title || 'ImgSphere Official / Ali Raza';
  const easypaisaNumber = systemSettings.easypaisa_account_number || '0300-1234567';

  const jazzcashTitle = systemSettings.jazzcash_account_title || 'ImgSphere Official / Ali Raza';
  const jazzcashNumber = systemSettings.jazzcash_account_number || '0301-9876543';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight flex items-center gap-2">
                <span>Purchase & Activate {normalizedPlan.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {normalizedPlan.storage_gb} GB Cloud
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ادائیگی کی تفصیلات دیکھیں اور رسید کا اسکرین شاٹ اپ لوڈ کریں
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {isSubmitted && submittedData ? (
            <div className="text-center py-6 px-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>زیرِ تصدیق • Verification in Progress</span>
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Payment Proof Submitted!
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  آپ کی ادائیگی کا اسکرین شاٹ اور تمام تفصیلات ایڈمن اور آنر ڈیش بورڈ پر موصول ہو چکی ہیں۔ تصدیق کے فوراً بعد آپ کا اکاونٹ ایکٹیویٹ کر دیا جائے گا۔
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Plan Requested:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedData.planName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{submittedData.method}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${submittedData.amount} USD (~Rs {Math.round(submittedData.amount * 280)})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedData.email}</span>
                </div>
                {submittedData.transactionId && (
                  <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Transaction ID (TRX):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{submittedData.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Pending Admin/Owner Approval</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  OK, Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plan Pricing & Storage Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-teal-600/10 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                      {normalizedPlan.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Includes {normalizedPlan.storage_gb} GB Cloud Storage • Max {normalizedPlan.max_file_mb} MB/file • No Free Trial
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ${finalAmount} <span className="text-xs font-normal text-slate-500">USD</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ≈ PKR {estimatedPkr.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* STEP 1: PAYMENT CHANNELS SELECTOR */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Step 1: Send Payment via EasyPaisa, JazzCash, or Bank
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg">
                    Official Accounts
                  </span>
                </div>

                {/* Channel Selector Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePaymentChannel('easypaisa')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      activePaymentChannel === 'easypaisa'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentChannel('jazzcash')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      activePaymentChannel === 'jazzcash'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-red-600" />
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentChannel('bank')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      activePaymentChannel === 'bank'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meezan Bank</span>
                  </button>
                </div>

                {/* Channel Details Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                  {activePaymentChannel === 'easypaisa' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Account Title</div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{easypaisaTitle}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          EasyPaisa Wallet
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Mobile Number</div>
                          <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm tracking-wider">
                            {easypaisaNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(easypaisaNumber, 'EasyPaisa Number')}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          {copiedField === 'EasyPaisa Number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'EasyPaisa Number' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activePaymentChannel === 'jazzcash' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Account Title</div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{jazzcashTitle}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                          JazzCash Wallet
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/60">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Mobile Number</div>
                          <div className="font-mono font-extrabold text-red-600 dark:text-red-400 text-sm tracking-wider">
                            {jazzcashNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(jazzcashNumber, 'JazzCash Number')}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-red-600 border border-red-300 dark:border-red-700 font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          {copiedField === 'JazzCash Number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'JazzCash Number' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activePaymentChannel === 'bank' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Bank Name & Title</div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{bankName} - {bankAccountTitle}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          Direct Wire
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/60">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Account Number</div>
                          <div className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm tracking-wider">
                            {bankAccountNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankAccountNumber, 'Bank Account')}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-blue-600 border border-blue-300 dark:border-blue-700 font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          {copiedField === 'Bank Account' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'Bank Account' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {bankAccountIban && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="min-w-0 pr-2">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">IBAN</div>
                            <div className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300 truncate">
                              {bankAccountIban}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankAccountIban, 'IBAN')}
                            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold shrink-0"
                          >
                            {copiedField === 'IBAN' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                    اپنے ایزی پیسہ، جاز کیش یا بینک ایپ سے رقم ٹرانسفر کریں اور ٹرانسفر کے بعد اسکرین شاٹ نیچے اپ لوڈ کریں۔
                  </p>
                </div>
              </div>

              {/* STEP 2: USER DETAILS & TRANSACTION DETAILS */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Step 2: Enter Sender & Transaction Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your login email"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction Reference ID (TRX ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 02938472918 or TID-9921"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Name / Account Holder
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Phone / Mobile Account
                    </label>
                    <input
                      type="text"
                      value={senderAccountOrPhone}
                      onChange={(e) => setSenderAccountOrPhone(e.target.value)}
                      placeholder="e.g. 0300-9876543"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* STEP 3: SCREENSHOT UPLOAD */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>
                      Upload Payment Screenshot / Receipt <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      PNG, JPG, WebP (Max 20MB)
                    </span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="voucher-upload-input"
                  />

                  {voucherPreview && voucherFile ? (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/80 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={voucherPreview}
                          alt="Voucher Screenshot Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {voucherFile.name}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Screenshot Ready • {formatBytes(voucherFile.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Remove screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white/60 dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload Paid Receipt Screenshot (یا ڈریگ اینڈ ڈراپ کریں)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Take a screenshot from EasyPaisa / JazzCash / Mobile Banking App
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes or Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes for Admin & Owner regarding your transfer..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Payment Proof...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Payment Proof for Verification (رسید جمع کرائیں)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  No auto-debit or trial. Your account is activated permanently once verified by Admin/Owner.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
