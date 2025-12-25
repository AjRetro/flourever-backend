    import React from 'react';

    function Footer() {
      const currentYear = new Date().getFullYear(); // Get the current year dynamically

      return (
        <footer className="bg-brand-primary text-brand-light mt-24 py-8"> 
          <div className="container mx-auto px-6 text-center">
            {/* You can add social media icons or other links here later */}
            <p className="text-sm opacity-80">
              &copy; {currentYear} FlourEver Bakery. All Rights Reserved.
            </p>
            <p className="text-xs opacity-60 mt-2">
              Located in Daet, Camarines Norte, Philippines
            </p>
          </div>
        </footer>
      );
    }

    export default Footer;
    
