import React from "react";
import { SEO } from "../common/SEO";
import { seoConfig } from "../config/seoConfig";

// Inline SVG icons for values and trust badges
const icons = {
  compassion: (
    <svg aria-hidden="true" className="mx-auto mb-2" width="36" height="36" fill="none" viewBox="0 0 36 36"><path d="M18 32s-9.5-7.5-13-12.5C2.5 15 4 10 9 10c3 0 4.5 2 4.5 2S15.5 10 18 10s4.5 2 4.5 2 1.5-2 4.5-2c5 0 6.5 5 4 9.5C27.5 24.5 18 32 18 32z" fill="#60A5FA" stroke="#2563eb" strokeWidth="2"/></svg>
  ),
  integrity: (
    <svg aria-hidden="true" className="mx-auto mb-2" width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="8" y="8" width="20" height="20" rx="4" fill="#FBBF24" stroke="#B45309" strokeWidth="2"/><path d="M12 18l5 5 7-7" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  accessibility: (
    <svg aria-hidden="true" className="mx-auto mb-2" width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#6EE7B7" stroke="#059669" strokeWidth="2"/><path d="M18 10v16M10 18h16" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  empowerment: (
    <svg aria-hidden="true" className="mx-auto mb-2" width="36" height="36" fill="none" viewBox="0 0 36 36"><path d="M18 28V8m0 0l-6 6m6-6l6 6" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="28" r="4" fill="#F472B6"/></svg>
  ),
  shield: (
    <svg aria-hidden="true" className="inline-block align-text-bottom mr-1" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 2l7 3v5c0 5-3.5 8-7 8s-7-3-7-8V5l7-3z" fill="#DBEAFE" stroke="#2563eb" strokeWidth="1.5"/></svg>
  ),
  check: (
    <svg aria-hidden="true" className="inline-block align-text-bottom mr-1" width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#DCFCE7" stroke="#059669" strokeWidth="1.5"/><path d="M6 10l2.5 2.5L14 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

const AboutPage = () => (
  <>
    <SEO {...seoConfig.about} />
    <div className="max-w-3xl mx-auto mt-10 p-0 md:p-6 bg-white rounded shadow text-gray-800 overflow-hidden">
    {/* Hero Section / Our Why */}
    <section className="relative text-center mb-10">
      {/* Calming, abstract background visual (describe for now) */}
      <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 opacity-70 blur-lg z-0" />
      {/* Optional: add a soft SVG landscape or abstract shape here for more visual depth */}
      <div className="relative z-10 py-12 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2">You Deserve to Be Heard</h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">We're here to make mental health support accessible, compassionate, and stigma-free for everyone.</p>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
      <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow-sm">
        <span className="mb-2">{/* Compass icon */}
          <svg aria-hidden="true" width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#DBEAFE" stroke="#2563eb" strokeWidth="2"/><path d="M16 8l-4 12 12-4-8-8z" fill="#2563eb"/></svg>
        </span>
        <h2 className="text-lg font-bold text-blue-600 mb-1">Our Mission</h2>
        <p className="text-gray-700 text-center">To connect individuals with trusted therapists, making it easy to seek help, find hope, and begin healing—anytime, anywhere.</p>
      </div>
      <div className="bg-green-50 rounded-lg p-6 flex flex-col items-center shadow-sm">
        <span className="mb-2">{/* Rising sun icon */}
          <svg aria-hidden="true" width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="20" r="8" fill="#A7F3D0" stroke="#059669" strokeWidth="2"/><path d="M8 20h16M16 12v-4M4 20h24" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
        <h2 className="text-lg font-bold text-green-700 mb-1">Our Vision</h2>
        <p className="text-gray-700 text-center">We envision a world where mental health care is as accessible and accepted as physical health care, empowering every person to thrive.</p>
      </div>
    </section>

    {/* The Challenge & Our Solution */}
    <section className="mb-10 px-4 md:px-0">
      <div className="rounded-lg p-6 mb-4 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-200">
        <h2 className="text-lg font-bold text-red-500 mb-1">The Challenge</h2>
        <p className="text-gray-700">Seeking mental health support can feel overwhelming—barriers like stigma, cost, and finding the right therapist often stand in the way. Many suffer in silence, unsure where to turn.</p>
      </div>
      <div className="rounded-lg p-6 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-200">
        <h2 className="text-lg font-bold text-green-600 mb-2">Our Solution</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><span className="font-semibold">Safe, Confidential Platform:</span> Your privacy and comfort are our top priorities.</li>
          <li><span className="font-semibold">Easy Appointment Booking:</span> Find and connect with licensed therapists in just a few clicks.</li>
          <li><span className="font-semibold">Supportive Community:</span> Access resources and encouragement whenever you need it.</li>
        </ul>
      </div>
    </section>

    {/* Our Values */}
    <section className="mb-10 px-4 md:px-0">
      <h2 className="text-xl font-bold text-blue-600 mb-6 text-center">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg shadow-sm">
          {icons.compassion}
          <span className="font-semibold text-blue-700 mb-1">Compassion</span>
          <span className="text-gray-700 text-sm">We listen with empathy and care, honoring every individual's journey.</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-yellow-50 rounded-lg shadow-sm">
          {icons.integrity}
          <span className="font-semibold text-yellow-700 mb-1">Integrity</span>
          <span className="text-gray-700 text-sm">We uphold the highest ethical standards in every interaction.</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg shadow-sm">
          {icons.accessibility}
          <span className="font-semibold text-green-700 mb-1">Accessibility</span>
          <span className="text-gray-700 text-sm">We break down barriers so everyone can access the support they need.</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-pink-50 rounded-lg shadow-sm">
          {icons.empowerment}
          <span className="font-semibold text-pink-700 mb-1">Empowerment</span>
          <span className="text-gray-700 text-sm">We help individuals take charge of their mental well-being and growth.</span>
        </div>
      </div>
    </section>

    {/* Our Commitment to Quality & Safety */}
    <section className="mb-10 px-4 md:px-0">
      <h2 className="text-xl font-bold text-blue-600 mb-4 text-center">Our Commitment to Quality & Safety</h2>
      <div className="bg-blue-50 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex-1 mb-2 md:mb-0">
          <p className="mb-2"><span className="font-semibold text-blue-700">{icons.check} Thoroughly vetted therapists:</span> Every therapist on our platform is carefully screened for credentials, experience, and compassion.</p>
          <p className="mb-2"><span className="font-semibold text-blue-700">{icons.check} Verified qualifications:</span> We require up-to-date licenses and ongoing professional development.</p>
        </div>
        <div className="flex-1">
          <p className="mb-2"><span className="font-semibold text-blue-700">{icons.shield} Your privacy is our top priority:</span> All conversations are encrypted, and your personal information is protected by strict confidentiality and data security standards.</p>
        </div>
      </div>
    </section>

    {/* Call to Action */}
    <section className="text-center mt-12 px-4 md:px-0 relative">
      {/* Optional: subtle aspirational visual (describe for now) */}
      <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 -top-8 w-32 h-8 bg-gradient-to-r from-blue-200 via-green-100 to-pink-100 rounded-full blur-md opacity-60" />
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Ready to Begin Your Journey?</h2>
      <p className="mb-6 text-lg text-gray-700">Take the first step toward better mental health. Join our community and connect with a caring therapist today.</p>
      <a href="/register" className="inline-block bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Get Started</a>
    </section>
  </div>
  </>
);

export default AboutPage; 