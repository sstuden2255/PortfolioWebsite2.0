import React from 'react';
import { FaLinkedin, FaGithub, FaUserCircle } from 'react-icons/fa';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed left-1/2 -translate-x-1/2 top-2 w-10/12 max-w-2xl bg-white shadow-md z-50 rounded-full">
      <div className="container mx-auto flex justify-center items-center space-x-4 py-4 px-8">

        {/* Navigation Section */}
        <div className="relative group">
          <p className="cursor-pointer text-lg">Navigation</p>
          <ul className="absolute left-0 py-2 hidden bg-white shadow-lg group-hover:block border border-black-50 rounded">
            <li><a href="#landing" className="text-black text-sm hover:opacity-50 block px-4 py-2">Home</a></li>
            <li><a href="#experience" className="text-black text-sm hover:opacity-50 block px-4 py-2">Experience</a></li>
            <li><a href="#skills" className="text-black text-sm hover:opacity-50 block px-4 py-2">Skills</a></li>
            <li><a href="#projects" className="text-black text-sm hover:opacity-50 block px-4 py-2">Projects</a></li>
            <li><a href="#contact" className="text-black text-sm hover:opacity-50 block px-4 py-2">Contact</a></li>
          </ul>
        </div>

        {/* Social Section */}
        <div className="relative group">
          <p className="cursor-pointer text-lg">Social</p>
          <ul className="absolute left-0 py-2 hidden bg-white shadow-lg group-hover:block border border-black-50 rounded">
            <li>
              <a href="https://linkedin.com/in/simon-studen" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex px-4 py-2 hover:opacity-50">
                <FaLinkedin size={18} className="text-black mr-1" />
                <button className="text-black text-sm">Linkedin</button>
              </a>
            </li>
            <li>
              <a href="https://github.com/sstuden2255" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex px-4 py-2 hover:opacity-50">
                <FaGithub size={18} className="text-black mr-1" />
                <button className="text-black text-sm">Github</button>
              </a>
            </li>
            <li>
              <a href="https://www.sstuden.me" target="_blank" rel="noopener noreferrer" aria-label="Old Portfolio" className="flex px-4 py-2 hover:opacity-50">
                <FaUserCircle size={18} className="text-black mr-1" />
                <button className="text-black text-sm whitespace-nowrap">Old Portfolio</button>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;