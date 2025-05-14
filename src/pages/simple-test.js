import React, { useEffect, useState } from 'react';

const SimpleTestPage = () => {
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    try {
      // Very simple dependency check
      const reactVersion = React.version;
      const chakraInstalled = typeof require('@chakra-ui/react') !== 'undefined';
      
      console.log('React version:', reactVersion);
      console.log('Chakra UI installed:', chakraInstalled);
      
      setChecked(true);
    } catch (error) {
      console.error('Error checking dependencies:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Dependency Test</h1>
      {checked ? (
        <div>
          <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Dependencies checked! See console for details.</p>
          <p>React version: {React.version}</p>
          <p>Check your browser console for more information.</p>
        </div>
      ) : (
        <p>Checking dependencies...</p>
      )}
    </div>
  );
};

export default SimpleTestPage;
