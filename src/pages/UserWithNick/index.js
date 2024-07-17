import { useContext, useEffect, useState } from "react";
import { query, collection, where, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { AudioContext } from "../../contexts/AudioContexts";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import Loading from "../../components/loading";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaPlay } from "react-icons/fa";
import "./userWithNick.css";
import { useNavigate, useParams } from "react-router-dom";

export default function UserWithNick() {
    const { getSongs, MusicComponente, closeSave } = useContext(AudioContext);
    const [userInfos, setUserInfos] = useState({});
    const [playlists, setPlaylists] = useState([{}]);
    const [loading, setLoading] = useState(true);
    const [userSongs, setUserSongs] = useState([]);
    const navigate = useNavigate();

    const { nick } = useParams();

    async function getUser() {
        try {
            const userCollection = query(collection(db, "Users"), where("Nick", '==', nick));
            const querySnapshot = await getDocs(userCollection);

            if (!querySnapshot.empty) {
                const getUser = querySnapshot.docs[0];
                const user = getUser.data();
                const data = {
                    Name: user.Name,
                    LastName: user.LastName,
                    Avatar: user.Avatar || null,
                    Nick: user.Nick
                };
                setUserInfos(data);
                await getList(getUser.ref);
                await getMusicCreated(getUser.ref);
            } else {
                navigate('/start');
            }

        } catch (error) {
            console.error("Erro ao buscar users:", error);
            return [];
        }
    }

    async function getList(userRef) {
        const myQuery = query(collection(db, "Playlist"), where('UserId', '==', userRef));
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
                    Songs: songs,
                    Id: data.Id
                };

                playlistArray.push(playlistData);
            }
        }

        setPlaylists(playlistArray);
        setLoading(false);
    }


    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 1960, min: 1366 },
            items: 8
        },
        desktop: {
            breakpoint: { max: 1366, min: 768 },
            items: 5
        },
        tablet: {
            breakpoint: { max: 768, min: 600 },
            items: 3
        },
        mobile: {
            breakpoint: { max: 600, min: 0 },
            items: 2
        }
    };

    async function getMusicCreated(userRef) {
        const q = query(collection(db, "Songs"), where('Author', '==', userRef));
        const querySnapshot = await getDocs(q);

        let songs = [];
        if (!querySnapshot.empty) {

            querySnapshot.docs.forEach((item) => {
                if (item.data().Status === true) {
                    songs.push(item.data());
                }
            });
            setUserSongs(songs);
        }
    }

    useEffect(() => {
        getUser();
    }, [closeSave]);

    async function fetchAuthorNick(authorRef) {
        const authorDoc = await getDoc(authorRef);
        if (authorDoc.exists()) {
            return authorDoc.data().Nick;
        } else {
            console.error("Author document does not exist:", authorRef);
            return null;
        }
    }

    async function setSongsPlaylist(songsArray, e) {
        e.stopPropagation();
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

    function setSongs(audio, name, author, cover, id) {
        const toPlay = [{
            Audio: audio,
            Name: name,
            Author: userInfos.Nick,
            Cover: cover,
            Id: id
        }];
        getSongs(toPlay, 0);
    }

    function navigatePlaylist(id) {
        const idString = id.toString();
        navigate(`/playlists/${idString}`)
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Header />
            <MusicComponente />
            <main className="user-container">
                <div className="user-all">
                    <section className="user-section1">
                        <Perfil />
                    </section>

                    <section className="user-section2">
                        <article className="user-img-nick">
                            {userInfos.Avatar ? (
                                <img src={userInfos.Avatar} alt="Foto de perfil" className="user-imgArea" />
                            ) : (
                                <span className="user-imgArea">
                                    {userInfos.Name[0]}
                                    {userInfos.LastName[0]}
                                </span>
                            )}
                            <div>
                                <h2>{userInfos.Nick}</h2>
                                <p>Playlist: {playlists.length}</p>
                            </div>
                        </article>
                    </section>

                    {playlists.length > 0 ? (
                        <section className="user-section3">
                            <h1>Playlists</h1>
                            <Carousel responsive={responsive}>
                                {playlists.map((item, index) => {
                                    return (
                                        <div className="playlist" key={index} onClick={() => navigatePlaylist(item.Id)}>
                                            {item.Songs.length > 0 ? (
                                                <img src={item.Songs[0].Cover} alt="Musica capa" className="img" />
                                            ) : (
                                                <span className="img">{item.Name[0]}</span>
                                            )}
                                            <div className="data">
                                                <p>{item.Name}</p>
                                                <p>Músicas: {item.Songs.length}</p>
                                            </div>
                                            {item.Songs.length > 0 ? (
                                                <button className="play"
                                                    onClick={(e) => setSongsPlaylist(item.Songs, e)}><FaPlay /></button>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </Carousel>
                        </section>
                    ) : null}

                    {userSongs && userSongs.length > 0 ? (
                        <section className="user-section4">
                            <h2>Àudios</h2>
                            <article className="audio-area">
                                <Carousel responsive={responsive}>
                                    {userSongs.map((item, index) => {
                                        return (
                                            <div key={index} className="audio" onClick={() => setSongs(item.Audio, item.Name, item.Author, item.Cover, item.Id)}>
                                                <img src={item.Cover} alt="capa" />
                                                <div className="legends">
                                                    <p>{item.Name}</p>
                                                    <span>{item.Level}</span>
                                                </div>
                                                <button className="play"><FaPlay /></button>
                                            </div>
                                        )
                                    })}
                                </Carousel>
                            </article>
                        </section>
                    ) : null}
                </div>
            </main>
        </>
    );
}
