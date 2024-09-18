/* eslint-disable prettier/prettier */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import 'tailwindcss/tailwind.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = `${time.toLocaleTimeString()}.${String(time.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;

  return <div className="clock">{formattedTime}</div>;
}

function Alarms() {
  const [alarms, setAlarms] = useState<
    { id: number; time: string; label: string }[]
  >([]);

  useEffect(() => {
    window.electron.ipcRenderer.once('alarms', (arg: any) => {
      setAlarms(arg);
    });

    window.electron.ipcRenderer.sendMessage('alarms');
  }, []);

  return (
    <div className="alarms">
      <div className="clock">#SOON</div>
      <div className="grid grid-cols-2 gap-2">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="alarm w-full p-4 bg-zinc-800/20 rounded-lg"
          >
            <div>{alarm.label}</div>
            <div>{alarm.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hello() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleTab = (tab: string) => {
    window.electron.ipcRenderer.sendMessage('update-current-tab', tab);
    setActiveTab(tab);
  };

  useEffect(() => {
    window.electron.ipcRenderer.once('current-tab', (arg: any) => {
      setActiveTab(arg);

      if (arg === null || arg === undefined || arg === '') {
        setActiveTab('clock');
      }

      setLoading(false);
    });

    window.electron.ipcRenderer.sendMessage('current-tab');
  }, []);

  const variants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  return (
    <div className="hello">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="fas fa-spinner-third animate-spin text-4xl" />
        </div>
      ) : (
        <div className="flex flex-row items-start justify-center h-full w-full">
          <div className="flex flex-col items-center justify-start w-20 px-2 py-12 gap-3 h-full bg-zinc-800/20">
            <div className="relative flex flex-row w-full justify-center">
              <button
                className={`py-2 px-4 rounded-lg ${activeTab === 'clock' ? 'bg-zinc-800/40 text-zinc-50' : 'text-zinc-300'} hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => handleTab('clock')}
              >
                <i className="fas fa-clock" />
              </button>
              {activeTab === 'clock' && (
                <span className="absolute top-1/2 left-[-2px] w-1 h-1/2 -translate-y-1/2 bg-white rounded-lg" />
              )}
            </div>
            <div className="relative flex flex-row w-full justify-center">
              <button
                className={`relative py-2 px-4 rounded-lg ${activeTab === 'alarms' ? 'bg-zinc-800/40 text-zinc-50' : 'text-zinc-300'} hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => handleTab('alarms')}
              >
                <i className="fas fa-bell" />
              </button>
              {activeTab === 'alarms' && (
                <span className="absolute top-1/2 left-[-2px] w-1 h-1/2 -translate-y-1/2 bg-white rounded-lg" />
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full h-full">
            {activeTab === 'clock' && (
              <motion.div
                key="clock"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.5 }}
              >
                <Clock />
              </motion.div>
            )}
            {activeTab === 'alarms' && (
              <motion.div
                key="alarms"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.5 }}
              >
                <Alarms />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
