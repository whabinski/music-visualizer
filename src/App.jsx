import { useState, useRef } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import VisualizerCanvas from "./components/VisualizerCanvas";

export default function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [mode, setMode] = useState("Bars");
  const [useMic, setUseMic] = useState(false);
  const audioRef = useRef(null);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center 
                 bg-black text-white font-sans selection:bg-indigo-500 selection:text-white 
                 overflow-hidden"
    >
      <div className="w-full max-w-6xl flex flex-col items-center justify-between h-[90vh] px-6 text-center">
        <div className="flex-none mt-[1vh]">
          <Header />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <VisualizerCanvas
            audioRef={audioRef}
            audioFile={audioFile}
            mode={mode}
            useMic={useMic}
          />
        </div>

        <div className="flex-none mb-[2vh] w-full flex justify-center">
          <Controls
            audioRef={audioRef}
            setAudioFile={setAudioFile}
            mode={mode}
            setMode={setMode}
            useMic={useMic}
            setUseMic={setUseMic}
          />
        </div>
      </div>
    </div>
  );
}
