/* eslint-disable prefer-template */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/button-has-type */

import 'tailwindcss/tailwind.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10); // Update every 10 milliseconds
    return () => clearInterval(timer);
  }, []);

  const formattedTime = `${time.toLocaleTimeString()}.${String(time.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;

  return <div className="clock">{formattedTime}</div>;
}

function Alarms() {
  const [alarms, setAlarms] = useState<
    { id: number; time: string; label: string }[]
  >([]);

  /*
  const [newAlarm, setNewAlarm] = useState('');

  const addAlarm = () => {
    if (newAlarm) {
      window.electron.ipcRenderer.sendMessage('add-alarm', {
        time: newAlarm,
        label: 'Alarm #' + (alarms.length + 1),
      });
      setNewAlarm('');
      setAlarms([
        ...alarms,
        {
          id: alarms.length + 1,
          time: newAlarm,
          label: 'Alarm #' + (alarms.length + 1),
        },
      ]);
    }
  };
  */

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

  return (
    <div className="hello">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="fas fa-spinner-third animate-spin text-4xl" />
        </div>
      ) : (
        <>
          <div className="absolute top-[10%] shadow-lg left-1/2 -translate-x-1/2 tabs bg-zinc-800/20 w-auto px-0 py-2 rounded-lg">
            <button
              onClick={() => handleTab('clock')}
              className={
                activeTab === 'clock' ? 'bg-zinc-900/60 rounded-lg' : ''
              }
            >
              Current Time
            </button>
            <button
              onClick={() => handleTab('alarms')}
              className={activeTab === 'alarms' ? 'bg-zinc-900 rounded-lg' : ''}
            >
              Alarms
            </button>
          </div>
          {activeTab === 'clock' && <Clock />}
          {activeTab === 'alarms' && <Alarms />}
        </>
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
