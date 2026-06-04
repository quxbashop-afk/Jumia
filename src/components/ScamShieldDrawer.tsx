import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Send, 
  Lock, 
  BookOpen, 
  UserCheck, 
  X, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Product } from '../types';

interface ScamShieldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  allProducts: Product[];
  onSelectProduct?: (product: Product) => void;
  onToggleView?: (view: 'storefront' | 'orders' | 'seller' | 'admin' | 'support') => void;
}

export default function ScamShieldDrawer({
  isOpen,
  onClose,
  orders,
  allProducts,
  onSelectProduct,
  onToggleView
}: ScamShieldDrawerProps) {
  const [activeTab, setActiveTab] = useState<'safeguard' | 'verify' | 'report'>('safeguard');
  
  // Verification State
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    searched: boolean;
    found: boolean;
    order?: Order;
    message?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reporting State
  const [reportType, setReportType] = useState('price');
  const [offendingName, setOffendingName] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Live Verifier logic
  const handleVerifyOrder = () => {
    if (!verifyQuery.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);

    setTimeout(() => {
      const code = verifyQuery.trim().toUpperCase();
      const matched = orders.find(o => o.id.toUpperCase() === code || o.id.toUpperCase().includes(code));
      
      setIsVerifying(false);
      if (matched) {
        setVerifyResult({
          searched: true,
          found: true,
          order: matched,
          message: matched.status === 'Delivered' 
            ? '✅ Settlement Completed: Escrow funds have been successfully verified, released, and paid out'
            : `🔒 Escrow Safeguard Held: ₦${matched.totalPrice.toLocaleString()} is locked in Quxba secure trust. WILL NOT be released until physical Handover Verification PIN is entered.`
        });
      } else {
        setVerifyResult({
          searched: true,
          found: false,
          message: `❌ Warning: No payment escrow registered for reference "${code}". If a seller sent you a screenshot or receipt showing this ID, it is likely a spoofed fake proof of payment scam!`
        });
      }
    }, 900);
  };

  // Submit Report logic
  const handleReportScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offendingName.trim() || !reportDetails.trim()) return;
    setIsSubmittingReport(true);
    
    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportSuccess(true);
      setOffendingName('');
      setReportDetails('');
      setTimeout(() => setReportSuccess(false), 5000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 transition-opacity"
            id="scamshield-backdrop"
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 text-neutral-100 shadow-2xl z-50 flex flex-col border-l border-neutral-800 font-sans"
            id="scamshield-drawer"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-purple-800 via-violet-950 to-indigo-950 border-b border-purple-900 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 p-1.5 rounded-full border border-purple-500/30 text-[#a78bfa] animate-pulse">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-widest uppercase text-white font-mono flex items-center gap-1">
                    Quxba ScamShield™
                    <span className="text-[8px] bg-red-600 text-white font-mono rounded px-1 animate-pulse">LIVE</span>
                  </h2>
                  <p className="text-[10px] text-purple-200">Zero-Trust Buyer-Seller Protection Suite</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white cursor-pointer"
                aria-label="Close ScamShield"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Warning Bar */}
            <div className="bg-amber-500/15 border-b border-amber-500/10 p-2.5 px-4 text-[11px] text-amber-200 leading-normal flex items-start gap-2 select-none">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Lagos Dispatch Shield Rule:</strong> Always verify physical condition before releasing your 4-digit verification code. Never pay offline directly!
              </span>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-950 text-xs text-center select-none font-bold shrink-0">
              <button
                onClick={() => setActiveTab('safeguard')}
                className={`py-3.5 border-b-2 transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'safeguard' 
                    ? 'border-[#a78bfa] text-white bg-neutral-900' 
                    : 'border-transparent text-gray-500 hover:text-neutral-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Playbook</span>
              </button>
              
              <button
                onClick={() => setActiveTab('verify')}
                className={`py-3.5 border-b-2 transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'verify' 
                    ? 'border-[#a78bfa] text-white bg-neutral-900' 
                    : 'border-transparent text-gray-500 hover:text-neutral-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Verify Ledger</span>
              </button>
              
              <button
                onClick={() => setActiveTab('report')}
                className={`py-3.5 border-b-2 transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'report' 
                    ? 'border-[#a78bfa] text-white bg-neutral-900' 
                    : 'border-transparent text-gray-500 hover:text-neutral-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Abuse</span>
              </button>
            </div>

            {/* Drawer Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* TAB 1: HOW ESCROW SAFEGUARD WORKS & ADVISORY PLAYBOOK */}
              {activeTab === 'safeguard' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="border border-purple-500/20 bg-purple-950/20 p-4 rounded-xl space-y-2">
                    <h3 className="text-xs font-black uppercase text-[#a78bfa] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Quxba Escrow Safe-Hold Guarantee
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                      Whether paying online via Paystack, bank transfer, or with Cash on Delivery (COD), Quxba shields your funds automatically.
                    </p>
                    <div className="relative border-l-2 border-purple-500 pl-3.5 space-y-2.5 pt-1.5">
                      <div className="text-[11px]">
                        <span className="font-extrabold text-white block">Step 1: Check-out safely</span>
                        <span className="text-neutral-400">Buy goods through the Quxba cart system. Your payment or promise is registered under a secure order document.</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="font-extrabold text-white block">Step 2: Private Handover PIN Generates</span>
                        <span className="text-neutral-400">You instantly receive a private 4-digit Handover PIN inside your account dashboard tracking list.</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="font-extrabold text-white block">Step 3: Verification & Settlement</span>
                        <span className="text-neutral-400">The dispatch rider presents the goods. Inspect them first! Only when satisfied, hand the rider your PIN. They enter it to complete delivery.</span>
                      </div>
                    </div>
                  </div>

                  {/* Red flags for Buyers */}
                  <div className="border border-neutral-800 bg-neutral-950 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5 font-mono">
                      🔴 Critical Buyer Warning Flags
                    </h3>
                    
                    <ul className="text-xs text-neutral-300 space-y-2.5 list-disc pl-4 font-normal">
                      <li>
                        <strong>Direct Transfer Requests:</strong> Never listen to seller pitches asking to cancel the Quxba order and "pay directly to my absolute Personal Bank Account to get 10% discount". These are almost always scams.
                      </li>
                      <li>
                        <strong>Offsite Communication:</strong> Avoid moving conversation entirely to Whatsapp/Telegram with unverified private vendors. Keep all discussions on-platform.
                      </li>
                      <li>
                        <strong>Delivery Agent Imposters:</strong> Real dispatch agents will require your 4-digit receipt code. Do NOT give them the code until you physically hold and inspect the box contents!
                      </li>
                      <li>
                        <strong>Suspiciously Low/Cheap Prices:</strong> If an original iPhone is priced at ₦120,000 (standard is ₦600,000+), it is either counterfeit or a pre-payment delivery trap.
                      </li>
                    </ul>
                  </div>

                  {/* Red flags for Sellers */}
                  <div className="border border-neutral-800 bg-neutral-950 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 font-mono">
                      🌐 Critical Seller Warning Flags
                    </h3>
                    
                    <ul className="text-xs text-neutral-300 space-y-2.5 list-disc pl-4 font-normal">
                      <li>
                        <strong>Fake Bank Slip / Forged Proofs of Payment:</strong> Scammers frequently forge receipts using graphic design editors. Never trust a picture. Wait until your Quxba Seller balance reflects the payment.
                      </li>
                      <li>
                        <strong>The "Overpayment Refund" Scam:</strong> If a buyer claims they transferred "too much" money and asks you to refund the change, do not transfer any raw cash back. This is typical checks fraud.
                      </li>
                      <li>
                        <strong>Buyer Claim of Non-Receipt:</strong> Demanding delivery handshakes under camera, or always validating the 4-digit PIN secures your seller protection payouts.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE ESCROW LEDGER CHECKER */}
              {activeTab === 'verify' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-white uppercase font-mono">verify escrow registry</h3>
                    <p className="text-xs text-neutral-400 leading-normal">
                      Instantly query current order files in the secure database. This verifies if the purchase was legitimately processed and if money is officially certified in safe custody.
                    </p>
                  </div>

                  {/* Input form */}
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-2 pb-4">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Reference ID (e.g. QUX-120938)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={verifyQuery}
                          onChange={(e) => setVerifyQuery(e.target.value)}
                          placeholder="Type Order Code..."
                          className="w-full bg-neutral-900 border border-neutral-700 p-2 pl-8 text-xs font-mono font-bold uppercase rounded text-white focus:outline-none focus:border-purple-500"
                        />
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <button
                        onClick={handleVerifyOrder}
                        disabled={isVerifying || !verifyQuery.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white font-black text-xs px-4 py-2 rounded font-mono uppercase cursor-pointer"
                      >
                        {isVerifying ? 'Scanning...' : 'Verify'}
                      </button>
                    </div>
                  </div>

                  {/* Result Panel */}
                  {isVerifying && (
                    <div className="p-12 text-center animate-pulse flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">Scanning secure ledger corridors...</p>
                    </div>
                  )}

                  {!isVerifying && verifyResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border leading-relaxed text-xs shadow-md font-sans ${
                        verifyResult.found 
                          ? verifyResult.order?.status === 'Delivered' 
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                            : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <h4 className="font-extrabold uppercase font-mono tracking-widest text-white text-[12px] mb-2 border-b border-white/10 pb-1.5 flex items-center gap-1">
                        <Activity className="w-4 h-4 text-purple-400" />
                        SECURE REGISTRY STATUS
                      </h4>
                      <p className="font-semibold">{verifyResult.message}</p>

                      {verifyResult.found && verifyResult.order && (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 font-mono text-[10.5px]">
                          <div className="flex justify-between">
                            <span className="text-neutral-450 text-neutral-400">Order ID:</span>
                            <span className="font-extrabold text-white">{verifyResult.order.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450 text-neutral-400">Escrow Value:</span>
                            <span className="font-extrabold text-white">₦{verifyResult.order.totalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450 text-neutral-400">Ship Address City:</span>
                            <span className="font-extrabold text-white">{verifyResult.order.city || 'Lagos'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450 text-neutral-400">Logistic Step:</span>
                            <span className="font-extrabold text-white bg-white/10 px-1.5 py-0.5 rounded text-[9.5px] uppercase">{verifyResult.order.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450 text-neutral-400">Fulfillment Date:</span>
                            <span className="font-extrabold text-[#c084fc]">{verifyResult.order.date}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Active listings verifications check alerts list */}
                  <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl">
                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2 select-none">Recently Tracked Safe Escrows</h4>
                    {orders.length === 0 ? (
                      <p className="text-[10.5px] text-gray-500 italic">No orders logged in system memory yet. Place an order to see its secure hold in detail.</p>
                    ) : (
                      <div className="divide-y divide-neutral-850">
                        {orders.slice(0, 3).map(o => (
                          <div 
                            key={o.id} 
                            onClick={() => setVerifyQuery(o.id)}
                            className="py-2 flex items-center justify-between text-xs text-neutral-300 hover:text-white cursor-pointer group transition"
                          >
                            <span className="font-mono text-[11px] group-hover:underline text-purple-400">{o.id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] font-semibold text-gray-400">₦{o.totalPrice.toLocaleString()}</span>
                              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REPORT FRAUD OR SCAMMER LISTING */}
              {activeTab === 'report' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase font-mono">community safety line</h3>
                    <p className="text-xs text-neutral-400 leading-normal">
                      Report unverified listings, replica goods, or sellers attempting suspicious payment terms outside the official Quxba checkout.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {reportSuccess ? (
                      <motion.div
                        key="report-success-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-purple-950/20 border border-purple-500/30 p-6 rounded-xl text-center space-y-3"
                      >
                        <div className="bg-purple-500/10 text-[#a78bfa] p-3 rounded-full inline-block">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Report Logged and Saved!</h4>
                        <p className="text-[11px] text-purple-200 leading-relaxed font-normal">
                          Thank you! Quxba cyber-integrity units have received this incident. Flagged parameters, device footprints, and IPs are cached securely. We will contact the related merchant immediately.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="report-form-body"
                        onSubmit={handleReportScam}
                        className="space-y-4 font-sans"
                      >
                        {/* Report category selection */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Abuse Classification *</label>
                          <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="price">🚨 Extremely Suspicious Listing Pricing</option>
                            <option value="direct_pay">⚠️ Seller Demanding Offline Direct Transfer</option>
                            <option value="offsite">💬 Asking keyword to move to whatsapp/offline channel</option>
                            <option value="fake_receipt">📌 Forged Receipt / Bank Alert Spoofing</option>
                            <option value="fake_product">📦 Counterfeit Replica or Scam Description</option>
                          </select>
                        </div>

                        {/* Store or Listing Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Seller Brand / Product / Order reference *</label>
                          <input
                            type="text"
                            required
                            value={offendingName}
                            onChange={(e) => setOffendingName(e.target.value)}
                            placeholder="e.g. Kola electronics or Order reference QUX-101..."
                            className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-xs font-semibold text-white focus:outline-none"
                          />
                        </div>

                        {/* Details textarea */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Incident Incident Breakdown & Details *</label>
                          <textarea
                            rows={4}
                            required
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            placeholder="Enter detailed facts. Provide copy-pasted correspondence or payment request numbers if any."
                            className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-xs font-semibold text-white focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmittingReport}
                          className="w-full bg-red-650 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-xs py-3 rounded uppercase tracking-wider shadow transition disabled:bg-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReport ? 'Filing Security Log...' : 'File Shield Report'}</span>
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>

            {/* Bottom Footer Info */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-1 text-center text-gray-500 text-[10px] shrink-0 select-none">
              <span className="font-bold text-gray-400 uppercase tracking-wide block">🔒 Powered by Quxba Multi-Tier Escrow Protocol</span>
              <span>All platform operations are audited strictly under security codes.</span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
