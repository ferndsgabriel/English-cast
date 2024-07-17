import Modal from  "../default";
import { AuthContext } from "../../../contexts/AuthContexts";
import { useContext, useState, useEffect } from "react";
import "./addPhotoAndNick.css";
import { FaTrash } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import {db} from "../../../services/firebase";
import { doc, getDocs, query, collection, where, updateDoc } from "firebase/firestore";
import uploadFileToStorage from "../../../services/firebaseUpload";
import deleteFileFromStorage from "../../../services/firebaseDeleteFile"


export default function AddPhotoAndNick({isOpen, closeModal}){
    const {userDetails} = useContext (AuthContext); 
    const [nick, setNick] = useState(userDetails.Nick);
    const [img, setImg] = useState (userDetails.Avatar);
    const [fileSend, setFileSend] = useState(null);
    const [error, setError] = useState ('');
    const [loading, setLoading] = useState(false);

    function handleImageChange (e) {
        const file = e.target.files[0];
        setFileSend(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        };
    };

    async function handleSave(e){
        e.preventDefault();
        setError('');
        if (nick === ''){
            setError('Digite um nickname');
            return
        }
        const q = query(collection(db, "Users"), 
        where("Nick", "==", nick),);
        setLoading(true);
        try{
            const querySnapshot = await getDocs(q);
            const nickExists = querySnapshot.docs.some(doc => doc.data().Uid !== userDetails.Uid);
            if (nickExists) {
                setError('Nickname já está em uso');
                return;
            }
        }catch (error) {
            setError('Erro ao verificar nickname');
            return;
        }finally{ 
            setLoading(false);
        }

        const userRef = doc(db, 'Users', userDetails.Uid);

        if (fileSend !== null){
            const maxSizeInMBCover = 5;
            const maxSizeInBytesCover = maxSizeInMBCover * 1024 * 1024;
            if (fileSend.size > maxSizeInBytesCover){
                setError('A foto de perfil pode ter no máximo 5 MB.');
                return;
            }
            try{
                const photo = await uploadFileToStorage(fileSend, 'Avatar');
                await updateDoc(userRef,{
                    Avatar:photo,
                    Nick:nick
                }).then((sucess)=>{
                    closeModal();
                    window.location.reload();
                }).catch((error)=>{
                    setError('Erro ao atualizar dados.');
                }).finally(()=>{
                    setLoading(false);
                })
            }catch(error){
                setError('Erro ao atualizar dados.');
            }finally{
                setLoading(false)
            }
        }else{
            await updateDoc(userRef,{
                Nick:nick
            }).then((sucess)=>{
                setError('');
                closeModal();
                window.location.reload();
                return;
            }).catch((error)=>{
                setError('Erro ao atualizar dados 2.');
            }).finally(()=>{
                setLoading(false);
            })
        }
    }

    async function handleDelete(){
        setLoading(true);
        const userRef = doc(db, "Users", userDetails.Uid);
        try{
            await updateDoc(userRef,{
                Avatar:null,
                Nick:nick
            }).then(async(sucess)=>{
                await deleteFileFromStorage(userDetails.Avatar);
                window.location.reload();
            }).catch((error)=>{

                setError('Erro ao deletar foto.');
            })
        }catch(error){
            setError('Erro ao deletar foto.');
        }finally{
            setLoading(false);
        }
        
    }
    useEffect(()=>{
        if (!isOpen){
            setNick(userDetails.Nick);
            setImg(userDetails.Avatar)
            setError('');
        }
    },[closeModal])
    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleSave}>
                <h1 className="modal-title">Detalhes do perfil</h1>
                <div className="modal-after-title">
                    <div className="img-nick-area">
                        <div className="img-and-button">
                            <label className="label-img">
                                <input type="file" accept=".jpeg, .png, .jpg" multiple={false} onChange={handleImageChange}/>
                                {img !== null ?(
                                    <img src={img} alt="perfil" className='userPerfilImg'/>
                                ):(<span className='userPerfilImg'>{userDetails.Name[0]}{userDetails.LastName[0]}</span>)}
                            </label>
                            {userDetails.Avatar ?(
                                <button className="button-delete-photo" onClick={handleDelete}><FaTrash/>Deletar</button>
                                )
                            :null}
                        </div>
                        <input type="text" placeholder="Seu nickname:" className="type-text" autoFocus={true}
                        value={nick} onChange={((e)=>setNick(e.target.value))} min={5} maxLength={20}/>
                    </div>
                </div>
                {error !== '' && (
                    <span className="card-error">{error}</span>
                    )}
                <div className="modal-buttons">
                    {!loading?(
                        <>
                            <button onClick={closeModal}type="reset">Cancelar</button>
                            <button type="submit">Salvar</button>
                        </>
                    ):(
                        <FaSpinner className="spinner" />
                    )}
                </div>
            </form>
        </Modal>
    )
}