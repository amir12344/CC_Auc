// Example of how to use the new dynamic navbar system
// The navbar will automatically detect these properties and update its theme

const DynamicSectionExample = () => {
  return (
    <>
      {/* Method 1: Using CSS custom properties (recommended) */}
      <section 
        className="min-h-screen bg-[#102D21] text-white flex items-center justify-center"
        style={{
          '--navbar-bg': '#102D21',
          '--navbar-text': '#D8F4CC',
          '--navbar-button-bg': '#43CD66',
          '--navbar-button-text': '#1C1E21'
        } as React.CSSProperties}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Dark Section</h1>
          <p>Navbar will have dark background with light text</p>
        </div>
      </section>

      {/* Method 2: Using data attributes */}
      <section 
        className="min-h-screen bg-white text-black flex items-center justify-center"
        data-navbar-bg="white"
        data-navbar-text="#1C1E21"
        data-navbar-button-bg="#43CD66"
        data-navbar-button-text="white"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Light Section</h1>
          <p>Navbar will have light background with dark text</p>
        </div>
      </section>

      {/* Method 3: Automatic detection (navbar will analyze background color) */}
      <section className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Auto-detected Section</h1>
          <p>Navbar will automatically determine theme based on background color</p>
        </div>
      </section>

      {/* Custom colored section */}
      <section 
        className="min-h-screen bg-blue-600 text-white flex items-center justify-center"
        style={{
          '--navbar-bg': '#2563eb',
          '--navbar-text': 'white',
          '--navbar-button-bg': '#fbbf24',
          '--navbar-button-text': '#1f2937'
        } as React.CSSProperties}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Custom Blue Section</h1>
          <p>Navbar will have blue background with yellow button</p>
        </div>
      </section>
    </>
  );
};

export default DynamicSectionExample; 