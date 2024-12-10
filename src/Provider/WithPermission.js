import React from 'react';
// import { usePermissions } from 'react-admin';

const WithPermission = ({ children, allowedRoles }) => {
    // const { permissions } = usePermissions();

    // if (!permissions) {
    //     return <div>Loading...</div>;
    // }

    // if (allowedRoles?.includes(permissions)) {
    //     return <>{children}</>;
    // }

    return <><div style={{ display: "none" }}></div></>;
};

export default WithPermission;
