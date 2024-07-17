import "./playlists.css";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import { AudioContext } from "../../contexts/AudioContexts";
import { useContext, useEffect, useRef, useState } from "react";
import { db } from "../../services/firebase";
import { query, collection, where, getDocs, getDoc, doc } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContexts";
import Loading from "../../components/loading";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import NewPlayList from "../../components/modals/newplaylist";
import DeletePlaylist from "../../components/modals/deletePlaylist";
import EditPlaylist from "../../components/modals/editPlaylist";
import { useNavigate } from "react-router-dom";

export default function Playlists() {
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const { userDetails } = useContext(AuthContext);
    const { MusicComponente, getSongs } = useContext(AudioContext);
    const uid = userDetails.Uid;
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [playlistId, setPlaylistId] = useState('');
    const [optionsVisible, setOptionsVisible] = useState(null);
    const optionsRef = useRef();
    const openOptionsRef = useRef();
    const playRef = useRef();
    const navigate = useNavigate();

    async function getList() {
        const userDocRef = doc(db, 'Users', uid);
        const myQuery = query(collection(db, "Playlist"), where('UserId', '==', userDocRef));
        const querySnapshot = await getDocs(myQuery);
        const playlistArray = [];

        if (!querySnapshot.empty) {
            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();
                const songs = [];

                for (const songRef of data.Songs || []) {
                    const songDoc = await getDoc(songRef);
                    if (songDoc.exists()) {
                        songs.push(songDoc.data());
                    }
                }

                const playlistData = {
                    Name: data.Name,
                    Id: data.Id,
                    Songs: songs,
                };

                playlistArray.push(playlistData);
            }
        }

        setPlaylists(playlistArray);
        setLoading(false);
    }

    function openCreate() {
        setIsOpenCreate(true);
    }

    function closeCreate() {
        setIsOpenCreate(false);
    }

    useEffect(() => {
        getList();
    }, [closeCreate, closeEdit]);

    async function fetchAuthorNick(authorRef) {
        const authorDoc = await getDoc(authorRef);
        if (authorDoc.exists()) {
            return authorDoc.data().Nick;
        } else {
            console.error("Author document does not exist:", authorRef);
            return null;
        }
    }

    async function playMusic(songsArray) {
        let toPlay = [];
        if (songsArray.length > 0) {
            for (const item of songsArray) {
                const authorNick = await fetchAuthorNick(item.Author);
                if (authorNick) {
                    toPlay.push({
                        Audio: item.Audio,
                        Name: item.Name,
                        Author: authorNick,
                        Cover: item.Cover,
                        Id: item.Id
                    });
                }
            }
            getSongs(toPlay, 0);
        } else {
            return;
        }
    }

    function openDelete(Id, e) {
        e.stopPropagation();
        setPlaylistId(Id);
        setIsOpenDelete(true);
    }
    function closeDelete() {
        setIsOpenDelete(false);
    }
    function openEdit(Id,e) {
        e.stopPropagation();
        setPlaylistId(Id);
        setIsOpenEdit(true);
    }
    function closeEdit() {
        setIsOpenEdit(false);
    }

    function handleOpenOptions(index, e) {
        e.stopPropagation();  
        setOptionsVisible(index);
    }

    useEffect(() => {
        function closeOptions(e) {
            if (!optionsRef.current?.contains(e.target) && !openOptionsRef.current?.contains(e.target)) {
                setOptionsVisible(null);
            }
        }

        if (optionsVisible !== null) {
            document.addEventListener("click", closeOptions);
        }

        return () => {
            document.removeEventListener("click", closeOptions);
        };
    }, [optionsVisible]);

    function clickContainer(id) {
        return (e) => {
            if (!optionsRef.current?.contains(e.target) && !openOptionsRef.current?.contains(e.target) && !playRef.current?.contains(e.target)) {
                navigate(`/playlists/${id}`);
            }
        };
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Header />
            <MusicComponente />
            <main className="playlist-container">
                <div className="playlist-all">
                    <section className="playlist-section1">
                        <Perfil />
                    </section>
                    <section className="playlist-section2">
                        <h1>Suas playlist</h1>
                        <article className="list-playlist">
                            {playlists.length > 0 ? (
                                playlists.map((item, index) => {
                                    return (
                                        <div className="container" key={index} onClick={clickContainer(item.Id)}>
                                            <div className="data-area">
                                                {item.Songs.length > 0 ? (
                                                    <img src={item.Songs[0].Cover} className="img" />
                                                ) : <span className="img">{item.Name[0]}</span>
                                                }
                                                <div className="infos">
                                                    <p>{item.Name}</p>
                                                    <p>Músicas: {item.Songs.length}</p>
                                                </div>
                                            </div>

                                            <div className="buttons">
                                                {item.Songs.length > 0 ? (
                                                    <button className="play" onClick={() => playMusic(item.Songs)} ref={playRef}><FaPlay /></button>
                                                ) : null}
                                                <button className="openOptions" onClick={(e) => handleOpenOptions(index, e)} ref={openOptionsRef}>
                                                    <HiOutlineDotsVertical />
                                                </button>
                                            </div>

                                            <div className={`options ${optionsVisible === index ? 'visibleOptions' : ''}`} ref={optionsRef}>
                                                <button onClick={(e) => openEdit(item.Id,e)}>Editar nome</button>
                                                <button onClick={(e) => openDelete(item.Id,e)}>Excluir</button>
                                            </div>
                                            <EditPlaylist isOpen={isOpenEdit} closeModal={closeEdit} playlistId={playlistId} />
                                            <DeletePlaylist isOpen={isOpenDelete} closeModal={closeDelete} playlistId={playlistId} />
                                        </div>
                                    );
                                })
                            ) : null}
                        </article>
                        <label className="label-create">
                            <button onClick={openCreate}><AiOutlinePlus /></button>
                            <span>Criar</span>
                        </label>
                        <NewPlayList isOpen={isOpenCreate} closeModal={closeCreate} />
                    </section>
                </div>
            </main>
        </>
    );
}
