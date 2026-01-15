// src/components/common/SEO.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

export const SEO = ({
  title = 'TheraConnect - Online Mental Health Therapy Platform',
  description = 'Connect with licensed therapists for secure online video consultations. Book appointments and start your mental wellness journey today.',
  keywords = 'online therapy, mental health, therapist, counseling, video consultation',
  image = 'https://theraconnect.app/og-image.jpg',
  imageAlt = 'TheraConnect Online Therapy Platform',
  url,
  type = 'website',
  author = 'TheraConnect',
  locale = 'en_US',
  structuredData,
  noindex = false,
  nofollow = false,
}) => {
  const location = useLocation();
  const currentUrl = url || `https://theraconnect.app${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update HTML lang attribute
    document.documentElement.lang = locale.split('_')[0];

    const updateMetaTag = (selector, attribute, content) => {
      if (!content) return; // Skip if content is empty
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const attrMatch = selector.match(/(name|property)="([^"]+)"/);
        if (attrMatch) {
          element.setAttribute(attrMatch[1], attrMatch[2]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    const updateLinkTag = (rel, href) => {
      if (!href) return;
      
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic Meta Tags
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="author"]', 'content', author);
    updateMetaTag('meta[name="robots"]', 'content', `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`);

    // Open Graph Protocol
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:image"]', 'content', image);
    updateMetaTag('meta[property="og:image:alt"]', 'content', imageAlt);
    updateMetaTag('meta[property="og:image:width"]', 'content', '1200');
    updateMetaTag('meta[property="og:image:height"]', 'content', '630');
    updateMetaTag('meta[property="og:url"]', 'content', currentUrl);
    updateMetaTag('meta[property="og:type"]', 'content', type);
    updateMetaTag('meta[property="og:site_name"]', 'content', 'TheraConnect');
    updateMetaTag('meta[property="og:locale"]', 'content', locale);

    // Twitter Cards
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:image"]', 'content', image);
    updateMetaTag('meta[name="twitter:image:alt"]', 'content', imageAlt);
    updateMetaTag('meta[name="twitter:site"]', 'content', '@theraconnect');
    updateMetaTag('meta[name="twitter:creator"]', 'content', '@theraconnect');

    // Additional SEO Meta Tags
    updateMetaTag('meta[name="application-name"]', 'content', 'TheraConnect');

    // Canonical URL
    updateLinkTag('canonical', currentUrl);

    // Structured Data (JSON-LD)
    let scriptTag = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
    
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('id', 'dynamic-seo');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      // Remove structured data script if no data is provided
      scriptTag.remove();
    }

    // Cleanup function
    return () => {
      const dynamicScript = document.querySelector('#dynamic-seo');
      if (dynamicScript && !structuredData) {
        dynamicScript.remove();
      }
    };
  }, [title, description, keywords, image, imageAlt, currentUrl, type, author, locale, structuredData, noindex, nofollow, location.pathname]);

  return null;
};

// PropTypes for better type checking (optional but recommended)
SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  locale: PropTypes.string,
  structuredData: PropTypes.object,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
};