import "./loading.css";
import { FaSpinner } from "react-icons/fa";


export default function Loading (){
    return(
        <section className="section-loading">
            <FaSpinner/>
        </section>
    )
}