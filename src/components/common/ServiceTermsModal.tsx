import React from 'react';
import { 
  ArrowLeft,
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Lock, 
  UserCheck, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const SERVICE_REQUEST_TERMS_VERSION = 'service_request_terms_v1';

interface ServiceTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const ServiceTermsModal: React.FC<ServiceTermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isAccepted = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="service-terms-modal-backdrop" 
      className="fixed inset-0 z-[70] flex justify-center bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="service-terms-modal"
        className="relative bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Full Screen Top Navigation Header */}
        <div className="p-4 bg-slate-900 text-white relative flex items-center justify-between gap-3 border-b border-slate-800 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="back-terms-screen-btn"
              type="button"
              onClick={onClose}
              aria-label="Back to Service Request"
              className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-tight truncate">
                Terms &amp; Conditions
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                Needly Service Request Agreement
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Terms Screen Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed scroll-smooth bg-white">
          
          {/* Summary Banner */}
          <div className="p-3.5 sm:p-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950 space-y-1">
              <p className="font-semibold text-teal-900">Key Platform Notice</p>
              <p className="text-teal-900/90 leading-normal">
                Needly operates as a discovery and connection platform. The actual service transaction, schedule, performance, pricing, and safety arrangements exist directly and primarily between you (the customer) and the independent service provider.
              </p>
            </div>
          </div>

          {/* Section 2.1 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.1
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Nature of Needly</h3>
            </div>
            <p className="text-slate-600">
              Needly is a hyperlocal marketplace platform designed to help users discover and connect with individuals or businesses offering local services.
            </p>
            <p className="text-slate-600">
              Needly&apos;s primary role is to facilitate discovery, communication, and connection between users and service providers.
            </p>
            <p className="text-slate-600">
              Unless explicitly stated otherwise, Needly is <strong>not the service provider, employer, contractor, agent, partner, guarantor, or representative of the provider</strong>.
            </p>
          </section>

          {/* Section 2.2 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.2
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">User Responsibility</h3>
            </div>
            <p className="text-slate-600">
              By sending a service request, the user acknowledges that they are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Reviewing the provider&apos;s profile and service information.</li>
              <li>Checking the provider&apos;s experience, skills, portfolio, ratings, reviews, and other available information.</li>
              <li>Clearly communicating their requirements.</li>
              <li>Confirming pricing, availability, timing, location, deliverables, and other service conditions directly with the provider.</li>
              <li>Making their own decision regarding whether to hire the provider.</li>
              <li>Taking reasonable precautions before meeting or engaging with any provider.</li>
              <li>Complying with applicable laws and regulations.</li>
            </ul>
            <p className="text-slate-600 font-medium">
              The user should not rely solely on information displayed on Needly when making an important hiring or service decision.
            </p>
          </section>

          {/* Section 2.3 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.3
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Provider Responsibility</h3>
            </div>
            <p className="text-slate-600">
              Service providers are independently responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>The accuracy of information they provide.</li>
              <li>Their qualifications, skills, experience, pricing, availability, and service claims.</li>
              <li>Performing the service as agreed with the customer.</li>
              <li>Their conduct and communication with customers.</li>
              <li>Following applicable laws and regulations.</li>
              <li>Any required licenses, permissions, certifications, or professional qualifications.</li>
            </ul>
            <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Needly does not automatically guarantee that every provider possesses any particular qualification, license, certification, or level of experience unless Needly explicitly states that a particular verification has been completed.
            </p>
          </section>

          {/* Section 2.4 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.4
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Agreement Between User and Provider</h3>
            </div>
            <p className="text-slate-600">
              Any agreement regarding a service—including:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 py-1 text-xs text-slate-700">
              <span className="bg-slate-100 px-2 py-1 rounded">• Price</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Payment</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Scope of work</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Timing</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Location</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Deliverables</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Cancellation</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Refunds</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Rescheduling</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Quality expectations</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Additional charges</span>
              <span className="bg-slate-100 px-2 py-1 rounded">• Other conditions</span>
            </div>
            <p className="text-slate-600">
              should be mutually discussed and agreed between the user and provider. Needly is not automatically a party to such agreements.
            </p>
          </section>

          {/* Section 2.5 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.5
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Payments</h3>
            </div>
            <p className="text-slate-600">
              Unless a specific Needly payment system is explicitly provided, users should not assume that Needly processes, holds, guarantees, or protects payments made directly to providers.
            </p>
            <p className="text-slate-600">
              Users should independently confirm payment terms with the provider and exercise appropriate caution before making advance payments.
            </p>
            <p className="text-slate-500 text-xs">
              If Needly introduces an official payment system in the future, additional payment-specific terms may apply.
            </p>
          </section>

          {/* Section 2.6 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.6
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Safety and Personal Meetings</h3>
            </div>
            <p className="text-slate-600">
              Users and providers may choose to meet physically or interact directly. Users should take reasonable safety precautions, including where appropriate:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Meeting in safe/public locations.</li>
              <li>Avoiding unnecessary sharing of sensitive personal information.</li>
              <li>Verifying identity or relevant credentials where appropriate.</li>
              <li>Not sharing passwords, OTPs, financial credentials, or other confidential authentication information.</li>
              <li>Informing a trusted person when meeting an unknown individual.</li>
              <li>Reporting suspicious, threatening, fraudulent, or inappropriate behaviour to Needly.</li>
            </ul>
            <p className="text-rose-900 bg-rose-50 border border-rose-200/70 p-2.5 rounded-lg text-xs font-medium">
              Needly does not guarantee the personal safety, conduct, identity, or actions of any user or provider.
            </p>
          </section>

          {/* Section 2.7 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.7
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">No Guarantee</h3>
            </div>
            <p className="text-slate-600">
              Needly does not guarantee:
            </p>
            <div className="grid grid-cols-2 gap-1.5 py-1 text-xs text-slate-700">
              <span>• The quality of a service</span>
              <span>• Accuracy of provider info</span>
              <span>• Provider availability</span>
              <span>• Completion of a service</span>
              <span>• Specific results or outcomes</span>
              <span>• Provider behaviour</span>
              <span>• Customer behaviour</span>
              <span>• Pricing or value</span>
              <span className="col-span-2">• Compatibility between users and providers</span>
            </div>
            <p className="text-slate-600">
              Users and providers are responsible for making their own decisions and conducting appropriate checks.
            </p>
          </section>

          {/* Section 2.8 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.8
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Communication</h3>
            </div>
            <p className="text-slate-600">
              Needly may provide communication tools such as in-app messaging to facilitate interaction between users and providers. Users should use these tools responsibly and should not share unnecessary sensitive information.
            </p>
            <p className="text-slate-600">
              Needly may take appropriate action against accounts involved in abuse, fraud, harassment, threats, scams, illegal activity, or violation of Needly&apos;s policies.
            </p>
          </section>

          {/* Section 2.9 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.9
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Fraud, Misuse and Prohibited Activities</h3>
            </div>
            <p className="text-slate-600">Users must not use Needly for:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-700 pl-2">
              <span>• Fraud or scams</span>
              <span>• Illegal activities</span>
              <span>• Harassment or threats</span>
              <span>• Impersonation</span>
              <span>• Misrepresentation</span>
              <span>• Spam</span>
              <span>• Malicious activities</span>
              <span>• Platform abuse / law violation</span>
            </div>
            <p className="text-slate-600">Needly may suspend, restrict, or terminate accounts where appropriate.</p>
          </section>

          {/* Section 2.10 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.10
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Third-Party Services and External Links</h3>
            </div>
            <p className="text-slate-600">
              Providers may share external resources such as websites, Instagram, YouTube, LinkedIn, Behance, Facebook, or other professional links.
            </p>
            <p className="text-slate-600">
              Needly does not control third-party websites or platforms and is not responsible for their content, policies, security, availability, or actions. Users should review the relevant third party&apos;s terms and privacy policies before using external services.
            </p>
          </section>

          {/* Section 2.11 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.11
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Reviews and Ratings</h3>
            </div>
            <p className="text-slate-600">
              Users should provide honest and genuine reviews based on their actual experience. Fake, misleading, abusive, retaliatory, or manipulated reviews are prohibited. Needly may remove or restrict reviews that violate applicable policies.
            </p>
          </section>

          {/* Section 2.12 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.12
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Disputes</h3>
            </div>
            <p className="text-slate-600">
              Any dispute regarding the actual service—including service quality, payment, cancellation, refund, delay, damage, loss, personal conduct, or other issues—should primarily be addressed between the user and provider.
            </p>
            <p className="text-slate-600">
              Needly may provide reasonable platform-level assistance where appropriate, including reviewing reports or taking action against accounts that violate Needly policies, but Needly does not guarantee resolution of disputes between users and providers.
            </p>
          </section>

          {/* Section 2.13 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.13
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Needly&apos;s Limited Platform Role</h3>
            </div>
            <p className="text-slate-600">
              The user understands and acknowledges that Needly&apos;s primary role is to provide a marketplace platform for discovering and connecting with service providers.
            </p>
            <p className="text-slate-600">
              Once a user and provider connect, the parties are responsible for independently discussing and arranging the service. Needly does not supervise the physical performance of services and does not control the day-to-day conduct of users or providers.
            </p>
          </section>

          {/* Section 2.14 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.14
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Limitation of Responsibility</h3>
            </div>
            <p className="text-slate-600">
              To the extent permitted by applicable law, Needly shall not be responsible for losses, damages, disputes, injuries, fraud, misconduct, payment issues, service failures, delays, cancellations, or other consequences arising from interactions or arrangements between users and providers.
            </p>
            <p className="text-slate-600">
              Nothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited under applicable law.
            </p>
          </section>

          {/* Section 2.15 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                2.15
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Reporting Problems</h3>
            </div>
            <p className="text-slate-600">
              Users are encouraged to report suspicious, fraudulent, unsafe, abusive, or policy-violating behaviour through the reporting mechanisms provided by Needly.
            </p>
            <p className="text-slate-600">
              Needly may investigate reports and take appropriate platform-level action, including warnings, restrictions, suspension, or removal of accounts or listings.
            </p>
          </section>

          {/* Section 2.16 */}
          <section className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                2.16
              </span>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">User Acknowledgement</h3>
            </div>
            <p className="text-slate-700 font-medium text-xs sm:text-sm">
              By checking the acknowledgement checkbox and sending a service request, the user confirms that:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
              <li>They have read and understood these terms.</li>
              <li>They understand Needly primarily facilitates discovery and connection.</li>
              <li>They understand that the service arrangement is primarily between the user and provider.</li>
              <li>They will independently evaluate the provider before proceeding.</li>
              <li>They will take reasonable safety precautions.</li>
              <li>They will communicate and agree on important service conditions directly with the provider.</li>
              <li>They understand that Needly does not automatically guarantee the provider, service quality, payment, or outcome.</li>
              <li>They agree to use Needly responsibly and lawfully.</li>
            </ol>
          </section>

        </div>

        {/* Full Screen Footer Bar */}
        <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex items-center gap-3 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center"
          >
            Return to Request
          </button>

          {onAccept && (
            <button
              type="button"
              id="modal-accept-terms-btn"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAccepted ? 'Terms Agreed' : 'I Agree & Accept'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
