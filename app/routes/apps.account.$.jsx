import { useEffect, useState } from "react";



const Account = () => {
    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded(true);
    }, []);
    return <>
        {domLoaded && (
            <div>Test</div>
        )}
    </>
}

export default Account