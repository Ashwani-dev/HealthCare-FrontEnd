// Enhanced Organization Structured Data (use across all pages)
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TheraConnect",
  "alternateName": "TheraConnect Mental Wellness Platform",
  "url": "https://theraconnect.app",
  "logo": {
    "@type": "ImageObject",
    "url": "https://theraconnect.app/logo.png",
    "width": 512,
    "height": 512
  },
  "description": "Online mental health therapy platform connecting patients with licensed therapists",
  "email": "support@theraconnect.app",
  "telephone": "+1-800-THERAPY",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.facebook.com/theraconnect",
    "https://twitter.com/theraconnect",
    "https://www.linkedin.com/company/theraconnect",
    "https://www.instagram.com/theraconnect"
  ],
  "founder": {
    "@type": "Person",
    "name": "TheraConnect Team"
  },
  "foundingDate": "2024"
};

export const seoConfig = {
  home: {
    title: 'TheraConnect - Online Mental Health Therapy Platform',
    description: 'Connect with licensed therapists for secure online video consultations. Book appointments and start your mental wellness journey today.',
    keywords: 'online therapy, mental health, therapist, counseling, video consultation, mental wellness, teletherapy',
    image: 'https://theraconnect.app/og-image.jpg',
    imageAlt: 'TheraConnect - Connect with licensed mental health professionals',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "TheraConnect",
      "alternateName": "TheraConnect Mental Wellness Platform",
      "description": "Online mental health therapy platform connecting patients with licensed therapists for secure video consultations",
      "url": "https://theraconnect.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://theraconnect.app/logo.png",
        "width": 512,
        "height": 512
      },
      "image": {
        "@type": "ImageObject",
        "url": "https://theraconnect.app/og-image.jpg",
        "width": 1200,
        "height": 630
      },
      "telephone": "+1-800-THERAPY",
      "email": "support@theraconnect.app",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "priceRange": "$$",
      "medicalSpecialty": ["Psychiatry", "Psychology", "Psychotherapy"],
      "availableService": [
        {
          "@type": "MedicalProcedure",
          "name": "Online Therapy Sessions",
          "description": "Secure video consultations with licensed therapists"
        },
        {
          "@type": "Service",
          "name": "Mental Health Counseling",
          "description": "Professional counseling services for anxiety, depression, trauma, and more"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Therapy Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Individual Therapy Session"
            }
          }
        ]
      }
    }
  },

  about: {
    title: 'About Us - TheraConnect | Our Mission & Team',
    description: 'Learn about TheraConnect\'s mission to make mental health care accessible through secure online therapy services with licensed professionals.',
    keywords: 'about theraconnect, mental health mission, online therapy platform, our story',
    image: 'https://theraconnect.app/about-og-image.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About TheraConnect",
      "description": "Learn about our mission to revolutionize mental health care",
      "mainEntity": {
        "@type": "Organization",
        "name": "TheraConnect",
        "description": "Making mental health care accessible to everyone"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://theraconnect.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": "https://theraconnect.app/about"
          }
        ]
      }
    }
  },

  contact: {
    title: 'Contact Us - TheraConnect Support',
    description: 'Get in touch with TheraConnect support team. We\'re here to help with any questions about our online therapy services.',
    keywords: 'contact theraconnect, support, customer service, help, get in touch',
    image: 'https://theraconnect.app/contact-og-image.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact TheraConnect",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://theraconnect.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Contact",
            "item": "https://theraconnect.app/contact"
          }
        ]
      }
    }
  },

  findTherapist: {
    title: 'Find Your Therapist - Browse Licensed Professionals | TheraConnect',
    description: 'Browse our network of licensed and verified mental health professionals. Find the right therapist for anxiety, depression, trauma, relationships & more.',
    keywords: 'find therapist, licensed therapist, mental health professional, therapy specialties, online counselor',
    image: 'https://theraconnect.app/therapists-og-image.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Find Licensed Therapists",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://theraconnect.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Find Therapist",
            "item": "https://theraconnect.app/find-therapist"
          }
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://theraconnect.app/find-therapist?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  },

  dashboard: {
    patient: {
      title: 'Patient Dashboard - My Appointments | TheraConnect',
      description: 'Manage your therapy appointments, view upcoming sessions, and access your mental health journey dashboard.',
      keywords: 'patient dashboard, my appointments, therapy sessions',
      noindex: true,
      nofollow: true
    },
    doctor: {
      title: 'Doctor Dashboard - Manage Appointments | TheraConnect',
      description: 'View and manage your patient appointments, availability, and professional profile.',
      keywords: 'doctor dashboard, manage appointments, therapist portal',
      noindex: true,
      nofollow: true
    }
  },

  profile: {
    patient: {
      title: 'My Profile - Patient Settings | TheraConnect',
      description: 'Update your personal information and manage your patient profile settings.',
      noindex: true,
      nofollow: true
    },
    doctor: {
      title: 'My Profile - Professional Settings | TheraConnect',
      description: 'Manage your professional credentials, specializations, and therapist profile.',
      noindex: true,
      nofollow: true
    }
  },

  videoCall: {
    title: 'Video Consultation - TheraConnect',
    description: 'Secure video consultation session with your therapist.',
    noindex: true,
    nofollow: true
  },

  payments: {
    title: 'My Payments - TheraConnect',
    description: 'View your payment history and manage billing information.',
    noindex: true,
    nofollow: true
  },

  auth: {
    login: {
      title: 'Login - TheraConnect',
      description: 'Login to your TheraConnect account to access therapy sessions and manage appointments.',
      keywords: 'login, sign in, theraconnect login'
    },
    register: {
      title: 'Register - Start Your Mental Wellness Journey | TheraConnect',
      description: 'Create your TheraConnect account and start your journey to better mental health today.',
      keywords: 'register, sign up, create account, join theraconnect'
    }
  },

  userJourney: {
    title: 'How It Works - Your Journey to Mental Wellness | TheraConnect',
    description: 'Discover how TheraConnect makes connecting with licensed therapists easy. Learn about our simple 3-step process from signup to your first session.',
    keywords: 'how it works, therapy process, getting started, mental health journey',
    image: 'https://theraconnect.app/journey-og-image.jpg'
  }
};