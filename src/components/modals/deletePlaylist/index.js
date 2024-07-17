import { useState, useEffect } from "react"
import Modal from "../default"
import { FaSpinner } from "react-icons/fa";
import {db} from "../../../services/firebase";
import { query, collection, where, getDocs, getDoc, doc, deleteDoc } from "firebase/firestore";

export default function DeletePlaylist({isOpen, closeModal, playlistId}){
    const [loading, setLoading] = useState (false);
    const [error, setError] = useState('');

    async function handleDelete(e){
        e.preventDefault();
        setLoading(true);
        setError('');
        const id = playlistId.toString()
        const q = query(collection(db, "Playlist"), 
        where("Id", "==",  id),);
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty){
            try{
                const getId = querySnapshot.docs[0].ref; 
                await deleteDoc(getId);
                closeModal();
            }catch{
                setError('Erro ao deletar playlist');
            }
        }else{
            setError('Erro ao deletar playlist');
        }
        setLoading(false);
    }

    useEffect(()=>{
        if (!isOpen){
            setError('');
        }
    },[closeModal]);

    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleDelete} >
                <h1 className="modal-title">Deletar playlist</h1>
                <div className="modal-after-title">
                    <p>Gostaria de deletar sua playlist?</p>
                </div>
                {error !== '' && (
                    <span className="card-error">{error}</span>
                    )}
                <div className="modal-buttons">
                    {!loading?(
                        <>
                            <button onClick={closeModal}type="reset">Cancelar</button>
                            <button type="submit">Deletar</button>
                        </>
                    ):(
                        <FaSpinner className="spinner" />
                    )}
                </div>
            </form>
        </Modal>
    )
}