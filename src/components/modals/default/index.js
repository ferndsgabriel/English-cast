import "./default.css";
import { useState, useEffect } from "react";

export default function Modal ({children, isOpen, closeModal}){

    const [openModal, setOpenModal] = useState (isOpen);

    useEffect(()=>{
        setOpenModal(isOpen)
    }, [isOpen]);

    function handleClose (){
        closeModal()
    } 
    function handleClickInside(event) {
        event.stopPropagation();
    }

    useEffect(() => {
        function closeWithEscape(e) {
            if (e.key === 'Escape') {
                handleClose();
            }
        }

        document.addEventListener("keydown", closeWithEscape);
        
        return () => {
            document.removeEventListener("keydown", closeWithEscape);
        };
    }, []);


    return(
        <>
            {openModal ?(
                <section className="overlay-modal" onClick={handleClose}>
                    <div onClick={handleClickInside}>
                        {children}
                    </div>
                </section>
            ):null}
        </>
    )
}