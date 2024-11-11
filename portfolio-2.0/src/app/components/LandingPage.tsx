import React from 'react';

/*
TODO: add a botton that scrolls to experience anchor. Use this snippet if you need some offset:#contact

  window.scrollTo({
    top: document.getElementById("someSection").offsetTop,
    behavior: "smooth",
  });

*/

const LandingPage: React.FC = () => {
  return (
    <section id="landing" className="h-screen flex items-center justify-center bg-gray-800 text-white p-8">
      <h1 className="text-2xl">Hi! I'm Simon, a passionate fullstack mobile and web developer.</h1>
    </section>
  );
};

export default LandingPage;