import "./header.css";
import { Link } from "react-router-dom";
import { GoHomeFill, GoSearch } from "react-icons/go";
import { LuLibrary } from "react-icons/lu";
import { useLocation } from 'react-router-dom';
import { MdCreateNewFolder } from "react-icons/md";
import NewPlayList from "../modals/newplaylist";
import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { doc, getDocs, query, where, collection, getDoc } from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContexts";
import Loading from "../loading";

export default function Header() {
    const location = useLocation();
    const path = location.pathname;
    const [isOpen, setIsOpen] = useState(false);
    const { userDetails } = useContext(AuthContext);
    const uid = userDetails.Uid;
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        getList();
    }, [openModal, isOpen]);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <header className="header-main">
                <nav className="header-nav">
                    <Link to="/start" className={`${path === '/start' ? 'inPage' : ''}`}>
                        <GoHomeFill />
                    </Link>
                    <Link to="/search" className={`${path === '/search' ? 'inPage' : ''}`}>
                        <GoSearch />
                    </Link>
                    <Link to="/playlists" className={`${path === '/playlists' ? 'inPage' : ''}`}>
                        <LuLibrary />
                    </Link>
                    <div className="playlistArea">
                        <button onClick={openModal}><MdCreateNewFolder /></button>
                        {playlists.length > 0 ? (
                            playlists.map((playlist, index) => (
                                <div key={index} className="playlist" >
                                    <Link className="name" to={`/playlists/${playlist.Id}`}>{playlist.Name}</Link>
                                    {playlist.Songs.length > 0 ?(
                                        <img src={playlist.Songs[0].Cover} alt={playlist.Name} />
                                    ):
                                        <div className="noCover" to={`/playlists/${playlist.Id}`}>
                                            <span>
                                                {playlist.Name[0]}
                                            </span>
                                        </div>
                                    }
                                </div>
                            ))
                        ) : null}
                    </div>
                </nav>
            </header>
            <span className="break-line"></span>
            <NewPlayList isOpen={isOpen} closeModal={closeModal} />
        </>
    );
}
