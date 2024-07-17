import { useContext, useEffect, useRef, useState } from "react";
import { query, collection, where, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../contexts/AuthContexts";
import { AudioContext } from "../../contexts/AudioContexts";
import Header from "../../components/header";
import Perfil from "../../components/perfil";
import Loading from "../../components/loading";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import AddPhotoAndNick from "../../components/modals/addPhotoAndNick";
import { FaPlay } from "react-icons/fa";
import "./user.css";
import { useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import DeletePlaylist from "../../components/modals/deletePlaylist";
import EditPlaylist from "../../components/modals/editPlaylist";


export default function User() {
    const { userDetails } = useContext(AuthContext);
    const { getSongs, MusicComponente, closeSave } = useContext(AudioContext);
    const [userInfos, setUserInfos] = useState(userDetails);
    const [playlists, setPlaylists] = useState([{}]);
    const [loading, setLoading] = useState(true);
    const uid = userDetails.Uid;
    const [isOpenPhoto, setIsOpenPhoto] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);
    const [mySongsInAnalyze, setMySongsInAnalyze] = useState ([]);
    const [mySongsApproved, setMySongsApproved] = useState ([]);
    const [indexOptionsEdit, setIndexOptionsEdit] = useState(null);
    const optionRef = useRef(null);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [playlistId, setPlaylistId] = useState('');

    const navigate =  useNavigate();

    function openModalPhoto() {
        setIsOpenPhoto(true);
    }

    function closeModalPhoto() {
        setIsOpenPhoto(false);
        setModalClosed(prev => !prev);
    }

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
                    Songs: songs,
                    Id:data.Id
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

    async function getMusicCreated(){
        const useRef = doc(db, "Users", userInfos.Uid);
        const q = query(collection(db, "Songs"), where('Author', '==', useRef));
        const querySnapshot = await getDocs(q);

        let analyze = [];
        let approved = [];
        if (!querySnapshot.empty){
            querySnapshot.docs.forEach((item)=>{
                if (item.data().Status === null){
                    analyze.push(item.data());
                }else if (item.data().Status === true){
                    approved.push(item.data());
                }
            });
            setMySongsApproved(approved);
            setMySongsInAnalyze(analyze);
        }
    }
    useEffect(() => {
        getList();
        getMusicCreated();
    }, [closeSave,  closeModalEdit]);

    async function getInfos() {
        const docRef = doc(db, "Users", userDetails.Uid);
        await getDoc(docRef).then(async(value)=>{
            let data = ({
                Email:value.data().Email,
                Name:value.data().Name,
                LastName:value.data().LastName,
                Uid:value.data().Uid,
                Avatar:value.data().Avatar,
                Nick:value.data().Nick
            });
            setUserInfos(data);
        }).catch((error)=>{
            console.log('Erro ao obter dados.');
        });     
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
    

    function setSongs(audio, name, author, cover, id){
        const toPlay = [{
            Audio:audio,
            Name:name,
            Author:userInfos.Nick,
            Cover:cover,
            Id:id
        }]
        getSongs(toPlay, 0);
    }


    useEffect(() => {
        getInfos();
    }, [modalClosed]);

    function openMoreOptions(index, e) {
        e.stopPropagation();
        setIndexOptionsEdit(index);
    
        function monitorEvent(e) {
            if (!optionRef.current?.contains(e.target)) {
                setIndexOptionsEdit(null);
                document.removeEventListener('click', monitorEvent);
            }
        }
    
        document.addEventListener('click', monitorEvent);
    }
    

    function navigatePlaylist(id){
        navigate(`/playlists/${id}`)
    }

    function closeModalEdit(){
        setPlaylistId('');
        setIndexOptionsEdit(null);
        setIsOpenEdit(false);
    }
    
    function openModalEdit(id, e){
        e.stopPropagation();
        setPlaylistId(id);
        setIsOpenEdit(true);
    }

    function closeModalDelete(){
        setPlaylistId('');
        setIndexOptionsEdit(null);
        setIsOpenDelete(false);
    }
    
    function openModalDelete(id, e){
        e.stopPropagation();
        setPlaylistId(id);
        setIsOpenDelete(true);
    }


    if (loading) {
        return <Loading />;
    }


    return (
        <>
            <Header />
            <MusicComponente/>
            <main className="user-container">
                <div className="user-all">
                    <section className="user-section1">
                        <Perfil />
                    </section>

                    <section className="user-section2">
                        <article className="user-img-nick">
                            {userInfos.Avatar ? (
                                <img src={userInfos.Avatar} alt="Foto de perfil" className="user-imgArea" onClick={openModalPhoto} />
                            ) : (
                                <span className="user-imgArea" onClick={openModalPhoto}>
                                    {userInfos.Name[0]}
                                    {userInfos.LastName[0]}
                                </span>
                            )}
                            <div>
                                <h2>{userInfos.Nick}</h2>
                                <p>Playlist: {playlists.length}</p>
                            </div>
                        </article>
                        <button onClick={openModalPhoto}>Edit</button>
                        <AddPhotoAndNick isOpen={isOpenPhoto} closeModal={closeModalPhoto} />
                    </section>
                    
                    {playlists.length >0 ?(
                        <section className="user-section3">
                            <h1>Playlists</h1>
                            <Carousel responsive={responsive}>
                                {playlists.map((item, index)=>{
                                    return(
                                        <div className="playlist" key={index} onClick={()=>navigatePlaylist(item.Id)}>
                                            {item.Songs.length > 0 ?(
                                                <img src={item.Songs[0].Cover} alt="Musica capa" className="img"/>
                                            ):(
                                                <span className="img">{item.Name[0]}</span>
                                            )}  
                                            <div className="data">
                                                <p>{item.Name}</p>
                                                <p>Músicas: {item.Songs.length}</p>
                                            </div>
                                            {item.Songs.length > 0 ?(
                                                <button className="play"
                                                onClick={(e)=>setSongsPlaylist(item.Songs, e)}><FaPlay/></button>
                                            ):null}

                                            <button className="options" onClick={(e)=>openMoreOptions(index, e)}><HiDotsVertical/></button>
                                            {indexOptionsEdit === index?(

                                                <span className="extendOptions" ref={optionRef}>
                                                    <button onClick={(e)=>openModalEdit(item.Id,e)}>Editar</button>
                                                    <button onClick={(e)=>openModalDelete(item.Id,e)}>Deletar</button>
                                                </span>
                                            ):null}
                                        </div>
                                    )
                                })}
                            </Carousel>
                        </section>
                    ):null}
                    <EditPlaylist isOpen={isOpenEdit} closeModal={closeModalEdit} playlistId={playlistId} />
                    <DeletePlaylist Playlist isOpen={isOpenDelete} closeModal={closeModalDelete} playlistId={playlistId} />


                    {mySongsApproved.length > 0 || mySongsInAnalyze. length > 0 ?(
                        <section className="user-section4">
                            <h2>Meus áudios</h2>
                            {mySongsApproved.length > 0 ?(
                                <article className="audio-area">
                                    <h3>Áudios aprovados</h3>
                                    <Carousel responsive={responsive}>
                                        {mySongsApproved.map((item, index)=>{
                                            return(
                                                <div key={index} className="audio" onClick={()=>setSongs(item.Audio,item.Name, item.Author, item.Cover, item.Id)}>
                                                    <img src={item.Cover} alt="capa"/>
                                                    <div className="legends">
                                                        <p>{item.Name}</p>
                                                        <span>{item.Level}</span>
                                                    </div>
                                                    <button className="play"><FaPlay/></button>
                                                </div>
                                            )
                                        })}
                                    </Carousel>
                                </article>
                            ):null}

                            {mySongsInAnalyze.length > 0 ?(
                                <article className="audio-area">
                                    <h3>Áudios em análise</h3>
                                    <Carousel responsive={responsive}>
                                        {mySongsInAnalyze.map((item, index)=>{
                                            return(
                                                <div key={index} className="audio"  onClick={()=>setSongs(item.Audio,item.Name, item.Author, item.Cover, item.Id)}>
                                                    <img src={item.Cover} alt="capa"/>
                                                    <div className="legends">
                                                        <p>{item.Name}</p>
                                                        <span>{item.Level}</span>
                                                    </div>
                                                    <button className="play"><FaPlay/></button>
                                                </div>
                                            )
                                        })}
                                    </Carousel>
                                </article>
                            ):null}
                        </section>
                    ):null}
                </div>
            </main>
        </>
    );
}
