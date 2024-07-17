import "./start.css";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import { AudioContext } from "../../contexts/AudioContexts";
import { useContext, useEffect, useRef, useState } from "react";
import { db } from "../../services/firebase";
import { query, collection, where, getDocs, getDoc, doc, limit, orderBy } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContexts";
import Loading from "../../components/loading";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";

export default function Start() {
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const { userDetails } = useContext(AuthContext);
    const { MusicComponente, getSongs } = useContext(AudioContext);
    const uid = userDetails.Uid;
    const optionsRef = useRef();
    const openOptionsRef = useRef();
    const playRef = useRef();
    const navigate = useNavigate();
    const [iniciante, setIniciante] = useState([]);
    const [basico, setBasico] = useState([]);
    const [intermediario, setIntermediario] = useState([]);
    const [intermediario2, setIntermediario2] = useState([]);
    const [avancado, setAvancado] = useState([]);
    const [proficiente, setProficiente] = useState([]);
    const [users, setUsers] = useState([]);
    const [lastSongs, setLastSongs] = useState([]);

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
    }

    async function getAllMusic() {
        const levels = ["Iniciante", "Básico", "Intermediário", "Intermediário Avançado", "Avançado", "Proficiente"];
        const setFunctions = [setIniciante, setBasico, setIntermediario, setIntermediario2, setAvancado, setProficiente];
    
        const queries = levels.map(level => query(collection(db, "Songs"), where("Level", "==", level)));
        const results = await Promise.all(queries.map(getDocs));
    
        results.forEach((result, index) => {
            if (!result.empty) {
                const list = [];
                for (let x = 0; x < result.docs.length && x < 10; x++) {
                    if (result.docs[x].data().Status === true) {
                        list.push(result.docs[x].data());
                    }
                }
                setFunctions[index](list);
            }
        });
    }

    async function getUser(){
        const getUser = collection(db, "Users");
        const findUser = await getDocs(getUser);
        let list = []
        if (!findUser.empty){
            for (let x = 0; x < findUser.docs.length && x < 10; x++) {
                list.push(findUser.docs[x].data());
            }
        }
        setUsers(list);
    }
    
    async function getLastSongs() {
        try {
            const q = query(
                collection(db, 'Songs'), 
                where('Status', '==', true),
                orderBy('Id', 'desc'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
    
            let list = [];
            querySnapshot.forEach((doc) => {
                list.push(doc.data());
            });
            setLastSongs(list);
        } catch (error) {
            console.error("Error fetching songs: ", error);
        }
    }
    
    function clickContainer(id) {
        return (e) => {
            if (!optionsRef.current?.contains(e.target) && !openOptionsRef.current?.contains(e.target) && !playRef.current?.contains(e.target)) {
                navigate(`/playlists/${id}`);
            }
        };
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
    

    useEffect(() => {
        try {
            getList();
            getAllMusic();
            getUser();
            getLastSongs();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    async function fetchAuthorNick(authorRef) {
        const authorDoc = await getDoc(authorRef);
        if (authorDoc.exists()) {
            return authorDoc.data().Nick;
        } else {
            console.error("Author document does not exist:", authorRef);
            return null;
        }
    }

    async function playMusic(songsArray, e) {
        e.stopPropagation();
        let toPlay = [];
    
        if (Array.isArray(songsArray)) {
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
        } else {
            const authorNick = await fetchAuthorNick(songsArray.Author);
            if (authorNick) {
                toPlay.push({
                    Audio: songsArray.Audio,
                    Name: songsArray.Name,
                    Author: authorNick,
                    Cover: songsArray.Cover,
                    Id: songsArray.Id
                });
                getSongs(toPlay, 0);
            }
        }
    }
    


    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Header />
            <MusicComponente />
            <main className="start-container">
                <div className="start-all">
                    <section className="start-section1">
                        <Perfil />
                    </section>
                    <section className="start-section2">
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
                                                    <button className="play" onClick={(e) => playMusic(item.Songs, e)} ref={playRef}><FaPlay /></button>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : null}
                        </article>
                    </section>
                    <section className="start-section3">
                        <h2>Níveis</h2>
                        <Carousel responsive={responsive}>
                            {iniciante && iniciante.length > 0 ? (
                                <div className="level-container">
                                    <img src={iniciante[iniciante.length - 1].Cover} alt="capa" />
                                    <p>{iniciante[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(iniciante, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                            {basico && basico.length > 0 ? (
                                <div className="level-container">
                                    <img src={basico[basico.length - 1].Cover} alt="capa" />
                                    <p>{basico[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(basico, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                            {intermediario && intermediario.length > 0 ? (
                                <div className="level-container">
                                    <img src={intermediario[intermediario.length - 1].Cover} alt="capa" />
                                    <p>{intermediario[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(intermediario, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                            {intermediario2 && intermediario2.length > 0 ? (
                                <div className="level-container">
                                    <img src={intermediario2[intermediario2.length - 1].Cover} alt="capa" />
                                    <p>{intermediario2[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(intermediario2, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                            {avancado && avancado.length > 0 ? (
                                <div className="level-container">
                                    <img src={avancado[avancado.length - 1].Cover} alt="capa" />
                                    <p>{avancado[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(avancado, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                            {proficiente && proficiente.length > 0 ? (
                                <div className="level-container">
                                    <img src={proficiente[proficiente.length - 1].Cover} alt="capa" />
                                    <p>{proficiente[0].Level}</p>
                                    <button className="play" onClick={(e)=>playMusic(proficiente, e)}><FaPlay /></button>
                                </div>
                            ) : null}
                        </Carousel>
                    </section>

                    {users && users.length > 0?(
                        <section className="start-section4">
                            <h2>Usuários</h2>
                            <Carousel responsive={responsive}>  
                                    {users.map((item, index)=>{
                                        return(
                                            <Link key={index} className="card-container" to={`/user/${item.Nick}`}>
                                                {item.Avatar !== null?(
                                                    <img src={item.Avatar} alt="user foto" className="img"/>
                                                ):(
                                                    <span  className="img">{item.Name[0]}{item.LastName[0]}</span>
                                                )}
                                                <div className="infos">
                                                    <p className="name">{item.Name} {item.LastName}</p>
                                                    <p>{item.Nick}</p>
                                                </div>
                                            </Link >
                                        )
                                    })}
                            </Carousel>
                        </section>
                    ):null}
                    
                    {lastSongs && lastSongs.length > 0?(
                        <section className="start-section5">
                            <h2>Últimos áudios</h2>
                            <Carousel responsive={responsive}>
                                {lastSongs.map((item, index)=>{
                                    return(
                                        <div key={index} className="container-last-songs">
                                            {item.Cover?(
                                                <img src={item.Cover} alt="cover"/>
                                            ):null}
                                            <div>
                                                <p>{item.Name}</p>
                                                <p>{item.Level}</p>
                                                <button className="play" onClick={(e)=>playMusic(item, e)}><FaPlay /></button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </Carousel>
                        </section>
                    ):null}
                </div>
            </main>
        </>
    );
}
