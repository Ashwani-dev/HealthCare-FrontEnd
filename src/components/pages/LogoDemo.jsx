import React from 'react';
import Logo from '../common/Logo';

const LogoDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Logo Showcase</h1>
        
        {/* Size Variations */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Size Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <Logo size="small" />
              <p className="text-sm text-gray-600 mt-2">Small (32px)</p>
            </div>
            <div className="text-center">
              <Logo size="medium" />
              <p className="text-sm text-gray-600 mt-2">Medium (48px)</p>
            </div>
            <div className="text-center">
              <Logo size="large" />
              <p className="text-sm text-gray-600 mt-2">Large (64px)</p>
            </div>
            <div className="text-center">
              <Logo size="xlarge" />
              <p className="text-sm text-gray-600 mt-2">XLarge (80px)</p>
            </div>
          </div>
        </section>

        {/* Variant Variations */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Color Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Logo size="large" variant="default" />
              <p className="text-sm text-gray-600 mt-2">Default (Blue/Green)</p>
            </div>
            <div className="text-center p-6 bg-gray-800 rounded-lg">
              <Logo size="large" variant="white" />
              <p className="text-sm text-gray-300 mt-2">White (Dark Background)</p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg">
              <Logo size="large" variant="monochrome" />
              <p className="text-sm text-gray-600 mt-2">Monochrome (Gray)</p>
            </div>
          </div>
        </section>

        {/* With Text */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Logo with Text</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Logo size="medium" showText={true} text="HealthCare App" />
            </div>
            <div className="flex items-center justify-center">
              <Logo size="large" showText={true} text="Mental Wellness Platform" />
            </div>
            <div className="flex items-center justify-center">
              <Logo size="xlarge" showText={true} text="Your Healing Journey" />
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Usage Examples</h2>
          <div className="space-y-6">
            {/* Navbar Example */}
            <div className="bg-blue-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Logo size="medium" variant="white" showText={true} text="HealthCare App" />
                <div className="text-white text-sm">Navigation Menu</div>
              </div>
            </div>
            
            {/* Footer Example */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-center">
                <Logo size="small" variant="white" />
                <span className="text-white text-sm ml-2">© 2024 HealthCare App</span>
              </div>
            </div>
            
            {/* Card Example */}
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Logo size="small" />
                <span className="text-gray-700 font-medium ml-2">Appointment Confirmation</span>
              </div>
              <p className="text-gray-600">Your logo can be used in various contexts throughout the application.</p>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Implementation Guide</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`// Basic usage
<Logo />

// With size
<Logo size="large" />

// With variant
<Logo variant="white" />

// With text
<Logo showText={true} text="HealthCare App" />

// All props
<Logo 
  size="medium" 
  variant="default" 
  showText={true} 
  text="HealthCare App"
  className="custom-class"
/>

// Available sizes: small, medium, large, xlarge
// Available variants: default, white, monochrome`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LogoDemo; 