import "./playlistwithId.css";
import { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/loading";
import { AuthContext } from "../../contexts/AuthContexts";
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from "../../services/firebase";
import { FaPlay, FaPause } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { AudioContext } from "../../contexts/AudioContexts";
import RemoveAudio from "../../components/modals/removeAudio";



export default function PlaylistwithId() {
    const [loading, setLoading] = useState(true);
    const [playlist, setPlaylist] = useState({});
    const { userDetails } = useContext(AuthContext);
    const { getSongs, MusicComponente, pauseMusic, isPlaying } = useContext(AudioContext);
    const [itsMine, setItsMine] = useState(false);
    const { id } = useParams();

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [musicPlayIndex, setMusicPlayIndex] = useState(null);
    const [isOpenRemove, setIsOpenRemove] = useState(false);
    const [removeIndex, setRemoveIndex] = useState(null);



    async function getPlaylist() {
        const idString = id.toString();
        const myQuery = query(collection(db, "Playlist"), where('Id', '==', idString));
        const querySnapshot = await getDocs(myQuery);

        if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            const playlistData = firstDoc.data();

            let songs = [];

            if (playlistData.Songs) {
                for (const songRef of playlistData.Songs) {
                    const songDoc = await getDoc(songRef);
                    if (songDoc.exists()) {
                        songs.push(songDoc.data());
                    }
                }
            }

            const data = {
                Name: playlistData.Name,
                Id: playlistData.Id,
                UserId: playlistData.UserId,
                Songs: songs || []
            };

            setPlaylist(data);
        } else {
            setPlaylist(null);
            navigate('/');
        }
    }

    async function fetchUser() {
        if (playlist && playlist.UserId) {
            const userSnapshot = await getDoc(playlist.UserId);
            if (userSnapshot.exists()) {
                const userData = {
                    Name: userSnapshot.data().Name || '',
                    LastName: userSnapshot.data().LastName || '',
                    Nick: userSnapshot.data().Nick || '',
                    Avatar: userSnapshot.data().Avatar || ''
                };
                setUserData(userData);
                const userId = userSnapshot.data().Uid;
                if (userDetails.Uid === userId) {
                    setItsMine(true);
                } else {
                    setItsMine(false);
                }
            }
        } else {
            setItsMine(false);
        }
    }

    useEffect(() => {
        getPlaylist();
        setLoading(false);
    }, [closeRemove]);

    useEffect(() => {
        if (!loading && playlist) {
            fetchUser();
        }
    }, [loading, playlist]);

    async function fetchAuthorNick(authorRef) {
        const authorDoc = await getDoc(authorRef);
        if (authorDoc.exists()) {
            return authorDoc.data().Nick;
        } else {
            console.error("Author document does not exist:", authorRef);
            return null;
        }
    }

    async function setSongsPlaylist(songsArray) {
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

    async function setSongsPlaylistWithIndex(songsArray, index) {
        setMusicPlayIndex(index)
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
            getSongs(toPlay, index);
        } else {
            return;
        }
    }


    function PauseMusic(index, e){
        e.stopPropagation(); 
        pauseMusic();
    }   

    function openRemove(index, e){
        setRemoveIndex(index);
        e.stopPropagation();
        setIsOpenRemove(true);
    }

    function closeRemove(){
        setIsOpenRemove(false);
    }

    if (loading) {
        return <Loading />;
    }   

    return (
        <>
            <Header />
            <MusicComponente/>
            <main className="playlistid-container">
                <div className="playlistid-all">
                    <section className="playlistid-section1">
                        <Perfil />
                    </section>

                    <section className="playlistid-section2">
                        <article className="playlist-info">
                            {playlist.Songs &&  playlist.Songs.length > 0 ? (
                                <img src={playlist.Songs[0].Cover} alt="capa" className="img" />
                            ) : (
                                <>
                                    {playlist.Name?(
                                        <span className="img">{playlist.Name[0]}</span>
                                    ):null}
                                </>
                                
                            )}

                            <div className="playlist-data">
                                <p>Playlist</p>
                                <p>{playlist.Name}</p>
                                {userData?(
                                    <>

                                    <div className="user">
                                        {userData && userData.Avatar ? (
                                            <img src={userData.Avatar} alt="cover" className="img"/>
                                        ) : (
                                            <span className="img">{userData.Name[0]}{userData.LastName[0]}</span>
                                        )}
                                        <span>● {userData.Nick}</span>
                                    </div>
                                    </>
                                ):null}
                            </div>
                        </article>

                        <div className="buttons">
                            {playlist.Songs && playlist.Songs.length > 0?(
                                <button className="play" onClick={()=>setSongsPlaylist(playlist.Songs)}><FaPlay /></button>
                            ):null}
                        </div>
                    </section>
                

                    {playlist.Songs && playlist.Songs.length > 0?(
                        <section className='playlistid-section3'>
                            <ul className="ul">
                                {playlist.Songs.map((item, index)=>{
                                    return(
                                        <li key={index} onClick={()=>setSongsPlaylistWithIndex(playlist.Songs, index)}
                                        className={musicPlayIndex == index ? 'playStyle' : ''}>
                                            <div className="left">
                                                <span className="index">{index + 1}</span>
                                                <img src={item.Cover} alt="cover"/>
                                                <p>{item.Name}</p>
                                            </div>
                                            <div className="right">
                                                {musicPlayIndex == index && isPlaying  ?(
                                                    <button onClick={(e)=>PauseMusic(index, e)}><FaPause/></button>
                                                ):(
                                                    <button><FaPlay/></button>
                                                )}
                                                
                                                {itsMine?(
                                                    <button onClick={(e)=>openRemove(index, e)}><IoMdClose/></button>
                                                    
                                                ):null}
                                            </div>
                                            < RemoveAudio isOpen={isOpenRemove} closeModal={closeRemove} playlistId={id} index={removeIndex}/>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    ):null}
                </div>
            </main>
        </>
    );
}




