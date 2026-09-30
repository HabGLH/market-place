const Footer = () => {
  return (
    <footer className="py-4 text-center mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <p className="text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Tech Brand. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
