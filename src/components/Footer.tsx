import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About JumbleAnswers.com</h3>
            <p className="text-gray-300">
              Your daily source for Jumble puzzle solutions. We help you unscramble words and solve the daily cartoon caption.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white">Latest Answers</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white">How to Play</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <Link to="#" className="text-gray-300 hover:text-white">Facebook</Link>
              <Link to="#" className="text-gray-300 hover:text-white">Twitter</Link>
              <Link to="#" className="text-gray-300 hover:text-white">Email</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 JumbleAnswers.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;