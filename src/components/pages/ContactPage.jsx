import React, { useState } from "react";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";

const icons = {
  mail: (
    <svg aria-hidden="true" width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="2" y="4" width="18" height="14" rx="3" fill="#DBEAFE" stroke="#2563eb" strokeWidth="1.5"/><path d="M2.5 5l8.5 7 8.5-7" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  phone: (
    <svg aria-hidden="true" width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3" y="2" width="16" height="18" rx="4" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5"/><circle cx="11" cy="17" r="1" fill="#059669"/></svg>
  ),
  faq: (
    <svg aria-hidden="true" width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5"/><path d="M11 7v3.5a1 1 0 001 1h.5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/><circle cx="11" cy="15" r="1" fill="#B45309"/></svg>
  ),
  clock: (
    <svg aria-hidden="true" width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="#F3E8FF" stroke="#7C3AED" strokeWidth="1.5"/><path d="M11 7v4l3 2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
};

const faqs = [
  {
    q: "How do I get matched with a therapist?",
    a: "After you sign up and answer a few questions, our system will recommend therapists tailored to your needs. You can also browse and choose yourself."
  },
  {
    q: "Is my information confidential?",
    a: "Absolutely. All your data and conversations are encrypted and protected by strict privacy standards. Only you and your therapist can access your messages."
  },
  {
    q: "What are the costs for therapy sessions?",
    a: "Pricing varies by therapist and session type. You can view rates before booking and there are no hidden fees."
  },
  {
    q: "Can I switch therapists if I'm not comfortable?",
    a: "Yes, you can change therapists at any time. Your comfort and progress are our top priorities."
  },
  {
    q: "How quickly will I get a response after contacting support?",
    a: "We aim to respond to all inquiries within 24 business hours."
  }
];

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <>
      <SEO {...seoConfig.contact} />
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 px-2">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Page Title & Opening Message */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2">We're Here to Help</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">Whether you have a question about our services, need technical support, or just want to share feedback, we're here to listen and assist. Your well-being is our priority.</p>
        </section>

        {/* Contact Form */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Send Us a Message</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded p-4 text-center font-semibold">
              Thank you! Your message has been received and we aim to respond within 24 business hours.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Full Name<span className="text-red-500">*</span></label>
                <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="w-full border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Address<span className="text-red-500">*</span></label>
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="w-full border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autoComplete="email" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="w-full border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Therapist Match Query</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Your Message</label>
                <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} className="w-full border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Your information is kept private and confidential. <a href="/privacy" className="underline text-blue-600">Learn more</a>.</div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Send Message</button>
            </form>
          )}
        </section>

        {/* Alternative Contact Methods */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-blue-600 mb-3">Other Ways to Connect</h2>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 text-gray-700 text-base">
            <div className="flex items-center gap-2">
              {icons.mail}
              <a href="mailto:upport@theraconnect.com" className="text-blue-700 underline">support@theraconnect.com</a>
            </div>
            <div className="flex items-center gap-2">
              {icons.phone}
              <a href="tel:+1234567890" className="text-blue-700 underline">+1 234 567 890</a>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">We aim to respond within 24 business hours.</div>
        </section>

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center justify-center gap-2">{icons.faq} Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-blue-100 rounded-lg bg-blue-50">
                <button
                  className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-blue-800 focus:outline-none focus:ring-0 focus:border-transparent"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  aria-expanded={faqOpen === idx}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span>{faq.q}</span>
                  <span className="ml-2 text-xl">{faqOpen === idx ? "-" : "+"}</span>
                </button>
                {faqOpen === idx && (
                  <div id={`faq-panel-${idx}`} className="px-4 pb-4 text-gray-700 text-sm animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">Didn't find your answer? Please use the contact form above and we'll be happy to help.</div>
        </section>

        {/* Support Hours */}
        <section className="mb-2 text-center">
          <h2 className="text-lg font-bold text-blue-600 mb-1 flex items-center justify-center gap-2">{icons.clock} Support Hours</h2>
          <div className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM IST</div>
          <div className="text-xs text-gray-500 mt-1">Limited support outside these hours.</div>
        </section>
      </div>
    </div>
    </>
  );
};

export default ContactPage; 