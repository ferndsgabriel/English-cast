import "./recovery.css";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import {sendPasswordResetEmail } from 'firebase/auth';
import { formatName } from "../../services/format";
import { getDocs, query, where, collection} from "firebase/firestore";
import { db, auth } from "../../services/firebase"; 
import icon from "../../assets/icon.svg";
import { FaSpinner } from "react-icons/fa";
import { isEmail } from 'validator';


export default function Recovery() {
    const emailRef = useRef();

    const [errorMessage, setErrorMessage] = useState('');
    const [sucessMessage, setSucessMessage] = useState('');

    const [loadingButton, setLoadingButton] = useState(false);

    async function handleEmail(e) {
        e.preventDefault();

        const email = formatName(emailRef.current?.value);

        if (!email){
            setSucessMessage('');
            setErrorMessage('Digite seu email.');
            return;
        }

        if (!isEmail(email)){
            setSucessMessage('');
            setErrorMessage('Digite um email válido.');
            return;
        }

        setLoadingButton(true);

        try {
            const q = query(collection(db, 'Users'), where('Email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setSucessMessage('');
                setErrorMessage('Nenhum usuário encontrado com o email.');
                setLoadingButton(false);
                return;
            }
            else{
                await sendPasswordResetEmail(auth, email).then(()=>{
                    setErrorMessage("");
                    setSucessMessage('Email de recuperação enviado com sucesso.');
                }).catch(()=>{
                    setSucessMessage("")
                    setErrorMessage('Erro ao enviar email de recuperação.');
                }).finally(()=>{
                    setLoadingButton(false);
                });
            }
        }catch(err){
            setSucessMessage("")
            setErrorMessage('Erro ao enviar email de recuperação.');
        }finally{
            setLoadingButton(false);
        }
    }

    return (
        <main className="main-recovery">
            <section className="section-recovey">
                <Link to={'/'}>
                    <img src={icon} alt="icon"/>
                </Link>
                <div className="before-logo">
                    <h1>Redefinir sua senha</h1>
                    <p>Digite seu endereço de e-mail e enviaremos um link para você voltar à sua conta.</p>
                    {errorMessage !== '' ?(
                        <span className="card-error">{errorMessage}</span>
                    ):null}

                    {sucessMessage !== '' ?(
                        <span className="card-sucess">{sucessMessage}</span>
                    ):null}     
                    <form className="form-recovery" onSubmit={handleEmail}>
                        <label className="label-input">
                            <span>Email</span>
                            <div className="input-area">
                                <input type="text" placeholder="Email" ref={emailRef} />
                            </div>
                        </label>
                        {!loadingButton ? (
                        <button className="button-login" type="submit">Enviar link</button>
                        ):(
                            <FaSpinner className="spinner"/>
                        )}
                    </form>
                </div>
            </section>
        </main>
    )
}
