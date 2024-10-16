import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const showToastr = (type, message, duration = 5000) => {
    toast(message, {
        type: type,
        position: "bottom-right",
        autoClose: duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
};

export default showToastr;
