import LandingPage from './components/LandingPage';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';


export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingPage />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
    </div>
  );
}
