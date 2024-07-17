import { createContext, useState, useEffect } from "react";
import { auth, db } from '../services/firebase';
import { doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { formatName } from "../services/format";
import { isEmail } from 'validator';
import zxcvbn from 'zxcvbn';
import { collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { setCookie, destroyCookie, parseCookies } from "nookies";
import Loading from "../components/loading";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [userDetails, setUserDetails] = useState(null);
    const [errorCreate, setErrorCreate] = useState('');
    const [successCreate, setSuccessCreate] = useState('');
    const [successAuth, setSuccessAuth] = useState('');
    const [errorAuth, setErrorAuth] = useState('');

    const [isLoadingAuthenticated, setIsLoadingAuthenticated] = useState (true);

    const navigate = useNavigate();

    async function handleCreate(email, pass, confirmPass, name, lastName) {
        
        if (!email || !pass || !confirmPass || !name || !lastName) {
            setSuccessCreate('');
            setErrorCreate('Digite todos os dados.');
            return;
        }
        if (pass !== confirmPass) {
            setSuccessCreate('');
            setErrorCreate('Senhas diferentes.');
            return;
        }
        if (name.length < 3 || lastName.length < 3) {
            setSuccessCreate('');
            setErrorCreate('Digite um nome válido.');
            return;
        }
        if (name.includes(" ") || lastName.includes(" ")) {
            setSuccessCreate('');
            setErrorCreate('Digite um nome válido.');
            return;
        }
        if (zxcvbn(pass).score < 3) {
            setSuccessCreate('');
            setErrorCreate('A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.');
            return;
        }

        const userEmail = formatName(email);
        
        if (!isEmail(userEmail)) {
            setSuccessCreate('');
            setErrorCreate('Digite um email válido.');
            return;
        }
        
        const q = query(collection(db, "Users"), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setSuccessCreate('');
            setErrorCreate("Email já cadastrado.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userEmail, pass);
            const uid = userCredential.user.uid;

            const userDocRef = doc(db, "Users", uid);
            const timestamp = new Date().getTime();
            await setDoc(userDocRef,{
                Uid:uid,
                Email: formatName(userEmail),
                Name: formatName(name),
                LastName: formatName(lastName),
                Nick:timestamp.toString(),
                Avatar:null,
            });

            setSuccessCreate('Usuário criado com sucesso!');
            setErrorCreate('');
            setTimeout(()=>{
                navigate('/');
            },[1000]);
        } catch (error) {
            setSuccessCreate('');
            setErrorCreate('Erro ao criar usuário.');
        }
    }

    async function handleAuth(email, pass) {
        const userEmail = formatName(email);

        if (!email || !pass){
            setSuccessAuth('');
            setErrorAuth('Digite todos os campos.');
            return;
        }
        if (!isEmail(userEmail)) {
            setSuccessAuth('');
            setErrorAuth('Digite um email válido.');
            return;
        }

        await signInWithEmailAndPassword(auth, userEmail, pass).then(async(value)=>{
            setSuccessAuth('');
            setErrorAuth('');
            let id = value.user.uid;
            const docRef = doc(db, "Users", id);

            await getDoc(docRef).then((value)=>{
                let data = ({
                    Email:value.data().Email,
                    Name:value.data().Name,
                    LastName:value.data().LastName,
                    Uid:value.data().Uid,
                    Avatar:value.data().Avatar,
                    Nick:value.data().Nick
                });
                setUserDetails(data);
                setCookie(undefined, "@EnglishCast.token", data.Uid,{
                    maxAge:60*60*24*30,
                    path:"/",
                });
                navigate('/start');
            }).catch((error)=>{
                setSuccessAuth('');
                setErrorAuth('Erro ao logar.');
            });

        }).catch((error)=>{
            setSuccessAuth('');
            setErrorAuth('Erro ao logar.');
        })
    }

    function signOut(){
        try{
            destroyCookie(undefined, '@EnglishCast.token');
            setUserDetails(null);
            navigate('/');
        }catch(error){
            console.log('Erro ao deslogar.');
        }
    }

    useEffect(()=>{
        async function verifyAuth(){
            const {'@EnglishCast.token':authToken} = parseCookies();

            if (authToken){
                const docRef = doc(db, "Users", authToken);
                await getDoc(docRef).then(async(value)=>{
                    let data = ({
                        Email:value.data().Email,
                        Name:value.data().Name,
                        LastName:value.data().LastName,
                        Uid:value.data().Uid,
                        Avatar:value.data().Avatar,
                        Nick:value.data().Nick
                    });
                    setUserDetails(data);
                    setIsLoadingAuthenticated(false);
                }).catch((error)=>{
                    console.log('Erro ao obter dados.');
                    signOut();
                    setIsLoadingAuthenticated(false);
                });
            }else{
                setIsLoadingAuthenticated(false);
                console.log('Falta de cookie.');
            }
            
        }
        verifyAuth();
        
    },[]);
    
    if (isLoadingAuthenticated){
        return(
            <Loading/>
        )
    }

    return (
        <AuthContext.Provider value={{ 
        userDetails, 
        isAuthenticated:!!userDetails, 
        handleAuth, 
        handleCreate, 
        errorCreate, 
        successCreate,
        successAuth,
        errorAuth,
        signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext };
