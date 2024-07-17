import { useEffect, useState, useContext, useRef } from "react";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import "./search.css";
import { IoMdSearch } from "react-icons/io";
import { db } from "../../services/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link, useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import  {AudioContext} from "../../contexts/AudioContexts";
import Loading from "../../components/loading";


export default function Search(){
    const [indexOptions, setIndexOptions] = useState(0);
    const [input, setInput] = useState('');
    const [songs, setSongs] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const {getSongs, MusicComponente} = useContext(AudioContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    async function getItens (){
        switch (indexOptions){
            case 0:{
                getAudios();
                getAuthors();
                getPlaylist();
                break;
            }
            case 1:{
                getAudios();
                break;
            }
            case 2:{
                getAuthors();
                break;
            }
            case 3:{
                getPlaylist();
                break
            }
        }
    }

    async function getAudios() {
        try {
            const audioCollection = collection(db, "Songs");
            const querySnapshot = await getDocs(audioCollection);
    
            const matchingAudios = [];
    
            for (const docSnap of querySnapshot.docs) {
                const audioData = docSnap.data();
                
                if (audioData.Name && audioData.Name.toLowerCase().includes(input.toLowerCase()) && audioData.Status === true) {
                    let user = {};
                    if (audioData.Author) {
                        const userDoc = await getDoc(audioData.Author); 
                        if (userDoc.exists()) {
                            user = userDoc.data();
                        } else {
                            console.log('User does not exist');
                        }
                    }
    
                    const data = {
                        Audio:audioData.Audio,
                        Cover:audioData.Cover,
                        Id:audioData.Id,
                        Level:audioData.Level,
                        Name:audioData.Name,
                        Author:user
                    };
                    matchingAudios.push(data);
                }
            }
    
            setSongs(matchingAudios);
        } catch (error) {
            console.error("Erro ao buscar audios:", error);
            return [];
        }
    }

    async function getAuthors() {
        try {
            const usersCollection = collection(db, "Users");
            const querySnapshot = await getDocs(usersCollection);
    
            const matchingUsers = [];
    
            for (const docSnap of querySnapshot.docs) {
                const userData = docSnap.data();

                if (userData.Nick && userData.Nick.toLowerCase().includes(input.toLowerCase())||
                    userData.Name && userData.Name.toLowerCase().includes(input.toLowerCase()) ||
                    userData.LastName && userData.LastName.toLowerCase().includes(input.toLowerCase())
                ) {
                    const data = {
                        Name:userData.Name,
                        LastName:userData.LastName,
                        Avatar:userData.Avatar || null,
                        Nick:userData.Nick
                    };
                    matchingUsers.push(data);
                }
            }
    
            setAuthors(matchingUsers);
        } catch (error) {
            console.error("Erro ao buscar Usuários:", error);
            return [];
        }
    }

    async function getPlaylist() {
        try {
            const playlistsCollection = collection(db, "Playlist");
            const querySnapshot = await getDocs(playlistsCollection);
    
            const matchingPlaylists = [];
    
            for (const docSnap of querySnapshot.docs) {
                const playlistData = docSnap.data();
    
                if (playlistData.Name && playlistData.Name.toLowerCase().includes(input.toLowerCase())) {
                    const songs = [];
                    if (playlistData.Songs) {
                        for (const songRef of playlistData.Songs) {
                            const songDoc = await getDoc(songRef);
                            if (songDoc.exists()) {
                                songs.push(songDoc.data());
                            }
                        }
                    }
    
                    let user = {};
                    if (playlistData.UserId) {
                        const userDoc = await getDoc(playlistData.UserId);  
                        if (userDoc.exists()) {
                            user = userDoc.data();
                        } else {
                            console.log('User does not exist');
                        }
                    }
    
                    const data = {
                        Name: playlistData.Name,
                        Id: playlistData.Id,
                        UserId: user,
                        Songs: songs
                    };
                    matchingPlaylists.push(data);
                }
            }
    
            setPlaylists(matchingPlaylists);
        } catch (error) {
            console.error("Erro ao buscar playlists:", error);
            return [];
        }
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
    

    function navigatePlaylist(id){
        if (id){
            navigate(`/playlists/${id}`)
        }
    }

    async function fetchAuthorNick(authorRef) {
        const authorDoc = await getDoc(authorRef);
        if (authorDoc.exists()) {
            return authorDoc.data().Nick;
        } else {
            console.error("Author document does not exist:", authorRef);
            return null;
        }
    }

    async function playSingsMusic(id, name, audio, author, cover){
        const data = [{
            Audio: audio,
            Name:name,
            Author:author.Nick,
            Cover: cover,
            Id: id
        }]

        if (data){
            getSongs(data, 0);
        }else{
            return;
        }
    }

    async function playMusic(songsArray, e){
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

    useEffect(()=>{
        getItens();
        setLoading(false);
        setTimeout(()=>{
            inputRef.current?.focus();
        },1000)
        
    },[]);

    useEffect(()=>{
        getItens();
    },[input, setInput]);


    if (loading){
        return <Loading/>
    }

    return(
        <>
            <Header/>
            <MusicComponente/>
            <main className="search-container">
                <div className="search-all">
                    <section className="search-section1">
                        <label className="label-search">
                            <IoMdSearch/>
                            <input type="text" 
                            value={input}
                            onChange={(e)=>setInput(e.target.value)}
                            className="input-search" 
                            placeholder="O que você quer escutar?"
                            ref={inputRef}/>
                        </label> 
                        <Perfil/>
                    </section>

                    <section className="search-section2">
                        <button className={indexOptions === 0 ? 'buttonSelected' : ''}onClick={()=>setIndexOptions(0)}>Todos</button>
                        <button className={indexOptions === 1 ? 'buttonSelected' : ''}onClick={()=>setIndexOptions(1)}>Áudios</button>
                        <button className={indexOptions === 2 ? 'buttonSelected' : ''}onClick={()=>setIndexOptions(2)}>Usuários</button>
                        <button className={indexOptions === 3 ? 'buttonSelected' : ''}onClick={()=>setIndexOptions(3)}>Playlists</button>
                    </section>

                    {indexOptions === 0 || indexOptions === 1 ?(
                        <section className="search-section-songs">
                            <h2>Áudios</h2>
                            {songs && songs.length > 0 ?(
                                <Carousel responsive={responsive}>
                                    {songs.map((item, index)=>{
                                        return(
                                            <div className="card-container" key={index}
                                            onClick={()=>playSingsMusic(item.Id, item.Name, item.Audio, item.Author, item.Cover)}>
                                                {item.Cover?(
                                                    <img src={item.Cover} alt="capa" className="img"/>
                                                ):(
                                                    item.Name?(
                                                        <span className="img">
                                                            {item.Name[0]}
                                                        </span>
                                                    ):null
                                                )}
                                                    <div>
                                                        <p className="name">{item.Name}</p>
                                                        <p className="author">{item.Level}</p>
                                                        {item.Author.Nick?(
                                                            <p className="author">{item.Author.Nick}</p>
                                                        ):null}
                                                    </div>
                                            </div>
                                        )
                                    })}
                                </Carousel>
                            ):(
                                <div className="no-result">
                                    <p>Nenhum áudio corresponde à sua pesquisa:</p><b>{input}</b>
                                </div>
                            )}
                        </section>
                    ) :null}
                    
                    {indexOptions === 0 || indexOptions === 2 ?(
                        <section className="search-section-authors">
                            <h2>Usuários</h2>
                            {authors && authors.length > 0?(
                                <Carousel responsive={responsive}>
                                    {authors.map((item, index)=>{
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
                            ):(
                                <div className="no-result">
                                    <p>Nenhum author corresponde à sua pesquisa:</p><b>{input}</b>
                                </div>
                            )}
                        </section>
                    ) :null}

                    {indexOptions === 0 || indexOptions === 3 ?(
                        <section className="search-section-playlist">   
                            <h2>Playlists</h2>
                            {playlists && playlists.length > 0?(
                                <Carousel responsive={responsive}>
                                    {playlists.map((item, index)=>{
                                        return(
                                            <div className="card-container" onClick={()=>navigatePlaylist(item.Id)} key={index}>
                                                {item.Songs && item.Songs.length > 0 ?(
                                                    <img src={item.Songs[0].Cover} alt="cover"  className="img"/>
                                                ):( 
                                                    item.Name?(
                                                        <span className="img">{item.Name[0]}</span>
                                                    ):null
                                                )}
                                                <div>
                                                    <p className="name">{item.Name}</p>
                                                    {item.UserId.Nick ?(
                                                        <p className="author">{item.UserId.Nick}</p>
                                                    ):null}
                                                </div>
                                                {item.Songs && item.Songs.length > 0 ?(
                                                    <button className="playMusic" onClick={(e)=>playMusic(item.Songs, e)}><FaPlay/></button>
                                                ):null}
                                                
                                            </div>
                                        )
                                    })}
                                </Carousel>
                            ):(
                                <div className="no-result">
                                    <p>Nenhuma playlist corresponde à sua pesquisa:</p><b>{input}</b>
                                </div>
                                
                            )}
                        </section>
                    ) :null}                    
                </div>
            </main>
        </>
    )
}