import Modal from "../default";
import { query, collection, doc, where, getDoc, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { AuthContext } from "../../../contexts/AuthContexts";
import { useContext, useState, useEffect } from "react";
import "./saveAudio.css";
import { FaSpinner } from "react-icons/fa";
import Loading from "../../loading";

export default function SaveAudio({ isOpen, closeModal, audioId }) {
    const { userDetails } = useContext(AuthContext);
    const uid = userDetails.Uid;
    const [myPlaylist, setMyPlaylist] = useState([]);
    const [playlistWithAudio, setPlaylistWithAudio] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadingComponent, setLoadingComponent] = useState(true);

    async function getList() {
        const userDocRef = doc(db, 'Users', uid);
        const myQuery = query(collection(db, "Playlist"), where('UserId', '==', userDocRef));
        const querySnapshot = await getDocs(myQuery);
        const playlistArray = [];

        if (!querySnapshot.empty) {
            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();
                const songs = data.Songs || []; // Initialize with existing songs or empty array

                const playlistData = {
                    Name: data.Name,
                    Songs: songs,
                    Id: docSnapshot.id 
                };

                playlistArray.push(playlistData);
            }
        }
        setMyPlaylist(playlistArray);
    }

    useEffect(() => {
        getList();
        setLoadingComponent(false);
    }, []);

    useEffect(()=>{
        if (!isOpen){
            setPlaylistWithAudio([]);
        }
    },[closeModal]);

    function handleAddMusic(value, id) {
        if (value) {
            setPlaylistWithAudio((prevPlaylist) => [...prevPlaylist, id]);
        } else {
            setPlaylistWithAudio((prevPlaylist) => prevPlaylist.filter((item) => item !== id));
        }
    }

    async function handleSaveMusic(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const id = audioId.toString();

        if (playlistWithAudio.length === 0) {
            setError('Selecione uma playlist.');
        } else {
            try {
                const audioQuery = query(collection(db, "Songs"), where('Id', '==', id));
                const audioSnapshot = await getDocs(audioQuery);
                if (audioSnapshot.empty) {
                    setError('Áudio não encontrado.');
                } else {
                    const audioDocRef = audioSnapshot.docs[0].ref;

                    for (const playlistId of playlistWithAudio) {
                        const playlistRef = doc(db, "Playlist", playlistId);
                        const playlistDoc = await getDoc(playlistRef);
                        if (playlistDoc.exists()) {
                            const currentSongs = playlistDoc.data().Songs || [];
                            const updatedSongs = [...currentSongs, audioDocRef];

                            await updateDoc(playlistRef, {
                                Songs: updatedSongs
                            });
                        }
                    }
                    closeModal();
                }
            } catch (error) {
                setError('Erro ao adicionar música.');
            }
        }
        setLoading(false);
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            {loadingComponent?(
                <Loading/>
            ):(
                <form className="modal-default" onSubmit={handleSaveMusic}>
                    <h1>Playlists</h1>
                    <div className="modal-after-title">
                        {myPlaylist && myPlaylist.length > 0?(
                            <ul className="playlist-ul">
                                {myPlaylist.map((item) => (
                                    <li key={item.Id} className="playlist-li">
                                        <div className="playlist-details">
                                            {item.Songs.length > 0 && item.Songs[0].Cover ? (
                                                <img src={item.Songs[0].Cover} alt="capa" className="img" />
                                            ) : (
                                                <span className="img">{item.Name[0]}</span>
                                            )}
                                            <p>{item.Name}</p>
                                        </div>
                                        <label className="label-save">
                                            <input
                                                type="checkbox"
                                                checked={playlistWithAudio.includes(item.Id)}
                                                onChange={(e) => handleAddMusic(e.target.checked, item.Id)}
                                            />
                                            <span></span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ):(
                            <p>Nenhuma playlist encontrada :(</p>
                        )}

                    </div>
                    {error && <span className="card-error">{error}</span>}
                    <div className="modal-buttons">
                        {!loading ? (
                            <>
                                <button onClick={closeModal} type="reset">Cancelar</button>
                                {myPlaylist && myPlaylist.length > 0?(
                                    <button type="submit">Adicionar</button>
                                ):null}
                            </>
                        ) : (
                            <FaSpinner className="spinner" />
                        )}
                    </div>
                </form>
            )}
        </Modal>
    )
}
