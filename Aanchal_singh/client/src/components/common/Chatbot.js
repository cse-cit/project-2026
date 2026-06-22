import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm Nexus, your BloodConnect assistant \uD83E\uDE78 I can answer questions about how the platform works, donor & hospital workflows, blood requests, scheduling, and more. How can I help?",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---------------------------------------------------------------------------
  // FAQ Knowledge Base — answered locally, no API call needed
  // ---------------------------------------------------------------------------
  const FAQS = [
    {
      id: 'greeting',
      patterns: [/^hi+[!.]*$/, /^hello[!.]*$/, /^hii+[!.]*$/, /^hey[!.]*$/, /^helo[!.]*$/, /^namaste[!.]*$/],
      answer: 'Hi there! \uD83D\uDC4B I\'m Nexus, your BloodConnect assistant. I can help you with:\n\n\u2022 How to raise a blood request\n\u2022 Donor registration & workflow\n\u2022 Hospital registration & stock management\n\u2022 Scheduling donation appointments\n\u2022 Notifications & geo-location features\n\u2022 Privacy & security\n\u2022 Gamification & rewards\n\nJust ask me anything!'
    },
    {
      id: 'raise-request',
      patterns: [
        /how to raise a request/, /how do i raise a request/, /raise a request/,
        /how to create a request/, /create blood request/, /blood request/,
        /need blood/, /request blood/, /how to get blood/
      ],
      answer: 'To raise a blood request:\n\n1\uFE0F\u20E3 Sign in and open the "Create Request" page from your dashboard.\n2\uFE0F\u20E3 Fill in patient details \u2014 required blood group, number of units, and urgency level (standard / urgent / critical).\n3\uFE0F\u20E3 Provide the hospital name, location, and contact information.\n4\uFE0F\u20E3 Optionally attach any medical notes or documents.\n5\uFE0F\u20E3 Click Submit.\n\nAfter submission:\n\u2022 Donors with a matching blood group nearby are notified.\n\u2022 Verified hospitals are also alerted.\n\u2022 You can track all responses in "My Requests" and accept an offer.\n\n\uD83D\uDCA1 Tip: Marking a request as "Urgent" triggers priority notifications to active nearby donors.'
    },
    {
      id: 'donor-register',
      patterns: [
        /donor register/, /how to become a donor/, /register as donor/,
        /sign up as donor/, /donor signup/, /become a donor/
      ],
      answer: 'To register as a blood donor:\n\n1\uFE0F\u20E3 Click "Register" and choose the Donor role.\n2\uFE0F\u20E3 Fill in your basic details (name, email, phone) and set a password.\n3\uFE0F\u20E3 After registration, go to "Donor Profile" and add:\n   \u2022 Your blood group\n   \u2022 Location (city/area)\n   \u2022 Health details (last donation date, medical conditions if any)\n4\uFE0F\u20E3 Toggle your availability status to "Available" so you appear in searches.\n\nOnce active, you\'ll receive notifications when someone nearby urgently needs your blood type!'
    },
    {
      id: 'donor-flow',
      patterns: [
        /donor workflow/, /donor process/, /how does donor work/,
        /what can donor do/, /donor dashboard/, /donor features/
      ],
      answer: 'Donor workflow on BloodConnect:\n\n1\uFE0F\u20E3 Register & set your blood group and location.\n2\uFE0F\u20E3 Toggle availability \u2014 set yourself as available to donate.\n3\uFE0F\u20E3 Browse open requests on "Find Requests" or wait for notifications.\n4\uFE0F\u20E3 When you receive a match alert, view the request details and confirm you can donate.\n5\uFE0F\u20E3 Coordinate pickup or visit the hospital directly.\n6\uFE0F\u20E3 After donation, the hospital confirms it \u2014 your donation count, points, and badges are updated automatically.\n\n\uD83C\uDFC5 Earn points and badges for every verified donation!'
    },
    {
      id: 'receiver-flow',
      patterns: [
        /receiver workflow/, /patient workflow/, /how to request blood/,
        /patient request/, /receiver features/, /receiver dashboard/
      ],
      answer: 'Receiver / Patient workflow:\n\n1\uFE0F\u20E3 Register and choose the Receiver role.\n2\uFE0F\u20E3 Go to "Create Request" \u2014 enter the required blood group, units needed, hospital, and urgency.\n3\uFE0F\u20E3 Submit the request. The platform notifies matching donors and hospitals.\n4\uFE0F\u20E3 Monitor "My Requests" \u2014 you\'ll see donor and hospital responses as they come in.\n5\uFE0F\u20E3 Review offers and accept the one that works for you.\n6\uFE0F\u20E3 Coordinate the donation pickup/delivery.\n7\uFE0F\u20E3 Once blood is received, mark the request as fulfilled.'
    },
    {
      id: 'hospital-register',
      patterns: [
        /hospital register/, /how to register hospital/, /hospital signup/,
        /register blood bank/, /add hospital/
      ],
      answer: 'To register a hospital or blood bank:\n\n1\uFE0F\u20E3 Register with the Hospital role.\n2\uFE0F\u20E3 Fill in hospital details \u2014 name, address, license number, contact info.\n3\uFE0F\u20E3 Upload verification documents (registration certificate, etc.).\n4\uFE0F\u20E3 Submit for admin review.\n\nAn admin will verify your documents. Once approved:\n\u2022 You gain access to the stock management dashboard.\n\u2022 You can create donation drives and manage schedules.\n\u2022 You can fulfill blood requests directly from your stock.\n\u2022 Your hospital appears in the public hospital directory.'
    },
    {
      id: 'hospital-flow',
      patterns: [
        /hospital workflow/, /blood bank workflow/, /hospital dashboard/,
        /what can hospital do/, /hospital features/
      ],
      answer: 'Hospital workflow on BloodConnect:\n\n1\uFE0F\u20E3 Register and wait for admin verification.\n2\uFE0F\u20E3 Once verified, manage real-time blood stock (A+, A-, B+, B-, AB+, AB-, O+, O-).\n3\uFE0F\u20E3 Record new donations received \u2014 stock updates automatically.\n4\uFE0F\u20E3 View and fulfill incoming blood requests from patients.\n5\uFE0F\u20E3 Create donation drives and manage appointment slots.\n6\uFE0F\u20E3 Confirm donations to update donor records and award points.\n\n\uD83E\uDE7A Hospitals also receive alerts when their stock goes critical.'
    },
    {
      id: 'admin-flow',
      patterns: [
        /admin workflow/, /admin role/, /how admin works/,
        /admin verify/, /admin dashboard/, /admin features/
      ],
      answer: 'Admin responsibilities on BloodConnect:\n\n\u2022 Verify hospital registrations by reviewing uploaded documents.\n\u2022 Block or unblock suspicious user accounts.\n\u2022 Monitor system health and analytics.\n\u2022 Review and manage all active blood requests.\n\u2022 Send platform-wide announcements or emergency broadcasts.\n\u2022 View global donation statistics and trends.\n\nAdmins are the trust layer that ensures only legitimate hospitals access sensitive features.'
    },
    {
      id: 'notifications',
      patterns: [
        /notification/, /how are donors notified/, /real.?time notification/,
        /alerts/, /email alert/, /sms alert/, /push notification/
      ],
      answer: 'BloodConnect notification system:\n\n\uD83D\uDD14 In-app: Real-time alerts via Socket.io for request matches, appointment reminders, and admin messages \u2014 no page refresh needed.\n\n\uD83D\uDCE7 Email: Optional email notifications for urgent requests, donation confirmations, and reminders.\n\n\uD83D\uDCF1 SMS: Optional SMS alerts via Twilio.\n\nUsers can enable or disable each notification channel in Settings. Urgent/critical requests always push higher-priority alerts to active nearby donors and verified hospitals.'
    },
    {
      id: 'geo-location',
      patterns: [
        /geo/, /location/, /map/, /nearby donor/, /find nearby/,
        /distance/, /proximity/, /nearest hospital/
      ],
      answer: 'Geo-location & mapping on BloodConnect:\n\n\uD83D\uDCCD The platform uses approximate location (city/area) to rank nearby donors and hospitals for a request.\n\n\uD83D\uDDFA\uFE0F Donors and hospitals appear on a map so requesters can quickly find matches close to the patient.\n\n\uD83D\uDD12 Privacy first: Exact addresses are only shared between matched parties after a donation offer is accepted \u2014 never publicly.'
    },
    {
      id: 'stock-management',
      patterns: [
        /stock management/, /blood stock/, /manage stock/,
        /blood inventory/, /blood bank stock/, /stock level/,
        /update stock/, /blood unit/
      ],
      answer: 'Blood stock management (hospitals only):\n\n\u2022 Hospitals maintain a real-time dashboard for each blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).\n\u2022 Status levels: Available \u2705 | Low \u26A0\uFE0F | Critical \uD83D\uDD34 | Out of Stock \u26D4\n\u2022 Each new confirmed donation adds to the stock count.\n\u2022 Expired blood units are automatically flagged daily.\n\u2022 When stock hits a critical threshold, the hospital and admins receive an automatic alert.\n\u2022 Hospitals can directly fulfill patient requests from available stock.'
    },
    {
      id: 'scheduling',
      patterns: [
        /schedule/, /appointment/, /book donation/,
        /donation drive/, /blood drive/, /book a slot/, /donation slot/
      ],
      answer: 'Scheduling & donation drives:\n\n1\uFE0F\u20E3 Hospitals create donation drives with date, time slots, venue, and max capacity.\n2\uFE0F\u20E3 Donors browse available drives at /schedules and book a slot.\n3\uFE0F\u20E3 A confirmation is sent and the slot is reserved.\n4\uFE0F\u20E3 Automated reminders are sent 24 hours before the appointment.\n5\uFE0F\u20E3 After the donation, hospital staff confirm it \u2014 stock is updated and donor earns points.\n\nYou can cancel a booking at any time before the event.'
    },
    {
      id: 'gamification',
      patterns: [
        /points/, /badges/, /gamification/, /reward/,
        /certificate/, /recognition/, /leaderboard/, /rank/
      ],
      answer: 'BloodConnect gamification & rewards:\n\n\uD83C\uDFC5 Earn points for every verified blood donation.\n\uD83E\uDD47 Unlock badges as you hit donation milestones (1st donation, 5th, 10th, etc.).\n\uD83D\uDCDC Download printable certificates for each confirmed donation.\n\uD83C\uDFC6 Appear on the donor leaderboard \u2014 recognition for life-savers!\n\nGamification is designed to encourage regular, repeat donations and celebrate donor contributions.'
    },
    {
      id: 'privacy-security',
      patterns: [
        /privacy/, /security/, /data protection/,
        /personal data/, /my data/, /safe/, /secure/
      ],
      answer: 'Privacy & security at BloodConnect:\n\n\uD83D\uDD12 All user data is securely stored and encrypted.\n\uD83E\uDD1D Contact details are shared only between matched donor-receiver pairs, solely to coordinate the donation.\n\u2705 Hospital verification by admins ensures only legitimate blood banks access sensitive features.\n\uD83D\uDEAB We never sell or publicly expose personal or medical data.\n\uD83D\uDCCB You can review our full Privacy Policy at /privacy and Terms at /terms.'
    },
    {
      id: 'blood-types',
      patterns: [
        /blood type/, /blood group/, /compatible blood/,
        /which blood type/, /o negative/, /ab positive/,
        /universal donor/, /universal receiver/
      ],
      answer: 'Blood group compatibility guide:\n\n\uD83E\uDE78 O- (O Negative) \u2014 Universal donor: can donate to ALL blood types.\n\uD83E\uDE78 AB+ (AB Positive) \u2014 Universal receiver: can receive from ALL blood types.\n\nCompatibility summary:\n\u2022 A+ \u2192 A+, AB+\n\u2022 A- \u2192 A+, A-, AB+, AB-\n\u2022 B+ \u2192 B+, AB+\n\u2022 B- \u2192 B+, B-, AB+, AB-\n\u2022 O+ \u2192 A+, B+, O+, AB+\n\u2022 O- \u2192 everyone\n\u2022 AB+ \u2192 AB+ only\n\u2022 AB- \u2192 AB+, AB-\n\nFor emergencies, O- blood is always requested first.'
    },
    {
      id: 'eligibility',
      patterns: [
        /eligib/, /can i donate/, /who can donate/,
        /donation requirement/, /donate blood/, /qualify to donate/,
        /age to donate/, /weight to donate/
      ],
      answer: 'Blood donation eligibility (general guidelines):\n\n\u2705 Age: 18\u201365 years old\n\u2705 Weight: At least 50 kg (110 lbs)\n\u2705 Hemoglobin: Minimum 12.5 g/dL (women), 13.0 g/dL (men)\n\u2705 Last donation: At least 56 days (8 weeks) ago for whole blood\n\u2705 Generally healthy with no active illness\n\n\u274C Usually cannot donate if you:\n\u2022 Have had certain infections recently (malaria, hepatitis, HIV)\n\u2022 Are pregnant or recently gave birth\n\u2022 Are on certain medications\n\u2022 Have a tattoo or piercing in the last 6 months (varies by region)\n\nAlways consult a healthcare professional for your specific situation.'
    },
    {
      id: 'login-register',
      patterns: [
        /how to login/, /how to register/, /sign up/, /create account/,
        /forgot password/, /reset password/, /account/
      ],
      answer: 'Getting started with BloodConnect:\n\n\uD83D\uDCDD Register: Click "Register" on the home page \u2192 choose your role (Donor / Receiver / Hospital) \u2192 fill in your details.\n\n\uD83D\uDD11 Login: Click "Login" \u2192 enter your email and password.\n\n\uD83D\uDD12 Forgot Password: Click "Forgot Password" on the login page \u2192 enter your email \u2192 check your inbox for a reset link.\n\nAfter login you\'ll be directed to your role-specific dashboard.'
    },
    {
      id: 'hospital-verification',
      patterns: [
        /hospital verif/, /verify hospital/, /how hospital verified/,
        /admin approval/, /verification status/, /pending verification/
      ],
      answer: 'Hospital verification process:\n\n1\uFE0F\u20E3 Hospital registers and uploads required documents (license, registration certificate).\n2\uFE0F\u20E3 An admin reviews the submission \u2014 this typically takes 1\u20132 business days.\n3\uFE0F\u20E3 If approved: hospital gets full access to stock management, donation drives, and request fulfillment.\n4\uFE0F\u20E3 If rejected: the hospital is notified with the reason and can re-submit.\n\nOnly verified hospitals appear in the public hospital directory and can fulfill patient blood requests.'
    },
    {
      id: 'urgency-levels',
      patterns: [
        /urgency/, /urgent request/, /critical request/, /emergency/,
        /priority/, /how urgent/
      ],
      answer: 'Blood request urgency levels:\n\n\uD83D\uDFE2 Standard \u2014 Regular need, matched to nearby donors/hospitals over time.\n\uD83D\uDFE1 Urgent \u2014 Higher priority; triggers faster notifications to active donors and verified hospitals.\n\uD83D\uDD34 Critical / Emergency \u2014 Immediate broadcast to all active matching donors and hospitals in the area. Used when the patient needs blood within hours.\n\nAlways set the correct urgency level \u2014 critical broadcasts are reserved for genuine emergencies to avoid notification fatigue among donors.'
    },
    {
      id: 'platform-workflow',
      patterns: [
        /workflow/, /how does.*platform work/, /how does.*app work/,
        /what is bloodconnect/, /about bloodconnect/, /how it works/,
        /overview/, /platform overview/
      ],
      answer: 'BloodConnect \u2014 Complete Platform Overview:\n\n\uD83D\uDC64 User Roles: Donor | Receiver | Hospital | Admin\n\n\uD83D\uDD04 End-to-end flow:\n1) Receiver creates a blood request (blood group, units, urgency, location).\n2) System finds matching donors by blood group and proximity.\n3) Real-time notifications sent to matching donors and verified hospitals.\n4) Donor or hospital responds and coordinates the donation.\n5) Hospital confirms the donation \u2192 stock updated, donor earns points/badges.\n6) Request marked as fulfilled.\n\n\u26A1 Key features: Real-time notifications (Socket.io) | Geo-location matching | Blood stock management | Appointment scheduling | Gamification | Admin moderation\n\nVisit /how-it-works for a detailed guide.'
    },
    {
      id: 'contact-help',
      patterns: [
        /contact/, /help/, /support/, /reach out/,
        /report issue/, /report a problem/, /feedback/
      ],
      answer: 'Need more help?\n\n\uD83D\uDCE7 Contact us: Visit /contact on the platform to send us a message.\n\uD83D\uDC1B Report an issue: Use /report to flag problems or inappropriate content.\n\uD83D\uDCD6 Resources & guides: Visit /resources or /how-it-works for detailed guides.\n\u2753 FAQ page: Visit /faqs for a full list of frequently asked questions.\n\nFor urgent platform issues, please use the Contact page and we will respond as soon as possible.'
    }
  ];

  // ---------------------------------------------------------------------------
  // Local FAQ lookup — runs instantly with zero API usage
  // ---------------------------------------------------------------------------
  const findFaqAnswer = (text) => {
    const lower = text.toLowerCase().trim();
    for (const item of FAQS) {
      for (const pattern of item.patterns) {
        if (pattern.test(lower)) {
          return item.answer;
        }
      }
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // Gemini LLM fallback — called only when no FAQ pattern matches
  // Uses gemini-1.5-flash (free tier). API key from REACT_APP_GEMINI_API_KEY.
  // ---------------------------------------------------------------------------
  const callGeminiAPI = async (userMessage) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey) {
      return 'I don\'t have a specific answer for that. You can explore more at:\n\n\u2022 /how-it-works \u2014 Platform guide\n\u2022 /faqs \u2014 Frequently asked questions\n\u2022 /resources \u2014 Donation resources\n\u2022 /contact \u2014 Reach our support team';
    }

    // Build strictly alternating history (Gemini requirement: must start with 'user')
    const orderedHistory = messages
      .filter(m => m.text !== messages[0].text) // skip the welcome greeting
      .map(m => ({ role: m.isUser ? 'user' : 'model', parts: [{ text: m.text }] }));

    const chatHistory = [];
    for (const msg of orderedHistory) {
      if (chatHistory.length === 0) {
        if (msg.role === 'user') chatHistory.push(msg);
      } else {
        const last = chatHistory[chatHistory.length - 1];
        if (last.role === msg.role) {
          last.parts[0].text += '\n' + msg.parts[0].text;
        } else {
          chatHistory.push(msg);
        }
      }
    }

    // Add current user message
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    // Keep last 8 turns max; ensure starts with 'user'
    let finalHistory = chatHistory.slice(-8);
    if (finalHistory.length > 0 && finalHistory[0].role !== 'user') {
      finalHistory = finalHistory.slice(1);
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are Nexus, the official AI assistant for BloodConnect — a life-saving MERN-stack platform connecting blood donors, receivers, and verified hospitals.

Platform overview:
1. User roles: Donors (register, set blood group & availability, earn points/badges for verified donations), Receivers/Patients (create blood requests specifying blood group, units, urgency level, and hospital location), Hospitals/Blood Banks (admin-verified; manage real-time stock per blood group, run donation drives, fulfill requests directly from stock), Admins (verify hospitals, moderate platform, send announcements).
2. Core features: Real-time notifications via Socket.io | Geo-location matching for nearby donors/hospitals | Blood stock management dashboard | Appointment scheduling with automated reminders | Gamification (points, badges, printable certificates) | Donor leaderboard.
3. Request flow: Receiver creates request -> system notifies matching donors & hospitals by blood group + proximity -> donor/hospital responds -> donation coordinated -> hospital confirms -> request marked fulfilled, donor rewarded.
4. Urgency levels: Standard | Urgent (priority alerts) | Critical (immediate broadcast to all active matching donors & hospitals).
5. Privacy: Contact details shared only between matched parties after acceptance. Exact address never public.
6. Key routes: /donor/dashboard, /receiver/create-request, /receiver/my-requests, /hospital/stock, /admin/dashboard, /schedules, /hospitals, /faqs, /resources, /how-it-works.

Tone: empathetic, concise, helpful. Speak as "we" for the platform. Do not hallucinate URLs or features not described above. Keep responses under 200 words unless a step-by-step is genuinely needed. Do not use markdown headers — use emojis and plain line breaks instead.`
            }]
          },
          contents: finalHistory,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errData);
      throw new Error('Gemini API returned ' + response.status);
    }

    const data = await response.json();
    const text = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return text || 'I received an empty response. Please try rephrasing your question.';
  };

  // Only show chatbot to logged-in users (hidden on landing page)
  if (!user) return null;

  // ---------------------------------------------------------------------------
  // Message Handler — FAQ first, then Gemini LLM fallback
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // 1) Try local FAQ knowledge base first — instant, free, no API call
      const faqAnswer = findFaqAnswer(userMessage);
      if (faqAnswer) {
        setMessages(prev => [...prev, { text: faqAnswer, isUser: false }]);
        return;
      }

      // 2) No FAQ match — call Gemini LLM with BloodConnect context
      const llmAnswer = await callGeminiAPI(userMessage);
      setMessages(prev => [...prev, { text: llmAnswer, isUser: false }]);

    } catch (err) {
      console.error('Chatbot error:', err);
      const isNetwork = !navigator.onLine || (err.message && err.message.toLowerCase().includes('failed to fetch'));
      setMessages(prev => [
        ...prev,
        {
          text: isNetwork
            ? 'I\'m having trouble connecting right now. Please check your internet connection and try again.'
            : 'Sorry, I couldn\'t process that. Please try rephrasing, or visit /faqs for more help.',
          isUser: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
        className={'fixed bottom-6 right-6 p-4 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-300 z-50 ' + (isOpen ? 'scale-0 pointer-events-none' : 'scale-100')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={'fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl transition-all duration-300 z-50 flex flex-col overflow-hidden ' + (isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none')}
        style={{ height: '520px', maxHeight: '82vh' }}
      >
        {/* Header */}
        <div className="bg-red-600 p-4 text-white flex justify-between items-center flex-shrink-0">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Nexus &mdash; AI Assistant
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="text-white hover:text-red-200 focus:outline-none transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Badge */}
        <div className="bg-red-50 border-b border-red-100 px-4 py-1.5 flex-shrink-0">
          <p className="text-xs text-red-600 font-medium">&#x1FA78; BloodConnect Assistant &mdash; FAQ + AI powered</p>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div key={index} className={'flex ' + (msg.isUser ? 'justify-end' : 'justify-start')}>
              {!msg.isUser && (
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              <div
                className={'max-w-[80%] p-3 rounded-lg text-sm ' + (
                  msg.isUser
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm rounded-bl-none border border-gray-100">
                <div className="flex space-x-1.5 items-center h-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestion chips */}
        <div className="px-3 pt-2 pb-0 bg-white border-t border-gray-100 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {['Raise a request', 'Donor workflow', 'Blood types', 'Scheduling'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 whitespace-nowrap hover:bg-red-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about BloodConnect..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
