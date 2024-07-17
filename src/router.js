import {Routes, Route, Navigate} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContexts";

import Home from "./pages/Home";
import Recovery from "./pages/Recovery";
import Signup from "./pages/Signup";

import Start from "./pages/Start";
import Settings from "./pages/Settings";
import User from "./pages/User";
import Playlists from "./pages/Playlists";
import PlaylistwithId from "./pages/PlaylistwithId";
import Search from "./pages/Search";
import UserWithNick from "./pages/UserWithNick";

export default function RouterApp(){
    const {isAuthenticated} = useContext (AuthContext);

    return(
        <>
            {isAuthenticated ? (
                <Routes>
                    <Route path="/start" element={<Start/>}/>
                    <Route path="/settings" element={<Settings/>}/>
                    <Route path="/perfil" element={<User/>}/>
                    <Route path="/playlists" element={<Playlists/>}/>
                    <Route path="/playlists/:id" element={<PlaylistwithId/>}/>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/user/:nick" element={<UserWithNick/>}/>
                    <Route path="*" element={<Navigate to="/start" />} />
                </Routes>
            ):(
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/recovery" element={<Recovery/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            )}
        </>
    )
}