import { useEffect } from "react";

export default function Controls({
  audioRef,
  setAudioFile,
  mode,
  setMode,
  useMic,
  setUseMic,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const blobURL = URL.createObjectURL(file);
      setAudioFile(blobURL);
      if (audioRef.current) {
        audioRef.current.src = blobURL;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
      setUseMic(false); // ensure we’re in file mode
    }
  };

  const modes = ["Bars", "Wave", "Radial"];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, [audioRef]);

  return (
    <div
      className="w-[85vw] max-w-[80rem] mx-auto bg-white/5 border border-white/10 
                 rounded-[1.5vw] shadow-[0_0_2vw_rgba(255,255,255,0.08)] 
                 flex items-center justify-between gap-[1.5vw] 
                 px-[2vw] py-[1vw] backdrop-blur-md transition-all duration-300 
                 hover:bg-white/10 text-[1vw]"
    >
      {/* Upload Button */}
      <label
        className="cursor-pointer bg-white/10 hover:bg-white/20 text-white 
                   font-medium px-[1.2vw] py-[0.6vw] rounded-[0.6vw] 
                   shadow-inner transition-all text-[1vw]"
      >
        Upload Song
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Mic Button */}
      <button
        onClick={() => {
          setUseMic((prev) => !prev);
          if (audioRef.current) audioRef.current.pause();
        }}
        className={`px-[1.2vw] py-[0.6vw] rounded-[0.6vw] font-medium transition-all text-[1vw]
          ${
            useMic
              ? "bg-red-500/70 hover:bg-red-500 text-white"
              : "bg-green-500/60 hover:bg-green-500 text-white"
          }`}
      >
        {useMic ? "Stop Mic" : "Use Mic"}
      </button>

      {/* Audio Player */}
      <audio
        ref={audioRef}
        controls
        className="flex-1 invert-[0.85] contrast-125 opacity-90 rounded-[0.6vw]
                   scale-[0.95] md:scale-100 transition-all duration-300"
      />

      {/* Mode Selector */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="bg-white/10 text-white px-[1vw] py-[0.5vw] 
                   rounded-[0.6vw] border border-white/20 
                   focus:outline-none focus:ring-[0.2vw] focus:ring-white/40 
                   transition-all text-[1vw]"
      >
        {modes.map((m) => (
          <option key={m} className="text-black bg-white">
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
