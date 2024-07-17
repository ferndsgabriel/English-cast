import "./home.css";
import { useState, useRef } from "react";
import { AiFillEyeInvisible  } from "react-icons/ai";
import { IoEyeSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import icon from "../../assets/icon.svg";
import { AuthContext } from "../../contexts/AuthContexts";
import { useContext } from "react";

export default function Home (){
    const [visible,setVisible] = useState (false);

    const emailRef = useRef();
    const passRef = useRef();

    const {handleAuth, successAuth, errorAuth} = useContext(AuthContext);

    async function handleLogin(e){
        e.preventDefault();
        const emailSend = emailRef.current?.value;
        const passSend = passRef.current?.value;

        await handleAuth(emailSend, passSend);
    }

    return(
        <>
            <main className="bg-gradiente home-main">
                <section className="home-section">
                    <div className="h1-img">
                        <img src={icon} alt="icon"/>
                        <h1>Faça login no EnglishCast</h1>
                        {errorAuth !== '' && (
                            <span className="card-error">{errorAuth}</span>
                        )}

                        {successAuth !== '' && (
                            <span className="card-sucess">{successAuth}</span>
                        )}
                    </div>
                    <form className="form-sign" onSubmit={handleLogin}>
                        <label className="label-input" >
                            <span>Email</span>
                            <div className="input-area">
                                <input type="text" placeholder="Email" ref={emailRef}/>
                            </div>
                        </label>
                        
                        <label className="label-input">
                            <span>Senha</span>
                            <div className="input-area">
                                <input type={visible? "text" : "password"} placeholder="Senha" ref={passRef}/>
                                {!visible?(
                                    <AiFillEyeInvisible onClick={()=>setVisible(true)}/>
                                ):(
                                    <IoEyeSharp AiFillEyeInvisible onClick={()=>setVisible(false)}/>
                                )}
                            </div>
                        </label>

                        <button className="button-login">Logar</button>
                    </form>
                    <div className="home-links">
                        <Link to={'/recovery'}>Esqueceu sua senha?</Link>
                        <Link to={'/signup'}>Inscreva-se no English Every Day</Link>
                    </div>
                </section>
            </main>
        </>
    )
}