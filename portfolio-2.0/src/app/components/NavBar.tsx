import React from 'react';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-8">

        {/* Navigation Section */}
        <div className="space-x-4">
          <a href="#landing" className="text-black text-sm hover:underline">Home</a>
          <a href="#experience" className="text-black text-sm hover:underline">Experience</a>
          <a href="#skills" className="text-black text-sm hover:underline">Skills</a>
          <a href="#projects" className="text-black text-sm hover:underline">Projects</a>
          <a href="#contact" className="text-black text-sm hover:underline">Contact</a>
        </div>

        {/* Social Section */}
        <div className="space-x-4 flex items-center">
          <a href="https://linkedin.com/in/simon-studen" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={24} className="text-black" />
            <button className="text-black text-sm hover:underline">Linkedin</button>
          </a>
          <a href="https://github.com/sstuden2255" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub size={24} className="text-black" />
            <button className="text-black text-sm hover:underline">Github</button>
          </a>
          <a href="https://www.sstuden.me" target="_blank" rel="noopener noreferrer" aria-label="Old Portfolio">
            <FaGlobe size={24} className="text-black" />
            <button className="text-black text-sm hover:underline">Old Portfolio</button>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;