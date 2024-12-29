import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

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
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <Link to="#" className="text-gray-300 hover:text-white">
                <Facebook size={24} />
              </Link>
              <Link to="#" className="text-gray-300 hover:text-white">
                <Twitter size={24} />
              </Link>
              <Link to="#" className="text-gray-300 hover:text-white">
                <Instagram size={24} />
              </Link>
              <Link to="#" className="text-gray-300 hover:text-white">
                <Youtube size={24} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Jumble® is a registered trademark of Tribune Media Services, Inc. DailyJumbleAnswers.com is not affiliated with Jumble® or Tribune Media Services Inc, in any way. This site is for entertainment purposes only.
          </p>
          <p className="text-gray-400">&copy; 2024 JumbleAnswers.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;