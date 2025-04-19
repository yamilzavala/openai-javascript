import React from 'react';

const Loading = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-20 h-screen w-screen flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-solid"></div>
        </div>
    );
};

export default Loading;