/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-else-return */
/* eslint-disable prefer-template */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable prettier/prettier */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import 'tailwindcss/tailwind.css';
import { Switch } from '@headlessui/react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

function Clock() {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [militaryTime, setMilitaryTime] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.once('load-settings', (arg: any) => {
      setMilitaryTime(arg.militaryTime);
      setLoading(false);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
  }, []);

  const formattedTime = militaryTime
    ? `${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}.${String(time.getMilliseconds()).padStart(3, '0').slice(0, 2)}`
    : `${time.toLocaleTimeString()}.${String(time.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;

  return (
    <div className="clock">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="fas fa-spinner-third animate-spin text-4xl" />
        </div>
      ) : (
        <h1>{formattedTime}</h1>
      )}
    </div>
  );
}

function Alarms() {
  const [alarms, setAlarms] = useState<
    {
      [x: string]: ReactNode;
      id: number;
      time: string;
      label: string;
      active: boolean;
      repeat: string[];
      amPm: string;
    }[]
  >([]);
  const [newAlarmTitle, setNewAlarmTitle] = useState(
    'Alarm (' + alarms.length + 1 + ')',
  );
  const [amPm, setAmPm] = useState(true);

  const [newAlarmActive, setNewAlarmActive] = useState(true);
  const [alarmHours, setAlarmHours] = useState(7);
  const [alarmMinutes, setAlarmMinutes] = useState(45);
  const [alarmTimeActive, setAlarmTimeActive] = useState('hours'); // hours, minutes
  const [newAlarmRepeatCycle, setNewAlarmRepeatCycle] = useState<string[]>([]); // array of selected days
  const [newAlarmOpen, setNewAlarmOpen] = useState(false);
  const [militaryTime, setMilitaryTime] = useState(false);
  const [amPmMode, setAmPmMode] = useState(true);

  useEffect(() => {
    window.electron.ipcRenderer.once('alarms', (arg: any) => {
      setAlarms(arg);
    });

    window.electron.ipcRenderer.once('load-settings', (arg: any) => {
      setAmPm(arg.militaryTime);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
    window.electron.ipcRenderer.sendMessage('alarms');
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.once('load-settings', (arg: any) => {
      setMilitaryTime(arg.militaryTime);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
  }, []);

  const toggleDay = (day: string) => {
    setNewAlarmRepeatCycle((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const getNextRingTime = (
    mt: number,
    time: string,
    repeat: string[],
  ): string => {
    const [hours, minutes] = time.split(':').map((t) => parseInt(t, 10));

    const now = new Date();

    const next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
    );

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    if (mt === 0) {
      const isPM = time.toLowerCase().includes('pm');
      if (isPM && hours < 12) {
        next.setHours(hours + 12);
      } else if (!isPM && hours === 12) {
        next.setHours(0);
      }
    }

    if (next <= now) {
      next.setDate(now.getDate() + 1);
    }

    while (!repeat.includes(daysOfWeek[next.getDay()].toLowerCase())) {
      next.setDate(next.getDate() + 1);
    }

    const totalMinutesUntilNext = Math.ceil(
      (next.getTime() - now.getTime()) / 1000 / 60,
    );

    const hoursUntilNext = Math.floor(totalMinutesUntilNext / 60);
    const minutesUntilNext = totalMinutesUntilNext % 60;

    const timeString = next.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: mt === 0,
    });

    return `${daysOfWeek[next.getDay()]} at ${timeString} (in ${hoursUntilNext} hours and ${minutesUntilNext} minutes)`;
  };

  return (
    <div className=" w-full items-center justify-center flex flex-col">
      <div
        className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-neutral-900/60 z-50 ${
          newAlarmOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="w-96 p-4 bg-neutral-800/60 rounded-lg backdrop-blur-md">
          <div className="flex flex-row items-center justify-between mb-6">
            <h1 className="text-xl font-bold">New Alarm</h1>
            {amPm && (
              <div className="flex flex-row items-center justify-start mt-2 gap-2">
                <button
                  className={`py-2 px-4 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                  onClick={() => setAmPmMode(!amPmMode)}
                >
                  <i className={`fas fa-${amPmMode ? 'sun' : 'moon'}`} />
                  <span className="ml-2">{amPmMode ? 'AM' : 'PM'}</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-center justify-start mt-2 w-full">
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <button
                className={`py-2 px-4 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => {
                  setAlarmHours((alarmHours + 1) % (amPm ? 12 : 24));
                }}
              >
                <i className="fas fa-chevron-up" />
              </button>
              <button
                className={`py-2 px-4 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => {
                  setAlarmMinutes((alarmMinutes + 1) % 60);
                }}
              >
                <i className="fas fa-chevron-up" />
              </button>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center w-full p-1 bg-zinc-800/40 rounded-lg border border-zinc-800/60 hover:border-zinc-800/40 transition-colors duration-200 ease-in-out">
              <button
                className={`h-full w-auto px-2 items-center justify-center hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out rounded-lg ${alarmTimeActive === 'hours' ? 'bg-zinc-800/60' : ''}`}
                onClick={() => setAlarmTimeActive('hours')}
              >
                <h1
                  className={`clock2 text-4xl ${alarmTimeActive === 'hours' ? 'text-zinc-50' : 'text-zinc-300'}`}
                >
                  {alarmHours}
                </h1>
              </button>
              <h1 className="text-xl">:</h1>
              <button
                className={`h-full w-auto px-2 items-center justify-center hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out rounded-lg ${alarmTimeActive === 'minutes' ? 'bg-zinc-800/60' : ''}`}
                onClick={() => setAlarmTimeActive('minutes')}
              >
                <h1
                  className={`clock2 text-4xl ${alarmTimeActive === 'minutes' ? 'text-zinc-50' : 'text-zinc-300'}`}
                >
                  {alarmMinutes}
                </h1>
              </button>
            </div>
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <button
                className={`py-2 px-4 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => {
                  setAlarmHours((alarmHours - 1 + 24) % (amPm ? 12 : 24));
                }}
              >
                <i className="fas fa-chevron-down" />
              </button>
              <button
                className={`py-2 px-4 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                onClick={() => {
                  setAlarmMinutes((alarmMinutes - 1 + 60) % 60);
                }}
              >
                <i className="fas fa-chevron-down" />
              </button>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center justify-start mt-4">
            <i className="fal fa-input-text" />
            <input
              type="text"
              value={newAlarmTitle}
              onChange={(e) => setNewAlarmTitle(e.target.value)}
              className="w-full py-3 px-4 bg-zinc-800/40 rounded-lg border border-zinc-800/60 hover:border-zinc-800/40 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="flex flex-row gap-4 items-center justify-start mt-6">
            <label>Active</label>
            <Switch
              checked={newAlarmActive}
              onChange={setNewAlarmActive}
              className={`${
                newAlarmActive ? 'bg-blue-500' : 'bg-zinc-800/40'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={`${
                  newAlarmActive ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <div className="flex flex-row items-center justify-start mt-4 gap-2">
            {[
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ].map((day) => (
              <button
                key={day}
                className={`py-2 px-1 w-full rounded-full hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out ${newAlarmRepeatCycle.includes(day) ? 'bg-zinc-800/80' : ''} border border-zinc-800/60`}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 2).charAt(0).toUpperCase() +
                  day.slice(0, 2).slice(1)}
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-800/60 mt-4" />
          <div className="flex flex-row items-center gap-2 justify-center mt-6 w-full">
            <button
              className="py-2 w-full px-4 ml-2 rounded-lg bg-blue-500 text-zinc-50 hover:bg-blue-400 transition-colors duration-200 ease-in-out"
              onClick={() => {
                window.electron.ipcRenderer.once('add-alarm', (arg: any) => {
                  setAlarms(arg);
                });

                window.electron.ipcRenderer.sendMessage('add-alarm', {
                  time: militaryTime
                    ? `${String(alarmHours % 12).padStart(2, '0')}:${String(alarmMinutes).padStart(2, '0')}`
                    : `${String(alarmHours).padStart(2, '0')}:${String(alarmMinutes).padStart(2, '0')}`,
                  label: newAlarmTitle,
                  active: newAlarmActive,
                  repeat: newAlarmRepeatCycle,
                  amPm: amPmMode ? 'AM' : 'PM',
                });

                setNewAlarmOpen(false);
              }}
            >
              <i className="fal fa-save mr-2" />
              Save
            </button>
            <button
              className="py-2 w-full px-4 rounded-lg bg-zinc-800/40 text-zinc-50 hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out"
              onClick={() => {
                setNewAlarmTitle('Alarm (' + alarms.length + 1 + ')');
                setNewAlarmActive(true);
                setAlarmHours(7);
                setAlarmMinutes(45);
                setNewAlarmRepeatCycle([]);
                setNewAlarmOpen(false);
              }}
            >
              <i className="fal fa-times mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {!newAlarmOpen && (
        <>
          <div className="flex flex-row items-center justify-start gap-2">
            <h1 className="text-2xl font-bold">Alarms</h1>
            <button
              className="py-2 px-4 rounded-lg bg-zinc-800/40 text-zinc-50 hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out"
              onClick={() => setNewAlarmOpen(true)}
            >
              <i className="fas fa-plus" />
            </button>
          </div>

          <div className="border-t border-zinc-800/60 mt-6 w-full" />
          <div className="grid grid-cols-2 gap-2 mt-6 w-full">
            {alarms.length > 0 ? (
              alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="relative alarm p-4 bg-zinc-800/20 rounded-lg w-full gap-6 flex flex-row items-center justify-between transition-all duration-200 ease-in-out hover:shadow-lg"
                >
                  <div className="flex flex-col items-start justify-center">
                    <h1 className="clock2 text-5xl">
                      {militaryTime
                        ? alarm.time + ' ' + alarm.amPm
                        : alarm.time}
                    </h1>
                    <p className="text-sm">
                      <i className="fal fa-clock mr-2" />
                      {getNextRingTime(
                        alarm.amPm === 'AM' ? 0 : 1,
                        alarm.time,
                        alarm.repeat,
                      )}
                    </p>
                    <p className="text-sm">
                      <i className="fal fa-bell mr-2" />
                      {alarm.label}
                    </p>
                    <div className="flex flex-row items-center gap-2 mt-6">
                      <i className="fal fa-repeat mr-2" />
                      {alarm.repeat.map((day) => (
                        <span
                          key={day}
                          className="text-xs px-2 py-1 bg-zinc-800/40 rounded-lg"
                        >
                          {day.slice(0, 2).charAt(0).toUpperCase() +
                            day.slice(0, 2).slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-row items-center justify-center gap-2">
                    <Switch
                      checked={alarm.active}
                      onChange={(checked) => {
                        window.electron.ipcRenderer.once(
                          'update-alarm',
                          (arg: any) => {
                            setAlarms(arg);
                          },
                        );

                        window.electron.ipcRenderer.sendMessage(
                          'update-alarm',
                          {
                            id: alarm.id,
                            time: alarm.time,
                            label: alarm.label,
                            active: checked,
                            repeat: alarm.repeat,
                          },
                        );
                      }}
                      className={`${
                        alarm.active ? 'bg-blue-500' : 'bg-zinc-800/40'
                      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`${
                          alarm.active ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                      />
                    </Switch>
                    <button
                      className="py-2 px-4 rounded-lg bg-zinc-800/40 text-zinc-50 hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out"
                      onClick={() => {
                        window.electron.ipcRenderer.once(
                          'delete-alarm',
                          (arg: any) => {
                            setAlarms(arg);
                          },
                        );

                        window.electron.ipcRenderer.sendMessage(
                          'delete-alarm',
                          { id: alarm.id },
                        );
                      }}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-2xl font-bold">No alarms yet</h1>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Settings() {
  const [loading, setLoading] = useState(true);
  const [militaryTime, setMilitaryTime] = useState(false);
  const [backgroundRunning, setBackgroundRunning] = useState(true);
  const [autoBoot, setAutoBoot] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.once('load-settings', (arg: any) => {
      setMilitaryTime(arg.militaryTime);
      setBackgroundRunning(arg.backgroundRunning);
      setAutoBoot(arg.autoBoot);
      setLoading(false);
    });

    window.electron.ipcRenderer.sendMessage('load-settings');
  }, []);

  const handleSaveSettings = () => {
    window.electron.ipcRenderer.sendMessage('save-settings', {
      militaryTime,
      backgroundRunning,
      autoBoot,
    });
  };

  return (
    <div className="settings">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="border-t border-zinc-800/60 mt-6 w-full" />
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <i className="fas fa-spinner-third animate-spin text-4xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-6 w-full">
          <div
            className="flex flex-row gap-6 items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out cursor-pointer"
            onClick={() => {
              setMilitaryTime(!militaryTime);
            }}
          >
            <h1 className="text-lg">AM/PM mode</h1>
            <Switch
              checked={militaryTime}
              className={`${
                militaryTime ? 'bg-blue-500' : 'bg-zinc-800/40'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={`${
                  militaryTime ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <div
            className="flex flex-row gap-6 items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out cursor-pointer"
            onClick={() => {
              setBackgroundRunning(!backgroundRunning);
            }}
          >
            <h1 className="text-lg">Background Running</h1>
            <Switch
              checked={backgroundRunning}
              className={`${
                backgroundRunning ? 'bg-blue-500' : 'bg-zinc-800/40'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={`${
                  backgroundRunning ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <div
            className="flex flex-row gap-6 items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out cursor-pointer"
            onClick={() => {
              setAutoBoot(!autoBoot);
            }}
          >
            <h1 className="text-lg">Auto Boot</h1>
            <Switch
              checked={autoBoot}
              className={`${
                autoBoot ? 'bg-blue-500' : 'bg-zinc-800/40'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={`${
                  autoBoot ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
              />
            </Switch>
          </div>
          <button
            className="py-2 px-4 rounded-lg bg-zinc-800/40 text-zinc-50 hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out"
            onClick={handleSaveSettings}
          >
            <i className="fal fa-save mr-2" />
            Save
          </button>
        </div>
      )}
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
          <div className="flex flex-col items-center justify-between w-20 px-2 py-12 gap-3 h-full bg-zinc-800/20">
            <div className="flex flex-col w-full justify-center">
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
            <div className="flex flex-col w-full justify-end items-end">
              <div className="relative flex flex-row w-full justify-center items-end">
                <button
                  className={`relative py-2 px-4 rounded-lg ${activeTab === 'settings' ? 'bg-zinc-800/40 text-zinc-50' : 'text-zinc-300'} hover:bg-zinc-800/60 transition-colors duration-200 ease-in-out`}
                  onClick={() => handleTab('settings')}
                >
                  <i className="fas fa-cog" />
                </button>
                {activeTab === 'settings' && (
                  <span className="absolute top-1/2 left-[-2px] w-1 h-1/2 -translate-y-1/2 bg-white rounded-lg" />
                )}
              </div>
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
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.5 }}
              >
                <Settings />
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
