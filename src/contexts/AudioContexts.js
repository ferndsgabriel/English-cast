import { createContext, useEffect, useState } from "react";
import "./song.css";
import { RiPlayListAddLine } from "react-icons/ri";
import {FaPause, FaPlay } from "react-icons/fa";
import { GiPreviousButton, GiNextButton } from "react-icons/gi";
import SaveAudio from "../components/modals/saveAudio";
import { Link } from "react-router-dom";

const AudioContext = createContext();

export default function AudioProvider({ children }) {
    const [currentAudio, setCurrentAudio] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [playlistIndex, setPlaylistIndex] = useState(0);
    const [isOpenSave, setIsOpenSave] = useState(false);

    function getSongs(playData, index) {
        setTimeout(() => {
            setPlaylist(playData);
            setPlaylistIndex(index);
            const newAudio = new Audio(playData[index].Audio);
            if (currentAudio) {
                currentAudio.pause();
            }
            setCurrentAudio(newAudio);
            setAudioData(playData);
            setIsPlaying(false);
        }, 500);
    }

    useEffect(() => {
        if (currentAudio) {
            const handleLoadedMetadata = () => setDuration(currentAudio.duration);
            const handleTimeUpdate = () => setCurrentTime(currentAudio.currentTime);

            currentAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
            currentAudio.addEventListener("timeupdate", handleTimeUpdate);

            currentAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

            return () => {
                currentAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
                currentAudio.removeEventListener("timeupdate", handleTimeUpdate);
                currentAudio.pause();
            };
        }
    }, [currentAudio]);

    useEffect(() => {
        if (currentAudio && currentTime >= currentAudio.duration) {
            setIsPlaying(false);
        }
    }, [currentTime]);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function playMusic() {
        if (currentAudio) {
            currentAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }

    function pauseMusic() {
        if (currentAudio) {
            currentAudio.pause();
            setIsPlaying(false);
        }
    }

    function handleCurrentTime(e) {
        const newTime = e.target.value;
        setCurrentTime(newTime);
        if (currentAudio) {
            currentAudio.currentTime = newTime;
        }
    }

    function handleNextMusic() {
        if (currentAudio) {
            currentAudio.pause();
            let nextIndex = playlistIndex + 1;
            if (nextIndex >= playlist.length) {
                nextIndex = 0;
            }
            setPlaylistIndex(nextIndex);
            const newAudio = new Audio(playlist[nextIndex].Audio);
            setCurrentAudio(newAudio);
            newAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }

    function handlePreviousMusic() {
        if (currentAudio) {
            currentAudio.pause();
            let prevIndex = playlistIndex - 1;
            if (prevIndex < 0) {
                prevIndex = playlist.length - 1;
            }
            setPlaylistIndex(prevIndex);
            const newAudio = new Audio(playlist[prevIndex].Audio);
            setCurrentAudio(newAudio);
            newAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }

    function openSave() {
        if (currentAudio) {
            currentAudio.pause();
        }
        setIsOpenSave(true);
    }

    function closeSave() {
        setIsOpenSave(false);
    }

    useEffect(() => {
        if (isOpenSave && currentAudio) {
            currentAudio.pause();
        }
    }, [isOpenSave]);

    function MusicComponente() {
        if (!audioData) return null;
        return (
            <div className="song-container">
                <div className="audioInfo">
                    <img src={audioData[playlistIndex].Cover} alt="capa" />
                    <div className="about-audio">
                        <h4>{audioData[playlistIndex].Name}</h4>
                            <span>-</span>
                        <Link to={`/user/${audioData[playlistIndex].Author}`}><p>{audioData[playlistIndex].Author}</p></Link>
                    </div>
                </div>

                <div className="song_control">
                    <div className="slide_control">
                        <span>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            value={currentTime}
                            min={0}
                            max={duration}
                            onChange={handleCurrentTime}
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="menus">
                        <button onClick={openSave} className="playlist"><RiPlayListAddLine /></button>
                        <SaveAudio isOpen={isOpenSave} closeModal={closeSave} audioId={audioData[playlistIndex].Id} />
                        <div className="controls">
                            <button onClick={handlePreviousMusic}>< GiPreviousButton /></button>
                            {isPlaying ? (
                                <button onClick={pauseMusic} className="pause_style"><FaPause /></button>
                            ) : (
                                <button onClick={playMusic} className="pause_style"><FaPlay /></button>
                            )}
                            <button onClick={handleNextMusic}><GiNextButton /></button>
                        </div>
                    </div>
                </div>

                <button onClick={openSave} className="desktop-playlist"><RiPlayListAddLine /></button>
            </div>
        );
    }

    return (
        <AudioContext.Provider value={{ getSongs, MusicComponente, pauseMusic, isPlaying, closeSave }}>
            {children}
        </AudioContext.Provider>
    );
}

export { AudioContext };
