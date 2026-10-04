import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const pageData = {
  about: {
    badge: "About Us",
    title: "Empowering Everyday Living with Quality Tech",
    subtitle:
      "TechBrand connects customers with curated, high-performance electronics, gadgets, and accessories.",
    content: (
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="soft-card p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Our Mission</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              To provide simple, reliable, and affordable technology solutions backed by exceptional customer service and authentic products.
            </p>
          </div>
          <div className="soft-card p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Our Promise</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every item in our marketplace undergoes strict quality checks, ensuring transparent pricing and dependable local support.
            </p>
          </div>
        </div>

        <div className="soft-card p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why Choose TechBrand?</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>100% Authentic Products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Fast & Safe Express Delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Hassle-Free Return Warranty</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  contact: {
    badge: "Customer Support",
    title: "We're Here to Help",
    subtitle: "Have a question about an order, delivery, or product? Get in touch with our team.",
    content: <ContactSection />,
  },
  faq: {
    badge: "Help Center",
    title: "Frequently Asked Questions",
    subtitle: "Find quick answers to common questions about orders, payments, and shipping.",
    content: <FaqSection />,
  },
  shipping: {
    badge: "Delivery Policy",
    title: "Shipping & Delivery Information",
    subtitle: "Fast, reliable shipping directly to your doorstep.",
    content: (
      <div className="space-y-6">
        <div className="soft-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Timelines</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Standard delivery typically takes 1-3 business days depending on your location. Express same-day delivery is available for select areas when ordered before 12:00 PM.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="soft-card p-6">
            <h4 className="font-bold text-slate-900 dark:text-white">Shipping Rates</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Free shipping is automatically applied on all orders over ETB 5,000. Flat rate fee applies for smaller orders.
            </p>
          </div>
          <div className="soft-card p-6">
            <h4 className="font-bold text-slate-900 dark:text-white">Order Tracking</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Once your order ships, you can monitor status in real-time under your My Orders tab.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  returns: {
    badge: "Guarantee",
    title: "Returns & Refund Policy",
    subtitle: "Shop with peace of mind knowing your purchases are covered.",
    content: (
      <div className="space-y-6">
        <div className="soft-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Return Eligibility</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Items can be returned within 7 days of delivery if unopened, unused, and in original packaging with all accessories and proof of purchase.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="soft-card p-5 text-center">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Submit Request</h4>
            <p className="mt-1 text-xs text-slate-500">Contact support or start from your order details.</p>
          </div>
          <div className="soft-card p-5 text-center">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Item Verification</h4>
            <p className="mt-1 text-xs text-slate-500">Return item to pick-up center for quick inspection.</p>
          </div>
          <div className="soft-card p-5 text-center">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Refund Issue</h4>
            <p className="mt-1 text-xs text-slate-500">Receive replacement or refund within 3 business days.</p>
          </div>
        </div>
      </div>
    ),
  },
  privacy: {
    badge: "Privacy",
    title: "Privacy Policy",
    subtitle: "Your personal information and privacy are strictly protected.",
    content: (
      <div className="soft-card p-6 sm:p-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Data Collection</h3>
          <p>
            We collect information necessary to process your marketplace transactions, including name, email address, delivery phone number, and order history.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Use of Information</h3>
          <p>
            Your data is strictly used for order processing, customer account security, payment settlement, and customer support communications.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Data Security</h3>
          <p>
            We enforce industry-standard security protocols and encrypted communication channels to safeguard user records.
          </p>
        </div>
      </div>
    ),
  },
  terms: {
    badge: "Terms",
    title: "Terms & Conditions",
    subtitle: "Guidelines and rules governing marketplace transactions.",
    content: (
      <div className="soft-card p-6 sm:p-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. General Terms</h3>
          <p>
            By using TechBrand, you agree to comply with our user agreement and transaction guidelines. All products are subject to availability.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Pricing & Payments</h3>
          <p>
            Prices displayed are inclusive of taxes where applicable. Payment must be authorized before order dispatch.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. User Accounts</h3>
          <p>
            Users are responsible for maintaining the confidentiality of their credentials and account access.
          </p>
        </div>
      </div>
    ),
  },
};

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <div className="soft-card p-6">
          <div className="text-2xl mb-2">📞</div>
          <h4 className="font-bold text-slate-900 dark:text-white">Phone & WhatsApp</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">+251 911 123 456</p>
          <p className="text-xs text-slate-400 mt-1">Mon - Sat: 8:30 AM - 6:00 PM</p>
        </div>
        <div className="soft-card p-6">
          <div className="text-2xl mb-2">✉️</div>
          <h4 className="font-bold text-slate-900 dark:text-white">Email Support</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">support@techbrand.et</p>
          <p className="text-xs text-slate-400 mt-1">Typical response within 2 hours</p>
        </div>
        <div className="soft-card p-6">
          <div className="text-2xl mb-2">📍</div>
          <h4 className="font-bold text-slate-900 dark:text-white">Office Headquarters</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Addis Ababa, Ethiopia</p>
        </div>
      </div>

      <div className="soft-card p-6 sm:p-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Send us a message</h3>
        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h4 className="font-bold text-lg">Thank you!</h4>
            <p className="text-sm mt-1">Your message has been sent. Our team will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input required type="text" placeholder="John Doe" className="input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input required type="email" placeholder="john@example.com" className="input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea required rows={4} placeholder="How can we help you?" className="input px-4 py-2.5 text-sm"></textarea>
            </div>
            <button type="submit" className="btn-primary w-full text-sm">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse products or categories, select your item, click 'Add to Cart', and proceed to checkout. You can select your preferred payment method during checkout.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support secure local electronic payments including Chapa integration, card payments, and mobile money options.",
    },
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 1 to 3 business days depending on location. You can track status in your user profile under My Orders.",
    },
    {
      q: "What if I receive a damaged or wrong product?",
      a: "Contact our support team immediately within 48 hours of delivery. We will arrange a free pickup and immediate replacement or refund.",
    },
    {
      q: "Can I cancel or modify my order?",
      a: "Orders can be modified or canceled as long as they are still in 'Pending' status. Visit your My Orders page to check order status.",
    },
  ];

  return (
    <div className="soft-card p-6 sm:p-8 space-y-4 max-w-4xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-none last:pb-0">
          <button
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            className="w-full flex items-center justify-between text-left font-bold text-slate-900 dark:text-white py-2 text-base"
          >
            <span>{faq.q}</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-xl font-mono">{openIndex === i ? "−" : "+"}</span>
          </button>
          {openIndex === i && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const StaticPage = () => {
  const location = useLocation();
  const { slug: pathSlug } = useParams();

  // Deduce active page from URL pathname (e.g. /about -> about) or route param
  const currentPath = location.pathname.replace(/^\//, "").replace(/-returns$/, "") || "about";
  const activeKey = pageData[pathSlug] ? pathSlug : pageData[currentPath] ? currentPath : "about";

  const data = pageData[activeKey] || pageData.about;

  useEffect(() => {
    document.title = `TechBrand | ${data.badge}`;
  }, [data.badge]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            {data.badge}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {data.title}
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        {data.content}

        <div className="mt-12 text-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
          >
            Explore Marketplace Products →
          </Link>
        </div>
      </div>
    </main>
  );
};

export default StaticPage;
