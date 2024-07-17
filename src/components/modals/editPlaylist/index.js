import { useEffect, useRef, useState } from "react"
import Modal from "../default"
import { FaSpinner } from "react-icons/fa";
import {db} from "../../../services/firebase";
import { query, collection, where, getDocs, getDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

export default function DeletePlaylist({isOpen, closeModal, playlistId}){
    const [loading, setLoading] = useState (false);
    const [error, setError] = useState('');
    const [sucess, setSucess] = useState('');
    const inputEdit = useRef();

    async function handleEdit(e){
        e.preventDefault();
        setError('');
        setSucess('');

        if (inputEdit.current?.value === ''){
            setError('Digite o nome da playlist');
            return;
        }

        if (inputEdit.current?.value.includes(' ')){
            setError('O nome da playlist não pode conter espaços em branco.');
            return;
        }

        setLoading(true);
        const q = query(collection(db, "Playlist"), 
        where("Id", "==",  playlistId),);
        const querySnapshot = await getDocs(q);


        const newName = inputEdit.current?.value
        if (!querySnapshot.empty){
            try{
                const getId = querySnapshot.docs[0].ref; 
                await updateDoc(getId,{
                    Name:newName
                });
                setSucess('Playlist editada');
                setTimeout(()=>{
                    closeModal();
                },200);
            }catch{
                setError('Erro ao editar playlist');
            }
        }else{
            setError('Erro ao editar playlist');
        }
        setLoading(false);
    }

    useEffect(()=>{
        if (!isOpen){
            setError('');
            setSucess('');
        }
    },[closeModal]);


    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleEdit} >
                <h1 className="modal-title">Editar playlist</h1>
                <div className="modal-after-title">
                    <label className="modal-label">
                        <span>Editar nome:</span>
                        <input type="text" placeholder="Digite seu último nome" ref={inputEdit}/>
                    </label>
                </div>
                {error !== '' && (
                    <span className="card-error">{error}</span>
                    )}
                    {sucess !== '' && (
                    <span className="card-sucess">{sucess}</span>
                )}
                <div className="modal-buttons">
                    {!loading?(
                        <>
                            <button onClick={closeModal}type="reset">Cancelar</button>
                            <button type="submit">Editar</button>
                        </>
                    ):(
                        <FaSpinner className="spinner" />
                    )}
                </div>
            </form>
        </Modal>
    )
}