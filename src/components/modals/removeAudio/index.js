import Modal from "../default";
import { query, collection, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useEffect, useState } from "react";
import "./removeAudio.css";
import { FaSpinner } from "react-icons/fa";

export default function RemoveAudio({ isOpen, closeModal, playlistId, index }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSaveMusic(e) {
        e.preventDefault();
        setLoading(true);
        setError("");


        try {
            const myQuery = query(collection(db, "Playlist"), where('Id', '==',playlistId));
            const querySnapshot = await getDocs(myQuery);

            if (!querySnapshot.empty) {
                const firstDoc = querySnapshot.docs[0];
                const playlistData = firstDoc.data();

                let songs = [];

                if (playlistData.Songs) {
                    for (let x = 0; x < playlistData.Songs.length; x++) {
                        if (x !== index) {
                            songs.push(playlistData.Songs[x]);
                        }
                    }
                }
                await updateDoc(firstDoc.ref, {
                    Songs: songs
                });
                closeModal();
            } else {
                setError("Playlist não encontrada.");
            }
        } catch (error) {
            setError("Erro ao remover o áudio");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if (!isOpen){
            setError('');
        }
    },[closeModal]);

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleSaveMusic}>
                <h1>Remover áudio</h1>
                <div className="modal-after-title">
                    <p>Deseja remover esse áudio de sua playlist?</p>
                </div>
                {error && <span className="card-error">{error}</span>}
                <div className="modal-buttons">
                    {!loading ? (
                        <>
                            <button onClick={closeModal} type="reset">Cancelar</button>
                            <button type="submit">Remover</button>
                        </>
                    ) : (
                        <FaSpinner className="spinner" />
                    )}
                </div>
            </form>
        </Modal>
    )
}
