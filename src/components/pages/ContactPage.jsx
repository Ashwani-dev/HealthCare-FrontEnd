import React, { useState } from "react";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";
import { Button, Input, TextArea, Select, Alert } from "../ui";

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
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="relative flex flex-col justify-center items-center min-h-[40vh] px-4 pt-16 pb-12 text-center overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-200 via-blue-50 to-green-100 opacity-80 blur-lg z-0" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">We're Here to Help</h1>
            <p className="text-lg md:text-xl text-gray-700">Whether you have a question about our services, need technical support, or just want to share feedback, we're here to listen and assist. Your well-being is our priority.</p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-3xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Send Us a Message</h2>
          {submitted ? (
            <Alert
              type="success"
              title="Thank You!"
              message="Your message has been received and we aim to respond within 24 business hours."
              className="bg-white rounded-xl shadow-lg p-8 border border-green-200"
            >
              <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Alert>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className=""
                />
                
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className=""
                />
                
                <Select
                  id="subject"
                  name="subject"
                  label="Subject"
                  value={form.subject}
                  onChange={handleChange}
                  options={[
                    'General Inquiry',
                    'Technical Support',
                    'Billing Question',
                    'Therapist Match Query',
                    'Feedback',
                    'Other'
                  ]}
                  className=""
                />
                
                <TextArea
                  id="message"
                  name="message"
                  label="Your Message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className=""
                />
                
                <div className="text-sm text-gray-600">
                  Your information is kept private and confidential. <a href="/privacy" className="underline text-blue-600 hover:text-blue-700">Learn more</a>.
                </div>
                
                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg" 
                  fullWidth
                >
                  Send Message
                </Button>
              </form>
            </div>
          )}
        </section>

        {/* Alternative Contact Methods */}
        <section className="max-w-4xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Other Ways to Connect</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-gray-700">
              <div className="flex items-center gap-3 bg-blue-50 px-6 py-4 rounded-xl">
                {icons.mail}
                <a href="mailto:support@theraconnect.com" className="text-blue-700 underline font-semibold hover:text-blue-800">support@theraconnect.com</a>
              </div>
              <div className="flex items-center gap-3 bg-green-50 px-6 py-4 rounded-xl">
                {icons.phone}
                <a href="tel:+1234567890" className="text-green-700 underline font-semibold hover:text-green-800">+1 234 567 890</a>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-6 text-center flex items-center justify-center gap-2">
              {icons.clock}
              <span>We aim to respond within 24 business hours</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
            {icons.faq}
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-blue-800 hover:bg-blue-50 transition-colors focus:outline-none"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  aria-expanded={faqOpen === idx}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span className="text-base">{faq.q}</span>
                  <span className="ml-4 text-2xl font-bold text-blue-600">{faqOpen === idx ? "−" : "+"}</span>
                </button>
                {faqOpen === idx && (
                  <div id={`faq-panel-${idx}`} className="px-6 pb-4 text-gray-700 bg-blue-50 border-t border-blue-100 animate-fadeIn">
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-6 text-center bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            Didn't find your answer? Please use the contact form above and we'll be happy to help.
          </div>
        </section>

        {/* Support Hours */}
        <section className="max-w-3xl mx-auto py-8 px-4 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
              </svg>
              <h2 className="text-xl font-bold text-purple-700">Support Hours</h2>
            </div>
            <div className="text-lg text-gray-700 font-semibold mb-1">Monday - Friday: 9:00 AM - 5:00 PM IST</div>
            <div className="text-sm text-gray-600">Limited support outside these hours</div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage; 