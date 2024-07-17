import Modal from "../default";
import { IoMdPhotos } from "react-icons/io";
import { FaMusic } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import uploadFileToStorage from "../../../services/firebaseUpload";
import {db} from "../../../services/firebase";
import {addDoc, doc, collection} from "firebase/firestore";
import { useContext } from "react";
import {AuthContext} from "../../../contexts/AuthContexts";


export default function UploadFile({isOpen, closeModal}){
    const [loading, setLoading] = useState(false);
    const nameRef = useRef();
    const selectRef = useRef();
    const coverRef = useRef();
    const audioRef = useRef();
    const [audioName, setAudioName] = useState(''); 
    const [coverName, setCoverName] = useState(''); 
    const [error, setError] = useState ("");
    const {userDetails} = useContext(AuthContext);
    const uid = userDetails.Uid;

    function handleCover(){
        const fileName = coverRef.current?.files[0].name;
        setCoverName(fileName)
    }

    function handleAudio(){
        const fileName = audioRef.current?.files[0].name;
        setAudioName(fileName)
    }

    async function handleMusic(e) {
        e.preventDefault();
        setError('');
        const name = nameRef.current?.value;
        const level = selectRef.current?.value;

        if (!name || !level) {
            setError('Preencha todos os campos.');
            return;
        }
        if (coverRef.current?.files[0] === undefined || audioRef.current?.files[0] === undefined){
            setError('Preencha todos os campos.');
            return;
        }
        const maxSizeInMBCover = 5;
        const maxSizeInBytesCover = maxSizeInMBCover * 1024 * 1024;
        const maxSizeInMBSong = 7;
        const maxSizeInBytesSong =  maxSizeInMBSong * 1024 * 1024;

        if (coverRef.current?.files[0].size >  maxSizeInBytesCover){
            setError('A capa do arquivo pode ter no máximo 5 MB.');
            return;
        }
        if (audioRef.current?.files[0].size >  maxSizeInBytesSong){
            setError('O arquivo de áudio pode ter no máximo 20 MB.');
            return;
        }

        setLoading(true);

        try {
            const coverLocal = await uploadFileToStorage(coverRef.current?.files[0], 'covers');
            const songLocal = await uploadFileToStorage(audioRef.current?.files[0], 'songs');
            const userRef = doc(db, "Users", uid);
            
            const date = new Date();
            const timestamp = date.getTime();
            const songDocRef = await addDoc(collection(db, 'Songs'), {
                Name: name,
                Level: level,
                Cover: coverLocal,
                Audio: songLocal,
                Author:userRef,
                Id:timestamp.toString(),
                Status:null
            });
            closeModal();
            return;
        } catch (error) {
            setError('Erro ao adicionar música.');
            return;
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if (!isOpen){
            setAudioName('');
            setCoverName('');
            setError('');
        }
    },[closeModal])

    return(
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modal-default" onSubmit={handleMusic}>
                <h1 className="modal-title">Criar áudio</h1>
                <div className="modal-after-title">
                <label className="modal-label">
                    <span>Nome do áudio:</span>
                    <input type="text" placeholder="Digite o nome da playlist"
                    autoFocus={true}
                    ref={nameRef}
                    minLength={3}
                    maxLength={30}/>
                </label>
                
                <label className="modal-label">
                    <span>Nível do áudio:</span>
                    <select ref={selectRef}>
                        <option>Iniciante</option>
                        <option>Básico</option>
                        <option>Intermediário</option>
                        <option>Intermediário Avançado</option>
                        <option>Avançado</option>
                        <option>Proficiente</option>
                    </select>
                </label>

                <label className="modal-label">
                    <span>Capa:</span>
                    <input type="file" accept=".jpeg,.png, .jpg" multiple={false} ref={coverRef} onChange={handleCover}/>
                    <div className="modal-file">
                        <IoMdPhotos/>
                        {coverName !== '' ? (<span>{coverName}</span>):null}
                    </div>
                </label>

                <label className="modal-label">
                    <span>Áudio:</span>
                    <input type="file" accept=".mp3" multiple={false} ref={audioRef} onChange={handleAudio}/>
                    <div className="modal-file">
                        < FaMusic/>
                        {audioName !== '' ? (<span>{audioName}</span>):null}
                    </div>
                </label>

                {error !== '' && (
                    <span className="card-error">{error}</span>
                )}

                </div>
                <div className="modal-buttons">
                        {!loading?(
                            <>
                                <button onClick={closeModal} type="reset">Cancelar</button>
                                <button type="submit">Criar</button>
                            </>
                        ):(
                            <FaSpinner className="spinner" />
                        )}
                        
                    </div>
            </form>
        </Modal>
    )
}