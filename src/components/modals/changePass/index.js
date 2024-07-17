import { useEffect, useRef, useState } from "react";
import Modal from "../default";
import { FaSpinner } from "react-icons/fa";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth} from "../../../services/firebase";
import zxcvbn from 'zxcvbn';
import { AuthContext } from "../../../contexts/AuthContexts";
import { useContext } from "react";


export default function ChangePass({isOpen, closeModal}){
    const oldPassRef = useRef();
    const newPassRef = useRef();
    const [loading, setLoading] = useState (false);
    const [error, setError] = useState ("");
    const {signOut} = useContext(AuthContext);

    async function handleChangePassword(e) {
        e.preventDefault();
        
        setError('');
        const oldPass = oldPassRef.current?.value;
        const newPass = newPassRef.current?.value;

        if (!oldPass || !newPass){
            setError('Digite todos os campos.');
            return; 
        }

        if (zxcvbn(newPass).score < 3) {
            setError('A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.');
            return;
        }
        setLoading(true);

        const user = auth.currentUser;
        if (user) {
            const credential = EmailAuthProvider.credential(user.email, oldPass);
            try {
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPass);
                setError('');
                closeModal();
                signOut();
            } catch (error) {
                setError('Erro ao alterar a senha.');
            }finally{
                setLoading(false);
            }
        } else {
            setError('Erro ao alterar a senha.');
            setLoading(false);
        }
    }

    useEffect(()=>{
        if (!isOpen){
            setError('');
        }
    },[closeModal]);

    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleChangePassword}>
                <h1 className="modal-title">Alterar senha</h1>
                <div className="modal-after-title">
                        <label className="modal-label">
                            <span>Senha antiga</span>
                            <input type="text" placeholder="Digite sua antiga senha" ref={oldPassRef} autoFocus={true}/>
                        </label>
                        <label className="modal-label">
                            <span>Sua nova senha:</span>
                            <input type="text" placeholder="Digite sua nova senha" ref={newPassRef}/>
                        </label>
                </div>
                {error !== '' && (
                    <span className="card-error">{error}</span>
                    )}
                <div className="modal-buttons">
                    {!loading?(
                        <>
                            <button onClick={closeModal}type="reset">Cancelar</button>
                            <button type="submit">Alterar</button>
                        </>
                    ):(
                        <FaSpinner className="spinner" />
                    )}
                </div>
            </form>
        </Modal>
    )
}