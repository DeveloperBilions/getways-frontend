import { useState, useEffect } from 'react';

const useDeviceType = (breakpoints = {}) => {
  // Default breakpoints (can be overridden with custom values)
  const defaultBreakpoints = {
    mobile: 600,    // 0-480px is mobile
    tablet: 768,    // 481-768px is tablet
    laptop: 1024,   // 769-1024px is laptop
    desktop: 1200,  // 1025-1200px is desktop
    // Anything above 1200px is considered large desktop
  };

  // Merge custom breakpoints with defaults
  const mergedBreakpoints = { ...defaultBreakpoints, ...breakpoints };

  // Initialize with a reasonable default for SSR
  const [windowWidth, setWindowWidth] = useState(0);
  const [deviceType, setDeviceType] = useState('unknown');

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Determine initial device type
    updateDeviceType(window.innerWidth);

    // Handle resize events
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      updateDeviceType(width);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to determine device type based on width
  const updateDeviceType = (width) => {
    const { mobile, tablet, laptop, desktop } = mergedBreakpoints;

    if (width <= mobile) {
      setDeviceType('mobile');
    } else if (width <= tablet) {
      setDeviceType('tablet');
    } else if (width <= laptop) {
      setDeviceType('laptop');
    } else if (width <= desktop) {
      setDeviceType('desktop');
    } else {
      setDeviceType('largeDesktop');
    }
  };

  // Return both device type and window width for more flexibility
  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isLaptop: deviceType === 'laptop',
    isDesktop: deviceType === 'desktop' || deviceType === 'largeDesktop',
    windowWidth
  };
};

export default useDeviceType;