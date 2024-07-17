import "../Home/home.css";
import { useRef, useState, useContext } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import icon from "../../assets/icon.svg";
import { AuthContext } from "../../contexts/AuthContexts";

export default function Signup() {
    const [visibleInput1, setVisibleInput1] = useState(false);
    const [visibleInput2, setVisibleInput2] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);

    const nameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const passRef = useRef();
    const confirmPassRef = useRef();

    const { handleCreate, errorCreate, successCreate } = useContext(AuthContext);

    async function handleRegister(e) {
        e.preventDefault();
        setLoadingButton(true);
        
        await handleCreate(
            emailRef.current?.value,
            passRef.current?.value,
            confirmPassRef.current?.value,
            nameRef.current?.value,
            lastNameRef.current?.value
        );

        setLoadingButton(false);
    }

    return (
        <>
            <main className="bg-gradiente home-main">
                <section className="home-section">
                    <div className="h1-img">
                        <img src={icon} alt="icon" />
                        <h1>Inscreva-se no EnglishCast</h1>
                        {errorCreate !== '' && (
                            <span className="card-error">{errorCreate}</span>
                        )}

                        {successCreate !== '' && (
                            <span className="card-sucess">{successCreate}</span>
                        )}
                    </div>

                    <form className="form-sign" onSubmit={handleRegister}>
                        <label className="label-input">
                            <span>Primeiro nome</span>
                            <div className="input-area">
                                <input type="text" placeholder="Primeiro nome" ref={nameRef} />
                            </div>
                        </label>

                        <label className="label-input">
                            <span>Último nome</span>
                            <div className="input-area">
                                <input type="text" placeholder="Último nome" ref={lastNameRef} />
                            </div>
                        </label>

                        <label className="label-input">
                            <span>Email</span>
                            <div className="input-area">
                                <input type="text" placeholder="Email" ref={emailRef} />
                            </div>
                        </label>

                        <label className="label-input">
                            <span>Senha</span>
                            <div className="input-area">
                                <input
                                    type={visibleInput1 ? "text" : "password"}
                                    placeholder="Senha"
                                    ref={passRef}
                                />
                                {!visibleInput1 ? (
                                    <AiFillEyeInvisible onClick={() => setVisibleInput1(true)} />
                                ) : (
                                    <IoEyeSharp onClick={() => setVisibleInput1(false)} />
                                )}
                            </div>
                        </label>

                        <label className="label-input">
                            <span>Confirme a senha</span>
                            <div className="input-area">
                                <input
                                    type={visibleInput2 ? "text" : "password"}
                                    placeholder="Confirme a senha"
                                    ref={confirmPassRef}
                                />
                                {!visibleInput2 ? (
                                    <AiFillEyeInvisible onClick={() => setVisibleInput2(true)} />
                                ) : (
                                    <IoEyeSharp onClick={() => setVisibleInput2(false)} />
                                )}
                            </div>
                        </label>

                        {!loadingButton ? (
                            <button className="button-login" type="submit">Cadastrar</button>
                        ) : (
                            <FaSpinner className="spinner" />
                        )}
                    </form>

                    <div className="home-links">
                        <Link to={'/recovery'}>Esqueceu sua senha?</Link>
                        <Link to={'/'}>Já tem uma conta? Entre aqui</Link>
                    </div>
                </section>
            </main>
        </>
    )
}
