import { useEffect, useState } from "react";
import Modal from "../default";
import { FaSpinner } from "react-icons/fa";
import {doc, updateDoc} from "firebase/firestore";
import { formatName } from "../../../services/format";
import {db} from "../../../services/firebase";
import { AuthContext } from "../../../contexts/AuthContexts";
import { useContext } from "react";

export default function EditProfile({isOpen, closeModal}){


    const [loading, setLoading] = useState (false);
    const [error, setError] = useState ("");
    const {userDetails} = useContext(AuthContext);

    const [nameInput, setNameInput] = useState (userDetails.Name);
    const [lastNameInput, setLastNameInput] = useState (userDetails.LastName);

    async function handleEdit(e) {
        e.preventDefault();
        setError('');

        if ( !nameInput || !lastNameInput){
            setError('Digite todos os campos.');
            return;
        }
        if (nameInput.includes(' ') || lastNameInput.includes(' ')){
            setError('Os campos não devem conter espaços.');
            return;
        }
        const userRef = doc(db, 'Users', userDetails.Uid);

        setLoading(true);

        await updateDoc(userRef,{
            Name:formatName(nameInput),
            LastName:formatName(lastNameInput)
        }).then(()=>{
            setError('');
            closeModal();
        }).catch((error)=>{
            setError('Erro ao editar informações.');
        }).finally(()=>{
            setLoading(false);
        })    
    }

    useEffect(()=>{
        if (!isOpen){
            setError('');
            setNameInput(userDetails.Name);
            setLastNameInput(userDetails.LastName);
        }
    },[closeModal]);

    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleEdit} >
                <h1 className="modal-title">Editar informações</h1>
                <div className="modal-after-title">
                    <label className="modal-label">
                        <span>Primeiro nome:</span>
                        <input type="text" placeholder="Digite seu primeiro nome" 
                        autoFocus={true}
                        value={nameInput}
                        onChange={(e)=>setNameInput(e.target.value)}/>
                    </label>

                    <label className="modal-label">
                        <span>Último nome:</span>
                        <input type="text" placeholder="Digite seu último nome" 
                        value={lastNameInput}
                        onChange={(e)=>setLastNameInput(e.target.value)}/>
                    </label>

                </div>
                {error !== '' && (
                    <span className="card-error">{error}</span>
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