import React from "react";
import styles from "../../styles/Home.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Inline SVG icons for steps and benefits
const icons = {
  match: (
    <svg aria-hidden="true" width="40" height="40" fill="none" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#DBEAFE" stroke="#2563eb" strokeWidth="2"/><path d="M20 12a6 6 0 100 12 6 6 0 000-12zm0 16c-4.418 0-8 2.015-8 4.5V34h16v-1.5c0-2.485-3.582-4.5-8-4.5z" fill="#2563eb"/></svg>
  ),
  connect: (
    <svg aria-hidden="true" width="40" height="40" fill="none" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#D1FAE5" stroke="#059669" strokeWidth="2"/><path d="M14 20h12M20 14v12" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  heal: (
    <svg aria-hidden="true" width="40" height="40" fill="none" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2"/><path d="M20 28V12m0 0l-6 6m6-6l6 6" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  therapist: (
    <svg aria-hidden="true" width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#FDE68A" stroke="#B45309" strokeWidth="2"/><path d="M18 14a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 2.015-8 4.5V28h16v-7.5c0-2.485-3.582-4.5-8-4.5z" fill="#B45309"/></svg>
  ),
  flexible: (
    <svg aria-hidden="true" width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="6" y="10" width="24" height="16" rx="4" fill="#A7F3D0" stroke="#059669" strokeWidth="2"/><path d="M10 14h16M10 18h10" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  secure: (
    <svg aria-hidden="true" width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="8" y="16" width="20" height="12" rx="4" fill="#DBEAFE" stroke="#2563eb" strokeWidth="2"/><path d="M18 22v2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/><circle cx="18" cy="20" r="2" fill="#2563eb"/></svg>
  ),
  match2: (
    <svg aria-hidden="true" width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#F3E8FF" stroke="#7C3AED" strokeWidth="2"/><path d="M12 18l4 4 8-8" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  quote: (
    <svg aria-hidden="true" width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M10 14a6 6 0 016-6v2a4 4 0 00-4 4h2a2 2 0 012 2v2a4 4 0 01-4 4v2a6 6 0 006-6v-2a6 6 0 00-6-6v2a4 4 0 014 4h-2a2 2 0 00-2 2v2a4 4 0 004 4v2a6 6 0 01-6-6v-2z" fill="#60A5FA"/></svg>
  ),
};

const testimonials = [
  {
    quote: "I finally found a therapist who truly understands. This app changed my life.",
    name: "M.S., Client"
  },
  {
    quote: "The process was so easy and I felt safe every step of the way.",
    name: "A.K., Client"
  },
  {
    quote: "I love how I can connect with my therapist from home. Highly recommend!",
    name: "J.R., Client"
  }
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFindTherapist = (e) => {
    e.preventDefault();
    if (user && user.role?.toLowerCase() === "patient") {
      navigate("/find-therapist");
    } else {
      navigate("/register");
    }
  };

  const handleStartHealing = (e) => {
    e.preventDefault();
    if (user && user.role?.toLowerCase() === "patient") {
      navigate("/find-therapist");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center min-h-[60vh] px-4 pt-16 pb-12 text-center overflow-hidden">
        {/* Calming background visual (describe for now) */}
        <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-200 via-blue-50 to-green-100 opacity-80 blur-lg z-0" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">Your Mental Wellness Journey Starts Here</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">Seamlessly connect with licensed mental health therapists for personalized, confidential support—whenever you need it.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <button
              onClick={handleFindTherapist}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Find a Therapist
            </button>
            <a href="/about" className="inline-block bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-4 rounded-xl shadow text-lg border border-blue-200 transition-all">Learn How It Works</a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">Your Journey in Three Simple Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            {icons.match}
            <h3 className="font-semibold text-blue-700 mt-2 mb-1">Get Matched</h3>
            <p className="text-gray-600">Answer a few questions and we'll match you with therapists tailored to your needs.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            {icons.connect}
            <h3 className="font-semibold text-green-700 mt-2 mb-1">Connect Securely</h3>
            <p className="text-gray-600">Message or video chat with your therapist in a safe, private environment.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            {icons.heal}
            <h3 className="font-semibold text-pink-700 mt-2 mb-1">Begin Healing</h3>
            <p className="text-gray-600">Start your journey toward better mental health with ongoing support and care.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-sm">
            {icons.therapist}
            <h3 className="font-semibold text-yellow-700 mt-2 mb-1">Qualified Therapists</h3>
            <p className="text-gray-600 text-sm">All therapists are licensed, experienced, and carefully vetted for your peace of mind.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-lg shadow-sm">
            {icons.flexible}
            <h3 className="font-semibold text-green-700 mt-2 mb-1">Flexible & Accessible</h3>
            <p className="text-gray-600 text-sm">Access support from anywhere, on your schedule—no waiting rooms, no stigma.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-sm">
            {icons.secure}
            <h3 className="font-semibold text-blue-700 mt-2 mb-1">Confidential & Secure</h3>
            <p className="text-gray-600 text-sm">Your privacy is protected with end-to-end encryption and strict confidentiality.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-purple-50 rounded-lg shadow-sm">
            {icons.match2}
            <h3 className="font-semibold text-purple-700 mt-2 mb-1">Personalized Matching</h3>
            <p className="text-gray-600 text-sm">We help you find the right therapist for your unique needs and preferences.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">Voices of Healing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-blue-100">
              <span className="mb-2">{icons.quote}</span>
              <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
              <span className="text-blue-700 font-semibold">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-100 via-green-50 to-pink-50 text-center">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Take the First Step Towards a Brighter Tomorrow</h2>
        <p className="text-lg text-gray-700 mb-8">Your journey to healing and hope begins with a single click. Connect with a caring therapist today.</p>
        <button
          onClick={handleStartHealing}
          className="inline-block bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold px-10 py-5 rounded-2xl shadow-xl text-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Start Healing Now
        </button>
      </section>
    </div>
  );
};

export default HomePage; 