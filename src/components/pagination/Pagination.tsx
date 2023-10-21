import { useEffect, useState } from "react";

const useInfiniteScroll = (callback: (page: number) => void) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (windowHeight + scrollTop >= documentHeight - 200) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        callback(currentPage);
    }, [currentPage, callback]);
};

export default useInfiniteScroll;
